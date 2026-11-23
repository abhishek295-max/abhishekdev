require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const express = require('express');
const helmet = require('helmet');
const path = require('node:path');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  } else if (origin && allowedOrigins.length && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: 'Origin is not allowed.' });
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin && !allowedOrigins.includes(origin) ? 403 : 204);
  next();
});
app.use(express.json({ limit: '12kb', strict: true }));
app.use('/api/contact', contactRoutes);
app.get('/', (_req, res) => res.sendFile(path.resolve(__dirname, '../file.html')));
app.get('/resume.pdf', (_req, res) => res.download(path.resolve(__dirname, '../resume.pdf'), 'Abhishek-Samadhiya-Java-Resume.pdf'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Please submit valid JSON.' });
  }
  console.error('Request failed:', error.message);
  return res.status(500).json({ message: 'The request could not be completed.' });
});
if (require.main === module) app.listen(port, () => console.log(`Portfolio server listening on port ${port}`));

module.exports = app;
