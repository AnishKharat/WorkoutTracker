const express = require('express');
const cors = require('cors');
const { port, clientOrigin } = require('./config/env');
const db = require('./db/pool');
const { authRoutes } = require('./routes/authRoutes');
const { syncRoutes } = require('./routes/syncRoutes');

const app = express();

app.use(cors({
  origin: clientOrigin === '*' ? true : clientOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ ok: true });
  } catch (error) {
    console.error('health error', error);
    return res.status(500).json({ ok: false });
  }
});

app.use('/auth', authRoutes);
app.use('/sync', syncRoutes);

app.use((err, _req, res, _next) => {
  console.error('unhandled error', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`WorkoutTracker backend listening on http://localhost:${port}`);
});
