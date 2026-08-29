import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Mail,
  Eye,
  EyeOff,
  AtSign,
  ShieldCheck,
  Github,
  Zap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, signup, setPage, user } = useStore();

  // Aling panel ang aktibo: 'signup' (left) o 'login' (right)
  const [view, setView] = useState<'signup' | 'login'>('signup');
  // Logged In state pagkatapos mag-signup o mag-login - magsi-slide ang card papuntang kanan
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState('Welcome');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Login fields
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Errors
  const [signupError, setSignupError] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Sign Up validation ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const nameWords = fullName.trim().split(/\s+/).filter(Boolean);
    if (nameWords.length < 2) {
      setSignupError('Please enter your full name (first and last name).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSignupError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    if (password.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }
    if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
      setSignupError('Password must include a number or symbol.');
      return;
    }
    if (!agree) {
      setSignupError('Please agree to the Terms and Privacy Policy.');
      return;
    }

    const ok = await signup(fullName.trim(), email.trim(), password);
    if (!ok) return;
    setDisplayName(fullName.trim().split(/\s+/)[0]);
    setLoggedIn(true);
  };

  // --- Login validation ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentity.trim() || loginIdentity.trim().length < 2) {
      setLoginError('Please enter your nickname or email.');
      return;
    }
    if (loginPassword.length < 4) {
      setLoginError('Password must be at least 4 characters.');
      return;
    }

    login(loginIdentity.trim());
    // Display name: kung email, prefix; kung hindi, ang mismong input
    const idName = loginIdentity.trim().includes('@')
      ? loginIdentity.trim().split('@')[0]
      : loginIdentity.trim();
    setDisplayName(user.username || idName);
    setLoggedIn(true);
  };

  const startShopping = () => setPage('shop');
  const viewOrders = () => setPage('orders');
  const continueGuest = () => setPage('shop');

  // ============ LOGGED IN STATE ============
  if (loggedIn) {
    return (
      <div className="w-full px-4 py-12 flex justify-center overflow-hidden">
        <motion.div
          initial={{ x: 80, opacity: 0, filter: 'blur(6px)' }}
          animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 }}
          className="w-full max-w-[500px]"
        >
          <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-8 sm:p-10 space-y-6 animate-fadeIn">
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-black font-serif text-stone-900 dark:text-white">
                Welcome, {displayName}!
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                You are now signed in to your C-HUB account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={startShopping}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 hover:shadow-indigo-500/30"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={viewOrders}
                className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700"
              >
                <span>View My Orders</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={continueGuest}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors font-semibold"
              >
                Continue as Guest →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ SIGN UP + LOGIN PANELS ============
  const inputBase =
    'w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white transition-shadow';
  const iconBtnBase =
    'absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-indigo-600 transition-colors p-1';
  const primaryBtn =
    'w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95';

  return (
    <div className="w-full px-4 py-8 sm:py-12 flex justify-center">
      <div className="w-full max-w-[820px]">
        {/* Container Card - two panels */}
        <div className="rounded-[2rem] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ============ LEFT: SIGN UP ============ */}
            <div className="p-7 sm:p-9 bg-white dark:bg-stone-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view === 'signup' ? 'signup' : 'login-mobile'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {view === 'signup' ? (
                    <form onSubmit={handleSignup} className="space-y-5">
                      {/* Header */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-extrabold">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5" />
                          </span>
                          Start Building in Minutes
                        </div>
                        <h2 className="text-2xl font-black font-serif text-stone-900 dark:text-white">
                          Create your account
                        </h2>
                      </div>

                      {signupError && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{signupError}</span>
                        </div>
                      )}

                      {/* Full name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Juan Dela Cruz"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); if (signupError) setSignupError(''); }}
                          className={inputBase}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="you@gmail.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (signupError) setSignupError(''); }}
                          className={inputBase}
                        />
                        <p className="text-[10px] text-stone-400">Any valid email ending in @gmail.com works for now.</p>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPw ? 'text' : 'password'}
                            placeholder="Enter a strong password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); if (signupError) setSignupError(''); }}
                            className={inputBase + ' pr-10'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className={iconBtnBase}
                            aria-label="Toggle password visibility"
                          >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400">Use 8+ characters with a number or symbol.</p>
                      </div>

                      {/* Agree checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => { setAgree(e.target.checked); if (signupError) setSignupError(''); }}
                          className="mt-0.5 h-4 w-4 rounded border-stone-300 text-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                          Agree to the <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Terms</span> and{' '}
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Privacy Policy</span>.
                        </span>
                      </label>

                      <button type="submit" className={primaryBtn}>
                        <span>Create account</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => { setView('login'); setSignupError(''); }}
                          className="text-xs font-semibold text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          ← Back to sign in
                        </button>
                        <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Secure access · Always in sync
                        </span>
                      </div>
                    </form>
                  ) : (
                    // ================= RIGHT PANEL CONTENT (rendered here on mobile only) =================
                    renderLoginForm()
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ============ RIGHT: LOGIN (desktop) ============ */}
            <div className="p-7 sm:p-9 bg-stone-50 dark:bg-stone-950/40 border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800">
              <div className="hidden md:block">
                {renderLoginForm()}
              </div>
              {/* Mobile: switch link shown when on signup */}
              {view === 'signup' && (
                <div className="md:hidden text-center mt-6">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">Already have an account?</p>
                  <button
                    onClick={() => setView('login')}
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ LOGIN FORM (ginamit sa right panel at mobile) ============
  function renderLoginForm() {
    return (
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-extrabold">
            <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
              <LogIn className="w-3.5 h-3.5" />
            </span>
            Your Workspace Awaits
          </div>
          <h2 className="text-2xl font-black font-serif text-stone-900 dark:text-white">
            Welcome back
          </h2>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Nickname / Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
            <AtSign className="w-3.5 h-3.5" /> Nickname or Email
          </label>
          <input
            type="text"
            placeholder="e.g. Ian or ian@gmail.com"
            value={loginIdentity}
            onChange={(e) => { setLoginIdentity(e.target.value); if (loginError) setLoginError(''); }}
            className={inputBase}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Password
          </label>
          <div className="relative">
            <input
              type={showLoginPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => { setLoginPassword(e.target.value); if (loginError) setLoginError(''); }}
              className={inputBase + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowLoginPw(!showLoginPw)}
              className={iconBtnBase}
              aria-label="Toggle password visibility"
            >
              {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-xs text-stone-500 dark:text-stone-400">Remember me</span>
          </label>
          <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Forgot password?
          </a>
        </div>

        <button type="submit" className={primaryBtn}>
          <span>Sign in</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Social login */}
        <div className="pt-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
              or continue with
            </span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => { login('GitHub User'); setDisplayName('GitHub User'); setLoggedIn(true); }}
              className="py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button
              type="button"
              onClick={() => { login('Microsoft User'); setDisplayName('Microsoft User'); setLoggedIn(true); }}
              className="py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
                <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
                <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>
        </div>
      </form>
    );
  }
};
