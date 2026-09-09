import express from 'express';
import { createClient } from '@libsql/client';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const turso = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await turso.execute('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM orders');
    res.json(result.rows);
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auth bootstrap
app.post('/api/auth/admin/bootstrap', async (req, res) => {
  try {
    res.json({ success: true, message: 'Bootstrap successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3007;
  app.listen(PORT, () => {
    console.log(`Admin backend running on port ${PORT}`);
  });
}
