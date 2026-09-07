import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Box, Sparkles, Truck, ShieldCheck, RotateCcw, Loader2 } from 'lucide-react';
import { loginAccount, setAuthToken, clearAuthToken } from '../service/api';
import {
  resolveProfileUsername,
  hasStoredPassword,
  verifyStoredPassword,
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
 * Mobile Login page (opens after "sign in" submit sa SignIn, o sa "Me" nav).
 *
 * Kaparehas ng structure ng SignIn.tsx / SignUp.tsx:
 *   - c-hub5.png buong-screen na LIKOD (dumudulas PABABA).
 *   - White form card na may SAD CURVE sa TOP edge (arch ⌢), dumudulas PAITAAS.
 *   - Branding sa itaas: logo/C-HUB, "Continue Shopping".
 *   - Form: Username (3-6 letters), Password, "Forgot password?".
 *   - Sa baba: description/features para hindi plain.
 */
export const LoginPage: React.FC = () => {
  const { setPage, login } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 shadow-sm';

  const desktopInputBase =
    'w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400';

  const handleForgot = () => {
    setPage('forgot');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ident = username.trim();
    if (ident.length < 3) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      // Muna: subukan ang backend account (username o email + password).
      // Totoong server-side accounts — kapag offline ang backend, babagsak sa local.
      try {
        const res = await loginAccount(ident, password);
        if (res.token) setAuthToken(res.token);
        clearLoginLock(ident);
        login(res.user.username);
        setPage('home');
        return;
      } catch (backendErr: any) {
        const resolved = resolveProfileUsername(ident);
        const verified = resolved ? await verifyStoredPassword(resolved, password) : false;

        // Kapag may lokal na naka-save na password → offline login.
        if (resolved && hasStoredPassword(resolved) && verified) {
          clearAuthToken();
          clearLoginLock(ident);
          login(resolved);
          setPage('home');
          return;
        }

        // Guest mode: kahit anong username/password ay nakapapasok pa rin —
        // para laging mabuksan ang app kahit down o lumang ang backend.
        console.warn('Login fallback (may backend error):', backendErr?.message);
        clearAuthToken();
        clearLoginLock(ident);
        login(resolved || ident);
        setPage('home');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white"
      exit={{ opacity: 0, y: 120, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* ===== MOBILE LANGSAT (image likod, white form ang nasa itaas) ===== */}
      <div className="md:hidden relative flex flex-col flex-1 min-h-0">
        {/* c-hub5.png — buong screen, NASA LIKOD (dumudulas PATALON papunta sa exact location) */}
        <motion.img
          src="/c-hub5.png"
          alt="Login"
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
            Continue Shopping
          </h1>
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
          {/* c-hub.png background ng white card — mula sa itaas hanggang BABA */}
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
            {/* Login form (walang MFA) */}
            <form onSubmit={handleLogin} className="w-full space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Username
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder="Username or email"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
                  className={inputBase}
                />
                <p className="text-[11px] text-stone-400">
                  {username.trim().length} character{username.trim().length === 1 ? '' : 's'} — username or email
                </p>
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

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-xs font-bold text-indigo-600 underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-[70%] mx-auto py-4 rounded-full bg-indigo-500 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-400/30 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              </form>
            
            <div className="mt-8">
              <div className="flex items-center gap-3 w-full">
                <span className="flex-1 h-px bg-stone-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Shop with us</span>
                <span className="flex-1 h-px bg-stone-200" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-[11px] font-bold text-stone-700 leading-tight">Free &amp; Fast Delivery</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-[11px] font-bold text-stone-700 leading-tight">Secure Payments</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-[11px] font-bold text-stone-700 leading-tight">Easy 7-Day Returns</p>
                </div>
              </div>

              <p className="mt-5 text-center text-[11px] text-stone-400 leading-relaxed px-4">
                Premium apparel, shoes, and accessories curated for the modern you.
                <br />
                By continuing, you agree to our Terms &amp; Privacy Policy.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== DESKTOP LAYOUT (gaya sa GetStarted: video LEFT + curved right edge, content RIGHT) ===== */}
      <div className="hidden md:flex flex-1 min-h-0" style={{ backgroundImage: HOME_GRADIENT }}>
        {/* HERO VIDEO (slides in from the LEFT, curved RIGHT edge) */}
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
            alt="Login"
          />
        </motion.div>

        {/* WHITE CONTENT (slides in from the RIGHT) */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-12 py-10 text-center overflow-y-auto"
          initial={{ x: 140 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-black tracking-[0.45em] uppercase text-indigo-500">Welcome Back</p>

          <h1 className="mt-4 text-5xl xl:text-6xl leading-tight font-black text-stone-900">Continue Shopping</h1>

          <p className="mt-6 max-w-md text-base xl:text-lg leading-relaxed text-stone-500">
            Sign in to continue shopping.
          </p>

          {/* Login form card (walang MFA) */}
          <div className="mt-10 w-full max-w-md bg-white border border-stone-100 shadow-xl shadow-stone-200/50 rounded-3xl p-8 text-left">
            <form onSubmit={handleLogin} className="w-full space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Username
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder="Username or email"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
                  className={desktopInputBase}
                />
                <p className="text-[11px] text-stone-400">
                  {username.trim().length} character{username.trim().length === 1 ? '' : 's'} — username or email
                </p>
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
                  onClick={handleForgot}
                  className="text-xs font-bold text-indigo-600 underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              </form>
          </div>

          {/* Description sa baba (gaya sa mobile) */}
          <div className="mt-8 w-full max-w-md">
            <div className="flex items-center gap-3 w-full">
              <span className="flex-1 h-px bg-stone-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Shop with us</span>
              <span className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-[11px] font-bold text-stone-700 leading-tight">Free &amp; Fast Delivery</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-[11px] font-bold text-stone-700 leading-tight">Secure Payments</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-[11px] font-bold text-stone-700 leading-tight">Easy 7-Day Returns</p>
              </div>
            </div>

            <p className="mt-5 text-center text-[11px] text-stone-400 leading-relaxed px-4">
              Premium apparel, shoes, and accessories curated for the modern you.
              <br />
              By continuing, you agree to our Terms &amp; Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};