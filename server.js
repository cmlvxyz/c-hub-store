// server.js
// Vercel-compatible entry point that exposes the FULL C-HUB Express app
// (products, orders, vouchers, auth, payments, reviews, notifications, SSE...).
// It is the same app used by server/index.ts (local, port 3006) and
// api/index.ts (Vercel serverless). vercel.json routes /api/* here.

import 'dotenv/config';
import { ensureReady } from './server/bootstrap.js';
import { app } from './server/app.js';

async function handler(req, res) {
  await ensureReady();
  return app(req, res);
}

export default handler;

if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3007;
  app.listen(PORT, () => {
    console.log(`C-HUB API ready on http://localhost:${PORT}/api  (health: /api/health)`);
  });
}