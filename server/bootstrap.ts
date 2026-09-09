// server/bootstrap.ts
// Shared startup routine for BOTH the long-running Node server (server/index.ts)
// and the Vercel serverless function (api/index.ts).
// It provisions the shared Turso schema + seeds + default admin exactly once
// per process, and is fully idempotent against an already-seeded database.

import { ensureSchema, runInitialSeed } from './db.js';
import { seedDefaultAdmin } from './helpers.js';

let readyPromise: Promise<void> | null = null;

export function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      console.log('🚀 Ensuring shared Turso schema + seed data...');
      await ensureSchema();
      await runInitialSeed();
      await seedDefaultAdmin();
      console.log('✅ Shared Turso database ready.');
    })().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}