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

    // Timeline:
    // Step 0: Bouncing dot (0ms)
    // Step 1: Squircle + logo (450ms)
    // Step 2: Letters stagger (950ms)
    // Step 3: Hold (1800ms)
    // Step 4: Slogan appears (2600ms)
    // Exit after 3600ms (matagal para siguradong lumabas)
    
    const timer1 = setTimeout(() => setStage(1), 450);
    const timer2 = setTimeout(() => setStage(2), 950);
    const timer3 = setTimeout(() => setStage(3), 1800);
    const timer4 = setTimeout(() => setStage(4), 2600); // ✅ Slogan lalabas dito
    const timer5 = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        closeSplash();
      }, 650);
    }, 3600); // ✅ Exit pagkatapos lumabas ng slogan

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [splashShown, closeSplash]);

  if (splashShown) return null;

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      closeSplash();
    }, 350);
  };

  const brandLetters = ['c', '-', 'h', 'u', 'b'];

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
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#4338CA] text-white select-none overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 50%, #3730A3 100%)'
          }}
        >
          {/* Subtle Ambient Radial Lighting for depth */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.35, 0.55, 0.35]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-indigo-400/25 blur-3xl"
            />
            {/* Subtle particle grid */}
            <div 
              className="absolute inset-0 opacity-[0.06]" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1.2px, transparent 1.2px)', 
                backgroundSize: '28px 28px' 
              }} 
            />
          </div>

          {/* Central Animated Content */}
          <div className="relative flex items-center justify-center z-10">
            
            {/* Stage 0: The Bouncing White Dot before squircle appears */}
            {stage === 0 && (
              <div className="relative flex flex-col items-center justify-center">
                <motion.div
                  initial={{ y: -160, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: [ -160, 0, -40, 0, -15, 0 ],
                    opacity: [ 0, 1, 1, 1, 1, 1 ],
                    scaleY: [ 1.4, 0.6, 1.1, 0.8, 1.05, 1 ],
                    scaleX: [ 0.7, 1.4, 0.9, 1.2, 0.95, 1 ]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    times: [0, 0.35, 0.55, 0.75, 0.9, 1],
                    ease: "easeInOut" 
                  }}
                  className="w-7 h-7 rounded-full bg-white shadow-2xl shadow-white/40"
                />
              </div>
            )}

            {/* Stage 1, 2, 3, 4: The Black Squircle with Logo + Staggered Brand Letters */}
            {stage >= 1 && (
              <motion.div 
                className="flex items-center justify-center"
                initial={false}
                animate={{
                  x: 0
                }}
              >
                {/* 1. The Black Squircle Icon Box */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    x: stage >= 2 ? 0 : 0
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 340, 
                    damping: 22,
                    mass: 0.8
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] bg-[#111827] text-white flex items-center justify-center shadow-2xl shadow-black/40 border border-white/10 relative shrink-0 select-none z-20"
                >
                  {/* The C-HUB 3D Box Logo Mark inside the black squircle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Box className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.4] text-white filter drop-shadow-md" />
                  </motion.div>
                </motion.div>

                {/* 2. Staggered Brand Letters ("c - h u b") appearing sequentially */}
                <div className="flex items-center overflow-visible pl-4 sm:pl-5">
                  {stage >= 2 && brandLetters.map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, x: 25, scale: 0.6, rotate: 5 }}
                      animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 380,
                        damping: 20,
                        mass: 0.6,
                        delay: index * 0.08
                      }}
                      className={`text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-sans text-white inline-block ${
                        char === '-' ? 'text-indigo-300 mx-0.5 sm:mx-1 font-mono font-black' : ''
                      }`}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>

              </motion.div>
            )}

          </div>

          {/* ✅ SLOGAN SA BABA - LALABAS NA TALAGA KASI MAY STAGE 4 NA */}
          <div className="absolute bottom-12 inset-x-0 text-center z-20">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: stage >= 4 ? 0.9 : 0, 
                y: stage >= 4 ? 0 : 15 
              }}
              transition={{ duration: 0.45 }}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase text-indigo-100/90 font-mono"
            >
              Wear Confidence • Define Your Style
            </motion.p>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};