require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const projectRoutes = require('./routes/projectRoutes');
const crossOriginIsolation = require('./middleware/crossOriginIsolation');

const app = express();

app.use(crossOriginIsolation);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: false }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/projects', projectRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('[server]', err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI).finally(() => {
  app.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
});
