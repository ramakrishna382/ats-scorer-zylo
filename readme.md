# Week 1 Build Plan: Resume ATS Scorer
**Stack:** Node.js + Express + React + Vite + Claude API + Stripe  
**Goal:** Live product with paying customers by Friday  
**Domain:** Point your Namecheap domain here at end of week

---

## 1. What We Are Building

A web app where users paste a job description and their resume. The app returns:
- ATS compatibility score (0–100)
- Matched keywords (green), missing keywords (red), under-emphasized keywords (amber)
- Per-section rewrite suggestions (Summary, Experience, Skills)
- Quick wins list
- 3 free analyses per user, then $9 one-time Stripe gate

---

## 2. Folder Structure

```
ats-scorer/
├── backend/
│   ├── index.js              # Express server entry point
│   ├── routes/
│   │   ├── analyze.js        # POST /api/analyze
│   │   └── stripe.js         # POST /api/create-checkout, POST /api/webhook
│   ├── middleware/
│   │   └── rateLimit.js      # 3 free requests per IP per day
│   ├── .env                  # secrets (never commit)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── InputPanel.jsx
│   │   │   ├── ScoreCircle.jsx
│   │   │   ├── KeywordPanel.jsx
│   │   │   ├── RewriteCard.jsx
│   │   │   ├── Paywall.jsx
│   │   │   └── LoadingState.jsx
│   │   ├── hooks/
│   │   │   └── useAnalyze.js
│   │   └── styles/
│   │       └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 3. Backend

### 3.1 Setup

```bash
mkdir ats-scorer && cd ats-scorer
mkdir backend && cd backend
npm init -y
npm install express cors dotenv @anthropic-ai/sdk stripe express-rate-limit
```

### 3.2 `.env` file (backend/)

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxx
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3.3 `backend/index.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRoute = require('./routes/analyze');
const stripeRoute = require('./routes/stripe');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/stripe', stripeRoute);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
```

### 3.4 `backend/routes/analyze.js`

```javascript
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 3 free requests per IP per day
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: { error: 'FREE_LIMIT_REACHED', message: 'Daily free limit reached' },
  skip: (req) => req.body.isPaid === true, // skip limit for paid users
});

router.post('/', limiter, async (req, res) => {
  const { jobDescription, resume } = req.body;

  if (!jobDescription || !resume) {
    return res.status(400).json({ error: 'Both jobDescription and resume are required' });
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and resume coach.

Analyze the resume against the job description and return ONLY valid JSON (no markdown, no backticks, no explanation) in exactly this structure:

{
  "overallScore": <number 0-100>,
  "breakdown": {
    "keywords": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>,
    "formatting": <number 0-100>
  },
  "matchedKeywords": [<array of strings, max 12>],
  "missingKeywords": [<array of strings, max 12>],
  "partialKeywords": [<array of strings, max 6>],
  "rewrites": [
    {
      "section": "<Summary | Experience | Skills | Education>",
      "issue": "<what is wrong, one sentence>",
      "suggestion": "<specific rewritten text or concrete improvement>"
    }
  ],
  "quickTips": [
    "<tip 1>",
    "<tip 2>",
    "<tip 3>"
  ]
}

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

RESUME:
${resume.substring(0, 3000)}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: 'Analysis failed', detail: err.message });
  }
});

module.exports = router;
```

### 3.5 `backend/routes/stripe.js`

```javascript
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session — user pays $9
router.post('/create-checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/?cancelled=true`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook — confirm payment server-side
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // TODO: store paid session ID in DB to validate on future requests
    console.log('Payment confirmed:', session.id);
  }

  res.json({ received: true });
});

module.exports = router;
```

---

## 4. Frontend

### 4.1 Setup

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4.2 `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

This proxy means all `/api/*` calls from React in dev go to Express. No CORS issues, no API key exposure.

### 4.3 `frontend/src/hooks/useAnalyze.js`

```javascript
import { useState } from 'react';
import axios from 'axios';

const FREE_LIMIT = 3;
const STORAGE_KEY = 'ats_usage';

function getUsage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { count: 0, isPaid: false };
  return JSON.parse(raw);
}

function incrementUsage() {
  const usage = getUsage();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function useAnalyze() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(getUsage);

  const analyze = async (jobDescription, resume) => {
    const current = getUsage();

    if (current.count >= FREE_LIMIT && !current.isPaid) {
      setError('FREE_LIMIT_REACHED');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/analyze', {
        jobDescription,
        resume,
        isPaid: current.isPaid,
      });
      const updated = incrementUsage();
      setUsage(updated);
      setResult(data);
    } catch (err) {
      if (err.response?.data?.error === 'FREE_LIMIT_REACHED') {
        setError('FREE_LIMIT_REACHED');
      } else {
        setError(err.response?.data?.detail || 'Analysis failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const initiateCheckout = async () => {
    try {
      const { data } = await axios.post('/api/stripe/create-checkout');
      window.location.href = data.url;
    } catch (err) {
      setError('Could not start checkout. Try again.');
    }
  };

  // Call this on page load if ?paid=true in URL
  const confirmPayment = () => {
    const usage = getUsage();
    usage.isPaid = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    setUsage(usage);
  };

  return { result, loading, error, usage, analyze, initiateCheckout, confirmPayment, FREE_LIMIT };
}
```

### 4.4 `frontend/src/App.jsx`

```jsx
import { useEffect } from 'react';
import { useAnalyze } from './hooks/useAnalyze';
import InputPanel from './components/InputPanel';
import ScoreCircle from './components/ScoreCircle';
import KeywordPanel from './components/KeywordPanel';
import RewriteCard from './components/RewriteCard';
import Paywall from './components/Paywall';
import LoadingState from './components/LoadingState';

export default function App() {
  const { result, loading, error, usage, analyze, initiateCheckout, confirmPayment, FREE_LIMIT } = useAnalyze();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') {
      confirmPayment();
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const creditsLeft = Math.max(0, FREE_LIMIT - usage.count);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <div className="max-w-4xl mx-auto px-5 py-10">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-serif text-white">
            ATS<span className="text-purple-400 italic">match</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            See exactly why your resume gets rejected — before it does.
          </p>
          {!usage.isPaid && (
            <p className="text-xs text-gray-600 mt-1">
              {creditsLeft} free {creditsLeft === 1 ? 'analysis' : 'analyses'} remaining
            </p>
          )}
        </header>

        {/* Input */}
        <InputPanel onAnalyze={analyze} loading={loading} />

        {/* States */}
        {loading && <LoadingState />}

        {!loading && error === 'FREE_LIMIT_REACHED' && (
          <Paywall onCheckout={initiateCheckout} />
        )}

        {!loading && error && error !== 'FREE_LIMIT_REACHED' && (
          <div className="mt-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && result && (
          <div className="mt-8 space-y-6">
            {/* Score */}
            <div className="bg-[#13131a] border border-[#2a2a38] rounded-xl p-6 flex items-center gap-6">
              <ScoreCircle score={result.overallScore} />
              <div>
                <h2 className="text-xl font-medium">{getScoreLabel(result.overallScore)}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Based on keyword match, experience alignment, skills coverage, and formatting signals.
                </p>
              </div>
            </div>

            {/* Breakdown */}
            {result.breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.breakdown).map(([key, val]) => (
                  <div key={key} className="bg-[#13131a] border border-[#2a2a38] rounded-lg p-3">
                    <div className="text-xs text-gray-500 capitalize mb-1">{key}</div>
                    <div className="text-lg font-mono" style={{ color: getScoreColor(val) }}>
                      {val}<span className="text-xs text-gray-600">/100</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Keywords */}
            <KeywordPanel
              matched={result.matchedKeywords}
              missing={result.missingKeywords}
              partial={result.partialKeywords}
            />

            {/* Rewrites */}
            {result.rewrites?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Section rewrites</h3>
                {result.rewrites.map((rw, i) => <RewriteCard key={i} rewrite={rw} />)}
              </div>
            )}

            {/* Quick tips */}
            {result.quickTips?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Quick wins</h3>
                {result.quickTips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start mb-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span className="text-gray-400 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getScoreColor(s) {
  if (s >= 80) return '#3dd68c';
  if (s >= 60) return '#f7b96c';
  return '#f76c6c';
}

function getScoreLabel(s) {
  if (s >= 80) return 'Strong match — apply with confidence';
  if (s >= 60) return 'Moderate match — optimize before applying';
  if (s >= 40) return 'Weak match — significant gaps found';
  return 'Poor match — major rework needed';
}
```

### 4.5 `frontend/src/components/InputPanel.jsx`

```jsx
import { useState } from 'react';

export default function InputPanel({ onAnalyze, loading }) {
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setResume(ev.target.result);
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!jd.trim() || !resume.trim()) {
      alert('Please paste both a job description and your resume.');
      return;
    }
    onAnalyze(jd, resume);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#13131a] border border-[#2a2a38] rounded-xl p-4">
          <label className="text-xs uppercase tracking-widest text-gray-500 block mb-2">
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full bg-[#1c1c26] border border-[#2a2a38] rounded-lg text-white text-sm p-3 resize-y outline-none focus:border-purple-500 placeholder-gray-600"
          />
        </div>
        <div className="bg-[#13131a] border border-[#2a2a38] rounded-xl p-4">
          <label className="text-xs uppercase tracking-widest text-gray-500 block mb-2">
            Your Resume
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={6}
            className="w-full bg-[#1c1c26] border border-[#2a2a38] rounded-lg text-white text-sm p-3 resize-y outline-none focus:border-purple-500 placeholder-gray-600"
          />
          <label className="mt-2 flex items-center justify-center border border-dashed border-[#3a3a50] rounded-lg p-3 text-gray-500 text-xs cursor-pointer hover:border-purple-500 hover:text-purple-400 transition-colors">
            <input type="file" accept=".txt" className="hidden" onChange={handleFile} />
            ↑ Upload .txt resume
          </label>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze My Resume'}
      </button>
    </div>
  );
}
```

### 4.6 `frontend/src/components/ScoreCircle.jsx`

```jsx
export default function ScoreCircle({ score }) {
  const color = score >= 80 ? '#3dd68c' : score >= 60 ? '#f7b96c' : '#f76c6c';
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a38" strokeWidth="7" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color }}>
        {score}
      </div>
    </div>
  );
}
```

### 4.7 `frontend/src/components/KeywordPanel.jsx`

```jsx
export default function KeywordPanel({ matched = [], missing = [], partial = [] }) {
  return (
    <div className="space-y-4">
      {matched.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            ✓ Matched keywords ({matched.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matched.map(k => (
              <span key={k} className="text-xs px-2 py-1 rounded-full font-mono bg-green-950 text-green-400 border border-green-900">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            ✗ Missing — add these ({missing.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing.map(k => (
              <span key={k} className="text-xs px-2 py-1 rounded-full font-mono bg-red-950 text-red-400 border border-red-900">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      {partial.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            ~ Under-emphasized — strengthen these
          </h3>
          <div className="flex flex-wrap gap-2">
            {partial.map(k => (
              <span key={k} className="text-xs px-2 py-1 rounded-full font-mono bg-amber-950 text-amber-400 border border-amber-900">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.8 `frontend/src/components/RewriteCard.jsx`

```jsx
export default function RewriteCard({ rewrite }) {
  return (
    <div className="bg-[#1c1c26] border border-[#2a2a38] rounded-lg p-4 mb-3">
      <div className="text-xs uppercase tracking-widest text-purple-400 mb-1">{rewrite.section}</div>
      <div className="text-xs text-gray-500 mb-2">{rewrite.issue}</div>
      <div className="text-sm text-gray-300 leading-relaxed">{rewrite.suggestion}</div>
    </div>
  );
}
```

### 4.9 `frontend/src/components/Paywall.jsx`

```jsx
export default function Paywall({ onCheckout }) {
  return (
    <div className="mt-8 bg-[#13131a] border border-purple-800 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-serif mb-2">You have used your 3 free analyses</h2>
      <p className="text-gray-500 text-sm mb-6">
        Get unlimited analyses, full section rewrites, and priority keyword suggestions.
      </p>
      <div className="text-4xl font-serif text-purple-400 mb-1">
        $9 <span className="text-sm font-sans text-gray-500">one-time payment</span>
      </div>
      <button
        onClick={onCheckout}
        className="mt-5 bg-purple-600 hover:bg-purple-500 text-white font-medium px-8 py-3 rounded-lg transition-colors"
      >
        Unlock unlimited access →
      </button>
      <p className="text-xs text-gray-600 mt-3">No subscription · Instant access · Secure checkout</p>
    </div>
  );
}
```

### 4.10 `frontend/src/components/LoadingState.jsx`

```jsx
export default function LoadingState() {
  return (
    <div className="mt-8 text-center text-gray-500">
      <div className="inline-block w-6 h-6 border-2 border-[#2a2a38] border-t-purple-500 rounded-full animate-spin mb-3" />
      <p className="text-sm">Analyzing your resume against the job description...</p>
    </div>
  );
}
```

---

## 5. Stripe Setup (Day 4)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and create an account
2. Create a Product: name = "ATS Scorer Unlimited", price = $9.00 USD, one-time
3. Copy the **Price ID** (starts with `price_`) → paste into `.env` as `STRIPE_PRICE_ID`
4. Copy **Secret Key** → paste into `.env` as `STRIPE_SECRET_KEY`
5. For webhooks: go to Stripe → Developers → Webhooks → Add endpoint
   - URL: `https://your-backend-url.railway.app/api/stripe/webhook`
   - Event: `checkout.session.completed`
   - Copy the **Signing Secret** → paste into `.env` as `STRIPE_WEBHOOK_SECRET`

---

## 6. Deployment (Day 5)

### Frontend → Vercel

```bash
cd frontend
npm run build
# Push to GitHub, then import repo in vercel.com
# Set env var: VITE_API_URL = https://your-backend.railway.app
```

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → set root directory to `backend/`
3. Add all env vars from `.env` in Railway dashboard
4. Railway gives you a URL like `https://ats-scorer-production.up.railway.app`

### Domain (Namecheap)

1. In Vercel: go to your project → Settings → Domains → add your domain
2. Vercel shows you two DNS records (A record + CNAME)
3. In Namecheap: go to DNS → Advanced DNS → paste those two records
4. Wait 10–30 minutes for propagation

---

## 7. Day-by-Day Schedule

| Day | Focus | Done when |
|-----|-------|-----------|
| Monday | Backend setup + `/api/analyze` route working | `curl -X POST localhost:3001/api/analyze` returns valid JSON |
| Tuesday | React frontend connected to backend, full UI working locally | Paste JD + resume → see score, keywords, rewrites |
| Wednesday | Rate limiting tested, paywall UI shown after 3 uses | 4th analysis blocked, paywall displayed |
| Thursday | Stripe checkout working end-to-end in test mode | Can pay $0.00 test card, get redirected back, paywall gone |
| Friday | Deploy to Vercel + Railway, point domain, post launch | Live URL working, first post on Reddit r/resumes |

---

## 8. Launch Posts (Friday)

**Reddit r/resumes:**
> "I built a free tool that tells you exactly which keywords your resume is missing for any job. Scores your ATS compatibility 0–100. First 3 analyses are free. Would love feedback from real job seekers."

**Reddit r/jobs, r/cscareerquestions:**
> Same message, slightly reworded.

**LinkedIn:**
> "Week 1 of building one useful thing per week. Shipped an ATS resume scorer — paste a job description, paste your resume, get a match score + missing keywords + rewrite suggestions. Free to try. Link in comments."

**IndieHackers:**
> Post in "What are you building?" with before/after screenshot of a score improving.

---

## 9. Environment Variables Summary

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Developers → Webhooks |
| `STRIPE_PRICE_ID` | dashboard.stripe.com → Products → your product → price ID |
| `FRONTEND_URL` | `http://localhost:5173` in dev, your Vercel URL in prod |

---

