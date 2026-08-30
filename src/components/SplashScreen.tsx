import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Box, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { splashShown, closeSplash } = useStore();
  const [stage, setStage] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (splashShown) return;

    // New timeline:
    // 0        : White bg. Indigo-500 box spawns spinning and flies to center.
    // 550ms    : Box reaches center -> box turns WHITE, bg flips to INDIGO GRADIENT.
    // 1500ms   : C-HUB letters reveal (premium stagger).
    // 3000ms   : Slogan fades in + hold.
    // 4200ms   : Exit (blur + scale out).

    const t1 = setTimeout(() => setStage(1), 550);
    const t2 = setTimeout(() => setStage(2), 1550);
    const t3 = setTimeout(() => setStage(3), 3200);
    const t4 = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => closeSplash(), 700);
    }, 4250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [splashShown, closeSplash]);

  if (splashShown) return null;

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => closeSplash(), 350);
  };

  const brandLetters = ['c', '-', 'h', 'u', 'b'];

  // White icon vs indigo icon (crossfade when the box swaps color at center)
  const boxOnIndigo = stage < 1; // white icon visible while the squircle is indigo
  const boxOnWhite = stage >= 1; // indigo icon visible once the squircle turns white

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="chub-splash-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: 'blur(10px)',
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white select-none overflow-hidden bg-white"
        >
          {/* ===== BACKGROUND LAYERS (white -> indigo gradient) ===== */}
          <div className="absolute inset-0 pointer-events-none">
            {/* White layer (initial) */}
            <motion.div
              className="absolute inset-0 bg-white"
              animate={{ opacity: boxOnIndigo ? 1 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
            {/* Indigo gradient layer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 45%, #7C3AED 100%)',
              }}
              animate={{ opacity: boxOnIndigo ? 0 : 1 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            />
          </div>

          {/* Ambient radial glow (only on the indigo gradient layer) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: boxOnIndigo ? 0 : 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full bg-white/10 blur-3xl"
            />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 1.2px, transparent 1.2px)',
                backgroundSize: '26px 26px',
              }}
            />
          </motion.div>

          {/* ===== CENTRAL CONTENT ===== */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* THE SPINNING BOX */}
            <motion.div
              initial={{ scale: 0, rotate: -360, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 210,
                damping: 15,
                mass: 0.95,
              }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
            >
              {/* Indigo squircle (visible while white icon is shown) */}
              <motion.div
                className="absolute inset-0 rounded-[1.75rem]"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                animate={{ scale: boxOnWhite ? 0.92 : 1, opacity: boxOnWhite ? 0 : 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />

              {/* White squircle (visible once bg is indigo gradient) */}
              <motion.div
                className="absolute inset-0 rounded-[1.75rem] bg-white shadow-2xl shadow-black/20"
                animate={{ scale: boxOnWhite ? 1 : 0.92, opacity: boxOnWhite ? 1 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />

              {/* Spinning dashed ring for polish (appears once centered on gradient) */}
              <motion.div
                className="absolute -inset-5 rounded-[2rem] border-2 border-dashed border-white/25"
                animate={{ rotate: 360, opacity: boxOnWhite ? 1 : 0 }}
                transition={{ opacity: { duration: 0.6 }, rotate: { duration: 8, repeat: Infinity, ease: 'linear' } }}
              />

              {/* White box icon (on indigo squircle) */}
              <motion.div
                className="absolute flex items-center justify-center"
                animate={{ opacity: boxOnIndigo ? 1 : 0, scale: boxOnIndigo ? 1 : 0.6 }}
                transition={{ duration: 0.45 }}
              >
                <Box className="w-11 h-11 sm:w-12 sm:h-12 stroke-[2.4] text-white drop-shadow-lg" />
              </motion.div>

              {/* Indigo box icon (on white squircle) - matches brand outline cube */}
              <motion.div
                className="absolute flex items-center justify-center"
                animate={{ opacity: boxOnWhite ? 1 : 0, scale: boxOnWhite ? 1 : 0.6 }}
                transition={{ duration: 0.45 }}
              >
                <Box className="w-11 h-11 sm:w-12 sm:h-12 stroke-[2.4] text-indigo-600" />
              </motion.div>
            </motion.div>

            {/* C-HUB BRAND TEXT (reveals after the swap) */}
            <div className="mt-10 sm:mt-12 flex flex-col items-center">
              <div className="flex items-center overflow-visible pl-6 sm:pl-7">
                {brandLetters.map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.4, rotate: 12, filter: 'blur(8px)' }}
                    animate={{
                      opacity: stage >= 2 ? 1 : 0,
                      y: stage >= 2 ? 0 : 30,
                      scale: stage >= 2 ? 1 : 0.4,
                      rotate: stage >= 2 ? 0 : 12,
                      filter: stage >= 2 ? 'blur(0px)' : 'blur(8px)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 18,
                      mass: 0.7,
                      delay: 0.06 * index,
                    }}
                    className={`text-[3.4rem] sm:text-7xl md:text-[5.5rem] leading-none font-black tracking-tight inline-block text-white ${
                      char === '-' ? 'text-indigo-300 mx-1 sm:mx-1.5 font-mono font-black -mt-1' : ''
                    }`}
                    style={char !== '-' ? { textShadow: '0 8px 30px rgba(0,0,0,0.25)' } : undefined}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Underline that draws across under the word */}
              <motion.div
                className="h-[3px] rounded-full bg-gradient-to-r from-indigo-300 via-white to-indigo-300 mt-3"
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: stage >= 2 ? '100%' : 0,
                  opacity: stage >= 2 ? 0.9 : 0,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              />
            </div>

            {/* SLOGAN */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: stage >= 3 ? 0.9 : 0, y: stage >= 3 ? 0 : 18 }}
              transition={{ duration: 0.5 }}
              className="absolute top-[calc(100%+42px)] left-1/2 -translate-x-1/2 w-max text-xs sm:text-sm font-bold tracking-widest uppercase text-indigo-100/90 font-mono"
            >
              Wear Confidence • Define Your Style
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
