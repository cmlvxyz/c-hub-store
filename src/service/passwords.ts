// c-hub-store/src/service/passwords.ts
// Local password verifier helpers.
//
// Walang plaintext na password na naka-save. Gumagamit ng WebCrypto PBKDF2
// (SHA-256, per-user random salt) para mag-store ng verifier lamang.
// Ang TOTPANG session/auth ay nananatiling ginagamit ang EXISTING StoreContext
// (chub_user / chub_profile_<name>) — ito lang ang credential verification layer.
//
// Nota sa security: ang verifier ay nasa localStorage ng browser (client-side).
// Para sa tunay na server-side authentication, kailangan ng backend auth
// service — wala itong inaangkin na fake server-side security.

const encoder = new TextEncoder();

const hex = (buf: Uint8Array) =>
  Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');

async function deriveKey(password: string, salt: string, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return hex(new Uint8Array(bits));
}

const PASS_KEY_PREFIX = 'chub_pass_';
const LOCK_KEY_PREFIX = 'chub_lock_';

export const getPassKey = (username: string) => `${PASS_KEY_PREFIX}${username.toLowerCase().trim()}`;

export const hasStoredPassword = (username: string): boolean => {
  try {
    return !!localStorage.getItem(getPassKey(username));
  } catch {
    return false;
  }
};

export const setStoredPassword = async (username: string, password: string): Promise<void> => {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const iterations = 60000;
  const hash = await deriveKey(password, salt, iterations);
  try {
    localStorage.setItem(getPassKey(username), JSON.stringify({ salt, iterations, hash }));
  } catch {
    /* storage unavailable */
  }
};

export const verifyStoredPassword = async (username: string, password: string): Promise<boolean> => {
  const raw = localStorage.getItem(getPassKey(username));
  if (!raw) return false;
  try {
    const { salt, iterations, hash } = JSON.parse(raw);
    const check = await deriveKey(password, salt, iterations);
    return check === hash;
  } catch {
    return false;
  }
};

// Malinaw na message para sa password strength validation.
export const passwordStrength = (password: string): { ok: boolean; message: string } => {
  if (password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { ok: false, message: 'Password must contain at least one letter.' };
  }
  if (!/\d/.test(password)) {
    return { ok: false, message: 'Password must contain at least one number.' };
  }
  return { ok: true, message: '' };
};

// I-resolve ang "username o email" sa local profile name.
// - Email → hanapin ang profile na may kaparehas na email.
// - Username → gamitin nang direkta (case-insensitive ang lahat ng lookups).
export const resolveProfileUsername = (identifier: string): string | null => {
  const id = identifier.trim().replace(/\s+/g, ' ');
  if (!id) return null;

  if (id.includes('@')) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('chub_profile_')) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '');
        if (parsed?.email && String(parsed.email).toLowerCase() === id.toLowerCase()) {
          return parsed.name || key.slice('chub_profile_'.length);
        }
      } catch {
        /* skip corrupt profile */
      }
    }
    return null;
  }

  return id;
};

// Hanapin ang local profile email para sa isang opaque username (kung may-ari).
export const profileEmailFor = (username: string): string | null => {
  try {
    const raw = localStorage.getItem(`chub_profile_${username.toLowerCase().trim()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email ? String(parsed.email).trim() : null;
  } catch {
    return null;
  }
};

// ── Login lockout (rate limiting) ──
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;

const lockKey = (username: string) => `${LOCK_KEY_PREFIX}${username.toLowerCase().trim()}`;

export const loginLockRemaining = (username: string): number => {
  try {
    const raw = localStorage.getItem(lockKey(username));
    if (!raw) return 0;
    const { lockedUntil } = JSON.parse(raw);
    if (!lockedUntil) return 0;
    const remaining = lockedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
};

export const recordFailedLogin = (username: string): number => {
  const key = lockKey(username);
  const current = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      return typeof parsed.count === 'number' ? parsed.count : 0;
    } catch {
      return 0;
    }
  })();
  const count = current + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;
  localStorage.setItem(key, JSON.stringify({ count, lockedUntil }));
  return count;
};

export const clearLoginLock = (username: string) => {
  try {
    localStorage.removeItem(lockKey(username));
  } catch {
    /* ignore */
  }
};