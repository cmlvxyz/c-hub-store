import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Mail,
  Box,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  ChevronLeft,
  KeyRound,
} from 'lucide-react';
import { requestPasswordReset, registerAccount } from '../service/api';
import { resolveProfileUsername, profileEmailFor } from '../service/passwords';

// Kaparehas ng home screen background gradient (tingnan ang GetStarted.tsx)
const HOME_GRADIENT = `
  radial-gradient(900px 520px at 50% -6%, rgba(99,102,241,0.14), transparent 62%),
  radial-gradient(760px 480px at 88% 22%, rgba(56,189,248,0.12), transparent 60%),
  radial-gradient(820px 560px at 8% 78%, rgba(129,140,248,0.10), transparent 60%),
  linear-gradient(180deg, #ffffff 0%, #f4f5fb 100%)
`;

/*
 * Forgot Password (bukas mula sa "Forgot password?" ng SignIn/Login).
 * Tumatawag sa REAL backend reset-request endpoint. Walang fake na "link sent".
 * - Generic ang palaging response (hindi inilalabas kung may account o wala).
 * - Sa local/dev, ibinabalik ng backend ang 'devResetToken' (walang email server),
 *   kaya may "Continue to reset" para ma-test ang buong flow.
 * - Sa production, kailangan ng email/notification provider para ma-deliver
 *   ang token sa user — kaya walang token na ipinapakita doon.
 */
export const ForgotPassword: React.FC = () => {
  const { setPage } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [copied, setCopied] = useState(false);

  const inputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 shadow-sm';

  const desktopInputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDone(false);
    setDevToken('');
    if (!identifier.trim()) {
      setError('Please enter your username or email.');
      return;
    }

    setLoading(true);
    try {
      const id = identifier.trim();
      const hasAt = id.includes('@');

      // Best-effort: kung may lokal na profile ang identifier, i-register muna sa
      // backend (username + email) para gumana ang reset kahit legacy account.
      // Hindi ito magbabago ng account kung offline ang backend o kung may account na.
      const profileName = hasAt ? resolveProfileUsername(id) : null;
      const usernameForRegister = hasAt ? (profileName || id) : id;
      const emailForRegister = hasAt ? id : profileEmailFor(id) || '';
      if (emailForRegister.includes('@')) {
        try {
          await registerAccount(usernameForRegister, emailForRegister);
        } catch {
          /* 409 (may account na) o offline — normal, ituloy */
        }
      }

      const res = await requestPasswordReset(id);
      setDone(true);
      if (res.devResetToken) setDevToken(res.devResetToken);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const continueToReset = () => {
    try {
      sessionStorage.setItem('chub_reset_token', devToken);
    } catch {
      /* storage unavailable */
    }
    setPage('reset');
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(devToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const formCard = (base: string | null, buttonCls: string) => (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
        <ShieldCheck className="w-3.5 h-3.5" /> Password recovery
      </div>

      {done ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-600">Request received</p>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              If an account matches your username or email, a reset link was sent to your registered email.
            </p>
          </div>

          {devToken && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
              <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                Dev/testing reset code (walang email service)
              </p>
              <p className="mt-1 text-[11px] text-stone-600 leading-relaxed">
                Walang email provider ang backend sa ngayon, kaya ang reset code ay ipinapakita dito para
                lamang sa local/dev testing. Sa production, kailangan ng email service para ma-deliver ito.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  readOnly
                  value={devToken}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-mono text-center tracking-tight text-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyToken}
                  className="p-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-600 hover:text-indigo-700 transition-colors shrink-0"
                  aria-label="Copy reset code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={continueToReset}
                className="mt-3 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" /> Continue to reset password
              </button>
              <button
                type="button"
                onClick={() => { setDone(false); setDevToken(''); }}
                className="mt-2 w-full text-center text-[11px] font-bold text-stone-500 hover:text-stone-700"
              >
                Use a different username or email
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" /> Username or email
            </label>
            <input
              type="text"
              required
              placeholder="Your username or registered email"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }}
              className={base || desktopInputBase}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={buttonCls + ' disabled:opacity-60 disabled:pointer-events-none'}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                Send reset request
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => setPage('signin')}
        className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-700"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Sign in
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
          alt="Forgot password"
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
            Reset your password
          </h1>
          <p className="mt-1 text-xs text-stone-600">We&apos;ll help you get back in.</p>
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
            alt="Forgot password"
          />
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-12 py-10 text-center overflow-y-auto"
          initial={{ x: 140 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-black tracking-[0.45em] uppercase text-indigo-500">Password Recovery</p>

          <h1 className="mt-4 text-5xl xl:text-6xl leading-tight font-black text-stone-900">Reset your password</h1>

          <p className="mt-6 max-w-md text-base xl:text-lg leading-relaxed text-stone-500">
            Enter your username or registered email and we&apos;ll send you a reset code.
          </p>

          <div className="mt-10 w-full max-w-md bg-white border border-stone-100 shadow-xl shadow-stone-200/50 rounded-3xl p-8 text-left">
            {formCard(null, 'w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all')}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};