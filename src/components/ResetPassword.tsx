import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import {
  AlertCircle,
  ArrowRight,
  Box,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { applyPasswordReset } from '../service/api';
import { setStoredPassword, passwordStrength } from '../service/passwords';

// Kaparehas ng home screen background gradient (tingnan ang GetStarted.tsx)
const HOME_GRADIENT = `
  radial-gradient(900px 520px at 50% -6%, rgba(99,102,241,0.14), transparent 62%),
  radial-gradient(760px 480px at 88% 22%, rgba(56,189,248,0.12), transparent 60%),
  radial-gradient(820px 560px at 8% 78%, rgba(129,140,248,0.10), transparent 60%),
  linear-gradient(180deg, #ffffff 0%, #f4f5fb 100%)
`;

/*
 * Reset Password — i-verify ang reset token sa backend at maglagay ng bagong password.
 * - Ang token ay re-read mula sa sessionStorage (sinet sa ForgotPassword dev flow)
 *   o i-type/paste ng user (hal. mula sa email).
 * - Invalid/expired ang token -> malinaw na error, mag-request ng bago.
 * - Pagkatapos ng reset, magre-require ng sign-in gamit ang bagong password.
 */
export const ResetPassword: React.FC = () => {
  const { setPage, showToast } = useStore();

  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('chub_reset_token') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 shadow-sm';

  const desktopInputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError('Please enter the reset code from your email.');
      return;
    }
    const strength = passwordStrength(password);
    if (!strength.ok) {
      setError(strength.message);
      return;
    }
    if (confirmPw !== password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // I-verify (at i-consume) ang token sa backend. Ang username ay hindi
      // plaintext-mismatch; ang backend lang ang nakakaalam kung sino ang may-ari.
      const res = await applyPasswordReset(trimmedToken);

      // I-save ang bagong password verifier (PBKDF2) para sa lokal na login.
      await setStoredPassword(res.username, password);

      try {
        sessionStorage.removeItem('chub_reset_token');
      } catch {
        /* ignore */
      }

      showToast('Password reset successfully. Please sign in.', 'success');
      setPage('signin');
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      setError(
        msg.includes('expired') || msg.includes('invalid')
          ? 'This reset code is invalid or has expired. Please request a new one.'
          : err?.message || 'Unable to reset your password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (base: string, label: string, value: string, setter: (v: string) => void) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-indigo-500" /> {label}
      </label>
      <div className="relative">
        <input
          type={showPw ? 'text' : 'password'}
          required
          placeholder={label === 'New password' ? 'At least 8 characters, with a letter and a number' : 'Repeat your new password'}
          value={value}
          onChange={(e) => { setter(e.target.value); if (error) setError(''); }}
          className={base + ' pr-10'}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-600 transition-colors p-1"
          aria-label="Toggle password visibility"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const formCard = (base: string | null, buttonCls: string) => (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
        <ShieldCheck className="w-3.5 h-3.5" /> Set a new password
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Reset code
        </label>
        <input
          type="text"
          required
          placeholder="Paste the reset code from your email"
          value={token}
          onChange={(e) => { setToken(e.target.value); if (error) setError(''); }}
          className={base || desktopInputBase}
          autoFocus
        />
      </div>

      {passwordField(base || desktopInputBase, 'New password', password, setPassword)}
      {passwordField(base || desktopInputBase, 'Confirm password', confirmPw, setConfirmPw)}

      <button
        type="submit"
        disabled={loading}
        className={buttonCls + ' disabled:opacity-60 disabled:pointer-events-none'}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>
            Reset password
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setPage('forgot')}
        className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-700"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Request a new code
      </button>
    </form>
  );

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white"
      exit={{ opacity: 0, y: 120, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden relative flex flex-col flex-1 min-h-0">
        <motion.img
          src="/c-hub5.png"
          alt="Reset password"
          className="absolute inset-0 w-full h-full object-cover object-center"
          initial={{ y: -120 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center text-center px-8 pt-12 pointer-events-none">
          <div
            className="absolute inset-x-0 top-0 -z-10 h-56 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.45) 55%, rgba(255,255,255,0) 100%)',
            }}
          />
          <div className="flex items-center gap-1.5">
            <div className="w-9 h-9 flex items-center justify-center">
              <Box className="w-full h-full stroke-[2.5] text-indigo-500" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-serif text-stone-900">
              C<span className="text-indigo-600 font-sans">-</span>HUB
            </span>
          </div>

          <h1 className="mt-3 text-lg font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Choose a new password
          </h1>
          <p className="mt-1 text-xs text-stone-600">Use your reset code to secure your account.</p>
        </div>

        <motion.div
          className="relative flex flex-col flex-1 w-full px-8 pb-10 pt-28"
          style={{
            borderRadius: '999px 999px 0 0 / 350px 420px 0 0',
            backgroundColor: '#ffffff',
            borderTop: 'none',
            marginTop: 'min(26vh, 260px)',
            overflow: 'hidden',
          }}
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-x-0 top-0 bottom-0 w-full pointer-events-none shadow-xl"
            style={{
              backgroundImage: "url('/c-hub.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: 'rotate(180deg)',
            }}
          />

          <div className="relative bottom-12 z-10">
            {formCard(inputBase, 'w-[70%] mx-auto py-4 rounded-full bg-indigo-500 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-400/30 active:scale-95 transition-all')}
          </div>
        </motion.div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:flex flex-1 min-h-0" style={{ backgroundImage: HOME_GRADIENT }}>
        <motion.div
          className="relative w-[52%] overflow-hidden shrink-0"
          style={{ borderRadius: '0 999px 999px 0 / 0 250px 250px 0' }}
          initial={{ x: -90 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="/LogIn.jpg"
            alt="Reset password"
          />
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-12 py-10 text-center overflow-y-auto"
          initial={{ x: 140 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-black tracking-[0.45em] uppercase text-indigo-500">New Password</p>

          <h1 className="mt-4 text-5xl xl:text-6xl leading-tight font-black text-stone-900">Secure your account</h1>

          <p className="mt-6 max-w-md text-base xl:text-lg leading-relaxed text-stone-500">
            Enter the reset code and choose a strong new password.
          </p>

          <div className="mt-10 w-full max-w-md bg-white border border-stone-100 shadow-xl shadow-stone-200/50 rounded-3xl p-8 text-left">
            {formCard(null, 'w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all')}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};