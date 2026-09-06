import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, Box, Sparkles, User, Loader2 } from 'lucide-react';
import { loginAccount } from '../service/api';
import {
  resolveProfileUsername,
  hasStoredPassword,
  verifyStoredPassword,
  loginLockRemaining,
  recordFailedLogin,
  clearLoginLock,
} from '../service/passwords';

// Kaparehas ng home screen background gradient (tingnan ang GetStarted.tsx)
const HOME_GRADIENT = `
  radial-gradient(900px 520px at 50% -6%, rgba(99,102,241,0.14), transparent 62%),
  radial-gradient(760px 480px at 88% 22%, rgba(56,189,248,0.12), transparent 60%),
  radial-gradient(820px 560px at 8% 78%, rgba(129,140,248,0.10), transparent 60%),
  linear-gradient(180deg, #ffffff 0%, #f4f5fb 100%)
`;

/*
 * Mobile Sign In screen (opens after "Get Started").
 *
 * BALIKTAD na composition kaysa sa GetStarted:
 *   - SignIn.jpg bilang buong-screen na LIKOD (background).
 *   - White form ang NASA ITAAS (angkat/overlap) at may SAD CURVE
 *     sa TOP edge nito (arch ⌢ — mas mataas ang gitna, mas mababa ang gilid),
 *     gaya ng: border-radius 999px 999px 0 0 / 250px 260px 0 0.
 *   - Makikita ang larawan sa itaas ng white card at sa pinaka-ilalim.
 *
 * Entrance ("pasalubong", tulad ng GetStarted):
 *   - White card dumudulas PAITAAS (y: 120 -> 0), habang static ang larawan.
 *   0.9s, cubic-bezier(0.22, 1, 0.36, 1), eksakto sa pwesto.
 */
export const SignIn: React.FC = () => {
  const { setPage, showToast, login } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 shadow-sm';

  const desktopInputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400';

  const handleGoogle = () => {
    showToast('Google sign-in is not available yet.', 'info');
  };

  // Ang Sign In na ito ay ANG TUNAY na login — backend account (username o email
  // + password). Kapag offline ang backend, bumabagsak sa lokal na verifier.
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ident = identifier.trim();
    if (!ident) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const lockMs = loginLockRemaining(ident);
    if (lockMs > 0) {
      const mins = Math.ceil(lockMs / 60000);
      setError(`Too many failed attempts. Please try again in ${mins} minute${mins > 1 ? 's' : ''}.`);
      return;
    }

    setLoading(true);
    try {
      try {
        const res = await loginAccount(ident, password);
        clearLoginLock(ident);
        login(res.user.username);
        setPage('home');
        return;
      } catch (backendErr: any) {
        const backendMsg = String(backendErr?.message || '').toLowerCase();
        const resolved = resolveProfileUsername(ident);
        const verified = resolved ? await verifyStoredPassword(resolved, password) : false;
        if (resolved && hasStoredPassword(resolved) && verified) {
          clearLoginLock(ident);
          login(resolved);
          setPage('home');
          return;
        }
        if (!resolved || !hasStoredPassword(resolved) || !verified) {
          recordFailedLogin(ident);
          setError('Invalid username or password.');
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const googleG = (
    <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white"
      exit={{ opacity: 0, y: 120, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* ===== MOBILE LANGSAT (image likod, white form ang nasa itaas) ===== */}
      <div className="md:hidden relative flex flex-col flex-1 min-h-0">
        {/* SignIn.jpg — buong screen, NASA LIKOD (dumudulas PATALON papunta sa exact location) */}
        <motion.img
          src="/c-hub5.png"
          alt="Sign in"
          className="absolute inset-0 w-full h-full object-cover object-center"
          initial={{ y: -120 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* ===== Branding sa TAAS ng screen (absolute, over background — hindi pinababa ang form) ===== */}
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
            Welcome back!
          </h1>
          <p className="mt-1 text-xs text-stone-600">Sign in to continue shopping.</p>
        </div>

        {/* ===== WHITE FORM CARD — nakaangat, TOP edge = sad curve (arch ⌢) ===== */}
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
          {/* c-hub5/current background ng white card — mula sa itaas hanggang BABA */}
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
            {/* Sign-in form */}
            <form onSubmit={handleSignIn} className="w-full space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Username or Email
              </label>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="Username or email"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }}
                className={inputBase}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  className={inputBase + ' pr-10'}
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

            <button
              type="submit"
              disabled={loading}
              className="w-[50%] mx-auto py-4 rounded-full bg-indigo-500 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-400/30 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
            </button>
          </form>

          {/* Sign up */}
          <p className="mt-6 text-sm text-stone-500">
            Don&apos;t have account?{' '}
            <button onClick={() => setPage('signup')} className="text-indigo-600 font-black underline underline-offset-2">
              Sign up
            </button>
          </p>

          {/* or divider (nasa IBABA) */}
          <div className="flex items-center gap-3 w-full mt-8">
            <span className="flex-1 h-px bg-stone-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">or</span>
            <span className="flex-1 h-px bg-stone-200" />
          </div>

          {/* ===== Social sign-in: Google | Facebook (side-by-side) ===== */}
          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={handleGoogle}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-sm font-bold text-stone-800 shadow-sm active:scale-95 transition-all"
            >
              {googleG}
              <span>Google</span>
            </button>

            <button
              onClick={() => showToast('Facebook sign-in is not available yet.', 'info')}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-sm font-bold text-stone-800 shadow-sm active:scale-95 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-[#1877F2]">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
          </div>
        </motion.div>
      </div>

      {/* ===== DESKTOP LAYOUT (gaya sa GetStarted: video LEFT + curved right edge, content RIGHT) ===== */}
      <div className="hidden md:flex flex-1 min-h-0" style={{ backgroundImage: HOME_GRADIENT }}>
        {/* HERO IMAGE (slides in from the LEFT, curved RIGHT edge) */}
        <motion.div
          className="relative w-[52%] overflow-hidden shrink-0"
          style={{ borderRadius: '0 999px 999px 0 / 0 250px 250px 0' }}
          initial={{ x: -90 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="/SignIn.jpg"
            alt="Sign in"
          />
        </motion.div>

        {/* WHITE CONTENT (slides in from the RIGHT) */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-12 text-center"
          initial={{ x: 140 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-black tracking-[0.45em] uppercase text-indigo-500">Welcome Back</p>

          <h1 className="mt-4 text-5xl xl:text-6xl leading-tight font-black text-stone-900">Sign in to C-Hub</h1>

          <p className="mt-6 max-w-md text-base xl:text-lg leading-relaxed text-stone-500">
            Sign in to continue shopping.
          </p>

          {/* Sign-in form card (free-standing sa desktop, gaya ng GetStarted content) */}
          <div className="mt-10 w-full max-w-md bg-white border border-stone-100 shadow-xl shadow-stone-200/50 rounded-3xl p-8 text-left">
            <form onSubmit={handleSignIn} className="w-full space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Username or Email
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder="Username or email"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }}
                  className={desktopInputBase}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    className={desktopInputBase + ' pr-10'}
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPage('forgot')}
                  className="text-xs font-bold text-indigo-600 underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* or divider */}
            <div className="flex items-center gap-3 w-full mt-6">
              <span className="flex-1 h-px bg-stone-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">or</span>
              <span className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Social sign-in: Google | Facebook (side-by-side) */}
            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={handleGoogle}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-stone-50 border border-stone-200 text-sm font-bold text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/40 active:scale-95 transition-all"
              >
                {googleG}
                <span>Google</span>
              </button>
              <button
                onClick={() => showToast('Facebook sign-in is not available yet.', 'info')}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-stone-50 border border-stone-200 text-sm font-bold text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/40 active:scale-95 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-[#1877F2]">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-stone-500">
              Don&apos;t have account?{' '}
              <button
                onClick={() => setPage('signup')}
                className="text-indigo-600 font-black underline underline-offset-2"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};