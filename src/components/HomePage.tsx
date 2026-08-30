import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { ArrowRight, Shirt, Footprints, Tag, Glasses, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setPage, setGender, splashShown } = useStore();

  const categories: { id: PageType; title: string; desc: string; icon: React.ReactNode; bg: string; defaultGender: GenderType }[] = [
    { id: 'clothes', title: 'Clothes', desc: 'Tees, hoodies & sweatshirts', icon: <Shirt className="w-7 h-7" />, bg: 'bg-[#1a1716]', defaultGender: 'men' },
    { id: 'shoes', title: 'Shoes', desc: 'Everyday street footwear', icon: <Footprints className="w-7 h-7" />, bg: 'bg-[#27345b]', defaultGender: 'men' },
    { id: 'pants', title: 'Pants', desc: 'Denim, joggers & cargo', icon: <Tag className="w-7 h-7" />, bg: 'bg-[#3f3128]', defaultGender: 'men' },
    { id: 'underwear', title: 'Underwear', desc: 'Everyday comfort basics', icon: <Shirt className="w-7 h-7" />, bg: 'bg-[#432838]', defaultGender: 'men' },
    { id: 'accessories', title: 'Accessories', desc: 'Finish your silhouette', icon: <Glasses className="w-7 h-7" />, bg: 'bg-[#264441]', defaultGender: 'men' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{
        opacity: splashShown ? 1 : 0,
        y: splashShown ? 0 : -50
      }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-12 sm:space-y-16 py-4 sm:py-6"
    >
      {/* WALA NA YUNG HEADER DITO. Nasa App.tsx na siya! */}

      {/* ===== HERO SECTION ===== */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-white via-indigo-50/40 to-stone-50 text-stone-900 overflow-hidden p-8 sm:p-12 lg:p-16">
          
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow / Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-[11px] font-black uppercase tracking-wider border border-indigo-200">
                <span>New Season Drop • 2026 Collection</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.08] text-stone-900">
                Wear the <br />
                <span className="text-indigo-600 italic">story</span> <br />
                you write.
              </h1>

              <p className="text-stone-600 text-sm sm:text-base max-w-md leading-relaxed font-medium">
                Premium streetwear crafted with heavyweight organic cotton, cut for confidence, and designed for how you actually move through your day.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => setPage('shop')}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('aboutStorySection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 text-stone-800 hover:text-indigo-600 font-bold rounded-full transition-all bg-white hover:bg-stone-50 border border-stone-300 text-sm shadow-sm cursor-pointer"
                >
                  Our Philosophy
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-stone-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Cotton & Preshrunk</span>
                </div>
              </div>

            </div>

            {/* Right Hero - Hang Tags & Featured Piece */}
            <div className="lg:col-span-5 flex items-center justify-center relative h-[360px] lg:-left-20">
              
              {/* Hang Tag 1 - Navy */}
              <motion.div 
                animate={{ rotate: [6, 8, 6], y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-10 -right-10 w-52 bg-[#27345b] text-white shadow-2xl border border-white/10 rounded-2xl p-4 z-10"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 mb-5" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Material Standard</p>
                <p className="font-serif font-bold text-lg text-white">240 GSM Heavyweight</p>
              </motion.div>

              {/* Hang Tag 2 - Obsidian */}
              <motion.div 
                animate={{ rotate: [-6, -4, -6], y: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-10 w-52 bg-[#1a1716] text-white shadow-2xl border border-white/10 rounded-2xl p-4 z-20"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Authentic Drop</p>
                <p className="font-serif font-bold text-lg text-white">C-HUB Studio 2026</p>
              </motion.div>

              {/* Center Interactive Showcase Trigger */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                onClick={() => setPage('clothes', 'tshirt', 'men')}
                className="relative w-56 h-56 rounded-3xl bg-white border border-stone-200 flex flex-col items-center justify-center shadow-2xl group cursor-pointer overflow-hidden p-3"
              >
                <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Featured
                </div>
                <img 
                  src="/images/clothes/men/t-shirts/white.png" 
                  alt="Featured Streetwear Tee"
                  className="w-44 h-44 object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%234f46e5"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-size="16"%3EC-HUB TEE%3C/text%3E%3C/svg%3E';
                  }}
                />
                <p className="text-[11px] font-bold text-stone-800 uppercase tracking-wider mt-1 group-hover:text-indigo-600 transition-colors">
                  Explore T-Shirts →
                </p>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* ===== STAT STRIP ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
          <div className="p-4">
            <p className="text-3xl font-black text-stone-900 font-serif">15,000+</p>
            <p className="text-xs text-stone-500 font-medium mt-1">Wardrobes upgraded across the country</p>
          </div>

          <div className="p-4 border-y md:border-y-0 md:border-x border-stone-200">
            <p className="text-3xl font-black text-indigo-600 font-serif">5 Curated</p>
            <p className="text-xs text-stone-500 font-medium mt-1">Core categories, one uncompromising standard</p>
          </div>

          <div className="p-4">
            <p className="text-3xl font-black text-stone-900 font-serif">4.9 / 5.0</p>
            <p className="text-xs text-stone-500 font-medium mt-1">Verified buyer satisfaction rating</p>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Curated Lineup</span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => setPage('shop')}
            className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setGender(cat.defaultGender);
                setPage(cat.id);
              }}
              className={`${cat.bg} text-white rounded-3xl p-5 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 text-left group min-h-[170px] flex flex-col justify-between cursor-pointer border border-white/10 relative overflow-hidden`}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-serif">{cat.title}</h3>
                <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ===== OUR STORY SECTION ===== */}
      <section id="aboutStorySection" className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 text-white space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Our Heritage</span>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-white max-w-xl">
            Designed for durability, styled for individuality.
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            C-HUB was founded in 2024 with a clear mandate: clothing should feel effortless, fit impeccably, and hold its shape wash after wash. From our signature peplum tops and tailored cargo pants to cloud-soft fleece hoodies, every stitch represents our dedication to modern urban lifestyle.
          </p>
        </div>
      </section>

    </motion.div>
  );
};