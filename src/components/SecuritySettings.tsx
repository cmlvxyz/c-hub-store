import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  hasStoredPassword,
  setStoredPassword,
  verifyStoredPassword,
  passwordStrength,
} from '../service/passwords';
import {
  ShieldCheck,
  KeyRound,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { user, setPage } = useStore();

  // Change password state
  const [pwPhase, setPwPhase] = useState<'idle' | 'changing'>('idle');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwShow, setPwShow] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!user.isLoggedIn) {
      setPwPhase('idle');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwShow(false);
      setPwError('');
    }
  }, [user.isLoggedIn]);

  const isLoggedIn = user.isLoggedIn;

  const localToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const hasPassword = hasStoredPassword(user.username);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (hasPassword) {
      const ok = await verifyStoredPassword(user.username, currentPw);
      if (!ok) {
        setPwError('Current password is incorrect.');
        return;
      }
      if (newPw === currentPw) {
        setPwError('New password must be different from your current password.');
        return;
      }
    }

    const strength = passwordStrength(newPw);
    if (!strength.ok) {
      setPwError(strength.message);
      return;
    }
    if (confirmPw !== newPw) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwBusy(true);
    try {
      await setStoredPassword(user.username, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwPhase('idle');
      setPwShow(false);
      localToast('Password changed successfully.', 'success');
    } catch {
      setPwError('Failed to change password. Please try again.');
    } finally {
      setPwBusy(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 md:px-10 pt-4 md:pt-8 pb-10 animate-fadeIn">
        <button
          onClick={() => setPage('me')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Me
        </button>
        <div className="mt-6 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 px-6 py-12 flex flex-col items-center text-center">
          <ShieldCheck className="w-10 h-10 text-indigo-500" />
          <h2 className="mt-4 text-xl font-black text-stone-900 dark:text-white">Sign in required</h2>
          <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
            Sign in to your account to manage your security settings.
          </p>
          <button
            onClick={() => setPage('signin')}
            className="mt-6 py-3.5 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-10 pt-4 md:pt-8 pb-10 animate-fadeIn">
      <button
        onClick={() => setPage('me')}
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Me
      </button>

      <h1 className="mt-4 text-2xl md:text-3xl font-black text-stone-900 dark:text-white">Security</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Manage how you protect your account.
      </p>

      <div className="mt-5 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 dark:text-white">Change Password</h2>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {hasPassword
                  ? 'Update the password used to sign in.'
                  : 'This account has no password yet. Set one now to secure it.'}
              </p>
            </div>
          </div>

          {pwPhase === 'changing' ? (
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              {pwError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              {hasPassword && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" /> Current password
                  </label>
                  <input
                    type={pwShow ? 'text' : 'password'}
                    required
                    placeholder="Enter your current password"
                    value={currentPw}
                    onChange={(e) => { setCurrentPw(e.target.value); if (pwError) setPwError(''); }}
                    className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 dark:bg-stone-800/60 dark:border-stone-700 dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" /> New password
                </label>
                <div className="relative">
                  <input
                    type={pwShow ? 'text' : 'password'}
                    required
                    placeholder="At least 8 characters, with a letter and a number"
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); if (pwError) setPwError(''); }}
                    className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 pr-10 dark:bg-stone-800/60 dark:border-stone-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow(!pwShow)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-600 transition-colors p-1"
                    aria-label="Toggle new password visibility"
                  >
                    {pwShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Confirm new password
                </label>
                <input
                  type={pwShow ? 'text' : 'password'}
                  required
                  placeholder="Repeat your new password"
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); if (pwError) setPwError(''); }}
                  className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 transition-shadow placeholder-stone-400 dark:bg-stone-800/60 dark:border-stone-700 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pwBusy}
                  className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {pwBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  {pwBusy ? 'Saving...' : 'Save password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setPwPhase('idle'); setPwError(''); setPwShow(false); }}
                  className="flex-1 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-black uppercase tracking-wider active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5">
              <button
                onClick={() => setPwPhase('changing')}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {hasPassword ? 'Change password' : 'Set a password'}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-white shadow-2xl border text-xs font-bold ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-500 border-red-400'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};