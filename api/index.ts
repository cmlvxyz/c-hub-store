// api/index.ts
// Vercel serverless function entry point — exposes the same C-HUB Express app.
// Vercel rewrites /api/* here; the SPA is served as static files.
// The shared Turso schema/seed provision lazily once per warm instance.

import { ensureReady } from '../server/bootstrap.js';
import { app } from '../server/app.js';

export default async function handler(req: any, res: any) {
  await ensureReady();
  return app(req, res);
}