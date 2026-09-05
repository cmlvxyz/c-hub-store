import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Truck, RotateCcw } from 'lucide-react';

// Kaparehas ng home screen background gradient (tingnan ang Footer.tsx / App.tsx)
const HOME_GRADIENT = `
  radial-gradient(900px 520px at 50% -6%, rgba(99,102,241,0.14), transparent 62%),
  radial-gradient(760px 480px at 88% 22%, rgba(56,189,248,0.12), transparent 60%),
  radial-gradient(820px 560px at 8% 78%, rgba(129,140,248,0.10), transparent 60%),
  linear-gradient(180deg, #ffffff 0%, #f4f5fb 100%)
`;

// Mobile: "medyo white na may indigo" na gradient (mas makita ang indigo tint)
const MOBILE_GRADIENT = `
  radial-gradient(720px 460px at 50% -8%, rgba(99,102,241,0.24), transparent 62%),
  radial-gradient(640px 420px at 90% 22%, rgba(56,189,248,0.16), transparent 60%),
  radial-gradient(680px 500px at 8% 82%, rgba(129,140,248,0.14), transparent 60%),
  linear-gradient(180deg, #ffffff 0%, #eef2fc 100%)
`;

/*
 * "Get Started" onboarding screen (shown right after the splash).
 *
 * MOBILE:
 *   - Hero video (public/getstarted.mp4) fills the upper portion with a large
 *     smooth curved BOTTOM edge (oversized ellipse via border-radius).
 *   - White content section sits underneath and comes up behind the curve.
 *   - Entrance ("pasalubong"): video slides DOWN, content slides UP together.
 *
 * DESKTOP:
 *   - Video sits in the LEFT panel with a large smooth curved RIGHT edge.
 *   - White content sits in the RIGHT panel.
 *   - Entrance ("pasalubong"): video slides from the LEFT, content from the RIGHT.
 *
 * Both settle exactly at final positions with a premium ease-out
 * (cubic-bezier(0.22, 1, 0.36, 1)), no bounce / no overshoot.
 */
export const GetStarted: React.FC = () => {
  const { setPage } = useStore();

  const goToSignIn = () => setPage('signin');

  const mobileContent = (
    <>
      <h1 className="mt-2 text-[26px] leading-tight font-black text-stone-900">Wear Confidence</h1>

      <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-stone-500">
        Discover apparel, shoes, and accessories curated for the modern you.
      </p>

      <button
        onClick={goToSignIn}
        className="mt-2 w-full max-w-[180px] py-4 rounded-full bg-indigo-600 text-white text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        Get Started
      </button>
    </>
  );

  const desktopContent = (
    <>
      <p className="text-xs font-black tracking-[0.45em] uppercase text-indigo-500">
        The Modern Apparel Store
      </p>

      <h1 className="mt-4 text-5xl xl:text-6xl leading-tight font-black text-stone-900">Wear Confidence</h1>

      <p className="mt-6 max-w-md text-base xl:text-lg leading-relaxed text-stone-500">
        Discover apparel, shoes, and accessories curated for the modern you.
      </p>

      <div className="mt-10 w-full max-w-md space-y-4 text-left">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-sm text-stone-600">Premium fabrics and tailored, true-to-size fits</p>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-sm text-stone-600">Fast, trackable delivery straight to your door</p>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-sm text-stone-600">Hassle-free 7-day returns and exchanges</p>
        </div>
      </div>

      <button
        onClick={goToSignIn}
        className="mt-10 w-full max-w-[320px] py-4 rounded-full bg-indigo-600 text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        Get Started
      </button>
    </>
  );

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white"
      exit={{ opacity: 0, y: -30, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* ===== MOBILE LAYOUT (video top + curved bottom, content below) ===== */}
      <div className="md:hidden flex flex-col flex-1 min-h-0" style={{ backgroundImage: MOBILE_GRADIENT }}>
        {/* ===== HERO VIDEO (slides DOWN toward its final position) ===== */}
        <motion.div
          className="relative overflow-hidden shrink-0 w-full"
          style={{ height: 'min(70vh, 520px)', minHeight: 340, borderRadius: '0 0 999px 999px / 0 0 250px 260px' }}
          initial={{ y: -90 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/getstarted.mp4"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="auto"
          />
        </motion.div>

        {/* ===== WHITE CONTENT (slides UP toward its final position) ===== */}
        <motion.div
          className="relative flex-1 flex flex-col items-center justify-center px-8 text-center overflow-y-auto"
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {mobileContent}
        </motion.div>
      </div>

      {/* ===== DESKTOP LAYOUT (video LEFT + curved right edge, content RIGHT) ===== */}
      <div className="hidden md:flex flex-1 min-h-0" style={{ backgroundImage: HOME_GRADIENT }}>
        {/* HERO VIDEO (slides in from the LEFT toward final position) */}
        <motion.div
          className="relative w-[52%] overflow-hidden shrink-0"
          style={{ borderRadius: '0 999px 999px 0 / 0 250px 250px 0' }}
          initial={{ x: -90 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/getstarted.mp4"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="auto"
          />
        </motion.div>

        {/* WHITE CONTENT (slides in from the RIGHT toward final position) */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-12 text-center"
          initial={{ x: 140 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {desktopContent}
        </motion.div>
      </div>
    </motion.div>
  );
};