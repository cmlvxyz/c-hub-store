import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import {
  User,
  Lock,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogIn,
  ArrowLeft,
  Eye,
  EyeOff,
  Box
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { completeAuth, setPage, user } = useStore();

  // step 1 = Sign In (delivery info), step 2 = Login (username + password)
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');

  // Step 1: Delivery Information (Account/Sign Up)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Login (username + password)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const inputBase =
    'w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white transition-shadow';
  const labelBase =
    'text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5';

  // ---------- Step 1: Sign In / Delivery Info ----------
  const handleSignInInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    if (!mobile.trim() || mobile.trim().replace(/\D/g, '').length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }
    if (!address.trim()) {
      setError('Please enter your complete delivery address.');
      return;
    }

    setStep(2);
  };

  // ---------- Step 2: Login (Username + Password) ----------
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    if (val.length > 6) val = val.slice(0, 6); // Max 6 characters
    if (val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
    setUsername(val);
    if (error) setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please create a username.');
      return;
    }
    if (username.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    // I-save ang delivery info sa profile at mag-login gamit ang username
    completeAuth(fullName, email, mobile, address, username);
    setPage('home');
  };

  // ---------- Logged In State ----------
  if (user.isLoggedIn) {
    return (
      <div className="w-full max-w-[720px] mx-auto px-4 py-12 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black font-serif text-stone-900 dark:text-white">
              Welcome, {user.username}!
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              You are now signed in to your C-HUB account.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setPage('shop')}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage('orders')}
              className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>View My Orders</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setPage('shop')}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Continue as Guest -&gt;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Animated Logo Panel (moves from right to left on Step 2) ----------
  const LogoPanel = () => (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white p-10 min-h-[420px]">
      {/* Decorative blurred blobs */}
      <motion.div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-12 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      />

      {/* Floating cube logo */}
      <motion.div
        className="relative"
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/25"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl shadow-indigo-950/40">
            <Box className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.8] text-white drop-shadow-lg" />
          </div>
        </div>
      </motion.div>

      <motion.h2
        className="mt-8 text-4xl sm:text-5xl font-black font-serif tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        C<span className="opacity-70">-</span>HUB
      </motion.h2>
      <motion.p
        className="mt-3 text-sm text-indigo-100 text-center max-w-[260px] leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Effortless urban style. Created for modern lives.
      </motion.p>
    </div>
  );

  // ---------- Sign In Content (Left Panel, Step 1) ----------
  const SignInContent = () => (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
          <User className="w-7 h-7" />
        </div>
        <h2 className="mt-3 text-2xl font-black font-serif text-stone-900 dark:text-white">Sign In</h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Provide your delivery information to create your account.
        </p>
      </div>

      <form onSubmit={handleSignInInfo} className="space-y-4 flex-1">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className={labelBase}>
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Juan Dela Cruz"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); if (error) setError(''); }}
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelBase}>
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelBase}>
            <Phone className="w-3.5 h-3.5" /> Mobile Number
          </label>
          <input
            type="tel"
            required
            placeholder="0917 123 4567"
            value={mobile}
            onChange={(e) => { setMobile(e.target.value); if (error) setError(''); }}
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelBase}>
            <MapPin className="w-3.5 h-3.5" /> Complete Delivery Address
          </label>
          <textarea
            required
            rows={3}
            placeholder="House/Unit No., Street, Barangay, City, Province, Postal Code"
            value={address}
            onChange={(e) => { setAddress(e.target.value); if (error) setError(''); }}
            className={inputBase + ' resize-none'}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 mt-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setPage('shop')}
          className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          Continue as Guest -&gt;
        </button>
      </div>
    </div>
  );

  // ---------- Login Content (Right Panel, Step 2) ----------
  const LoginContent = () => (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
          <LogIn className="w-7 h-7" />
        </div>
        <h2 className="mt-3 text-2xl font-black font-serif text-stone-900 dark:text-white">Create Your Login</h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Set up your username and password to start shopping.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 flex-1">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className={labelBase}>
            <User className="w-3.5 h-3.5" /> Username
          </label>
          <input
            type="text"
            required
            placeholder="Max 6 characters"
            value={username}
            onChange={handleUsernameChange}
            maxLength={6}
            className={inputBase}
          />
          <p className="text-[10px] text-stone-400">Max 6 characters - letters and numbers allowed.</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelBase}>
            <Lock className="w-3.5 h-3.5" /> Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className={inputBase + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-indigo-600 transition-colors p-1"
              aria-label="Toggle password visibility"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 mt-4"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setStep(1)}
          className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3 h-3" /> Back to delivery info
        </button>
      </div>
    </div>
  );

  // ---------- Two-Panel Layout ----------
  return (
    <div className="w-full max-w-[920px] mx-auto px-4 py-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* LEFT PANEL */}
        <div className="relative rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step === 1 ? 'signin' : 'logo-left'}
              className="h-full"
              initial={{ x: step === 1 ? 0 : 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: step === 1 ? 0 : -60, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {step === 1 ? <SignInContent /> : <LogoPanel />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step === 1 ? 'logo-right' : 'login'}
              className="h-full"
              initial={{ x: step === 1 ? 0 : 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: step === 1 ? 0 : -60, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {step === 1 ? <LogoPanel /> : <LoginContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
