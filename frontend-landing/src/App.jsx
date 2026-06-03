import React, { useEffect, useRef } from 'react';

function NeuralCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = Math.min(80, Math.floor((width * height) / 20000));
    const connectionDistance = 120;
    const mouse = { x: null, y: null, radius: 150 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 0.8;
            this.y -= (dy / dist) * force * 0.8;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" />;
}

const appsList = [
  {
    title: "Resume ATS scorer",
    description: "Paste a job description + resume. Get ATS match %, missing keywords, rewrite suggestions.",
    tags: ["ai", "indie"],
    status: "active",
    url: "https://atsscore.zyloconnect.com",
    isHot: true
  },
  {
    title: "Contract plain-English explainer",
    description: "Upload any contract (NDA, lease, offer letter). Get a plain-English summary + red flags.",
    tags: ["ai", "saas"],
    status: "upcoming",
    isHot: true
  },
  {
    title: "LinkedIn post generator",
    description: "Input: topic + tone + your experience. Output: post with hooks, formatting, hashtags.",
    tags: ["ai", "indie"],
    status: "upcoming"
  },
  {
    title: "PR description generator",
    description: "Connect GitHub. Auto-write PR descriptions from diffs — what changed, why, testing notes.",
    tags: ["api", "ai"],
    status: "upcoming",
    isHot: true
  },
  {
    title: "Invoice data extractor",
    description: "Upload a pile of invoices (PDF/image). Get structured CSV with vendor, amount, date, category.",
    tags: ["ai", "saas"],
    status: "upcoming"
  },
  {
    title: "Cold email personalizer",
    description: "Paste a LinkedIn URL or company name. Get a hyper-personalized cold email in 10 seconds.",
    tags: ["ai", "indie"],
    status: "upcoming"
  },
  {
    title: "Stack Overflow for your codebase",
    description: "Connect a GitHub repo. Ask questions in plain English. Get answers grounded in your actual code.",
    tags: ["api", "ai"],
    status: "upcoming",
    isHot: true
  },
  {
    title: "SaaS metrics dashboard",
    description: "Connect Stripe. Auto-generate MRR, churn, LTV, cohort analysis in one clean dashboard.",
    tags: ["saas", "api"],
    status: "upcoming"
  },
  {
    title: "AI quiz generator from any content",
    description: "Paste a blog post, PDF, or YouTube URL. Get a 10-question quiz with answers and explanations.",
    tags: ["ai", "indie"],
    status: "upcoming"
  },
  {
    title: "Product changelog writer",
    description: "Input your git commits or bullet points. Output: beautiful, user-facing changelog in your brand voice.",
    tags: ["ai", "saas"],
    status: "upcoming"
  },
  {
    title: "Meeting summary + action extractor",
    description: "Paste or upload a meeting transcript. Get summary, decisions made, and action items with owners.",
    tags: ["ai", "saas"],
    status: "upcoming",
    isHot: true
  },
  {
    title: "Freelancer rate calculator",
    description: "Input your skills, location, experience. Get market rate range with negotiation tips backed by real data.",
    tags: ["ai", "indie"],
    status: "upcoming"
  }
];

function App() {
  return (
    <div className="app-container">
      <NeuralCanvas />
      
      <div className="content-wrapper">
        <header className="hero-section">
          <div className="logo-glow"></div>
          <h1 className="main-title">ZYLO CONNECT</h1>
          <p className="subtitle">The Neural Network of Global Streams</p>
          <div className="divider"></div>
          <p className="description">
            Connecting nodes, streaming data, and synchronizing applications into a singular, intelligent digital ecosystem.
          </p>
        </header>

        <main className="grid-container">
          {appsList.map((app, index) => (
            <div 
              key={index} 
              className={`app-card ${app.status === 'active' ? 'active-card' : 'upcoming-card'}`}
            >
              {app.isHot && <span className="badge-hot">hot</span>}
              <h2 className="card-title">
                {app.title}
              </h2>
              <p className="card-description">{app.description}</p>
              
              <div className="tags-container">
                {app.tags.map((tag, tIndex) => (
                  <span key={tIndex} className={`tag tag-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="card-action">
                {app.status === 'active' ? (
                  <a 
                    href={app.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn active-btn"
                  >
                    Launch App 
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  </a>
                ) : (
                  <button className="action-btn upcoming-btn" disabled>
                    Connecting Node...
                  </button>
                )}
              </div>
            </div>
          ))}
        </main>

        <footer className="footer">
          <p>© 2026 Zylo Connect. Developed by RK.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
