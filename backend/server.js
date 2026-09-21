import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

// Angular build output; falls back to the static landing page while no build exists.
const frontendDir = path.resolve(__dirname, '../frontend/dist/frontend/browser');
const staticDir = fs.existsSync(frontendDir) ? frontendDir : path.join(__dirname, 'public');

// Behind nginx: trust X-Forwarded-* so secure cookies and req.ip work later.
app.set('trust proxy', 1);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.use(express.static(staticDir));

// SPA fallback: every non-API route is handled by the Angular router.
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Terminbuchung backend listening on port ${port}, serving ${staticDir}`);
});
