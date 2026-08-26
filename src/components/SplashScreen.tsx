import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Box } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { splashShown, closeSplash } = useStore();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!splashShown) {
      const timer = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          closeSplash();
        }, 500);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [splashShown, closeSplash]);

  if (splashShown) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-white transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-pulse">
        {/* Brand Logo with Colored Box Icon - Indigo */}
        <div className="w-20 h-20 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20">
          <Box className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-widest font-serif">C-HUB</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Premium Streetwear</p>
        </div>

        {/* Minimal Loader */}
        <div className="w-12 h-1 bg-stone-800 rounded-full overflow-hidden mt-4">
          <div className="w-full h-full bg-indigo-500 animate-[bounce_1s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};