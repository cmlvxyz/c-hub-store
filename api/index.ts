// api/index.ts
// Vercel serverless function entry point — exposes the same C-HUB Express app.
// Vercel rewrites /api/* here; the SPA is served as static files.
// The shared Turso schema/seed provision lazily once per warm instance.

import { ensureReady } from '../server/bootstrap.js';
import { app } from '../server/app.js';

// Allow longer cold starts (ensureReady + shared-DB seed run on first call per
// warm instance). Vercel supports up to 60s for Node functions.
export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  try {
    await ensureReady();
  } catch (err) {
    console.error('📡 C-HUB function startup failed:', err);
    res.status(503).json({
      success: false,
      error: 'Backend database not ready yet. Please retry.',
      detail: (err as Error)?.message || String(err),
    });
    return;
  }
  return app(req, res);
}