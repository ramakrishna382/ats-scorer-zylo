import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Route for Google AdSense verification file
app.get('/ads.txt', (req, res) => {
  res.type('text/plain');
  res.send('google.com, pub-8681805901258340, DIRECT, f08c47fec0942fa0\n');
});

// Serve static files from compiled Vite client
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zylo Connect Portal running on port ${PORT}`);
});
