import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Lock, ArrowRight, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setPage, user } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Limit to 6 letters only, capitalize first letter
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z]/g, '');
    if (val.length > 6) val = val.slice(0, 6); // Max 6 letters
    if (val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
    setUsername(val);
    if (error) setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 2) {
      setError('Username must be at least 2 letters');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    login(username);
    setPage('home');
  };

  // If logged in, show the right side (Welcome)
  if (user.isLoggedIn) {
    return (
      <div className="w-full max-w-[480px] mx-auto px-4 py-12 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-6">
          
          {/* Welcome Header */}
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

          {/* Action Buttons */}
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

        </div>
      </div>
    );
  }

  // Login Form (Left Side)
  return (
    <div className="w-full max-w-[480px] mx-auto px-4 py-12 animate-fadeIn">
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black font-serif text-stone-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Sign in to your C-HUB account to manage orders & preferences.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter username"
              value={username}
              onChange={handleUsernameChange}
              maxLength={6}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 mt-4"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setPage('shop')}
            className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Continue as Guest →
          </button>
        </div>

      </div>
    </div>
  );
};