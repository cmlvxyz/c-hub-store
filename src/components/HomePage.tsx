import React from 'react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { ArrowRight, Star, Shirt, Footprints, Tag, Glasses } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setPage, setGender } = useStore();

  const categories: { id: PageType; title: string; desc: string; icon: React.ReactNode; bg: string; defaultGender: GenderType }[] = [
    { id: 'clothes', title: 'Clothes', desc: 'Tees, hoodies & sweatshirts', icon: <Shirt className="w-8 h-8" />, bg: 'bg-[#1a1716]', defaultGender: 'men' },
    { id: 'shoes', title: 'Shoes', desc: 'Everyday footwear', icon: <Footprints className="w-8 h-8" />, bg: 'bg-[#27345b]', defaultGender: 'men' },
    { id: 'pants', title: 'Pants', desc: 'Denim, joggers & trousers', icon: <Tag className="w-8 h-8" />, bg: 'bg-[#3f3128]', defaultGender: 'men' },
    { id: 'underwear', title: 'Underwear', desc: 'Everyday basics', icon: <Shirt className="w-8 h-8" />, bg: 'bg-[#432838]', defaultGender: 'men' },
    { id: 'accessories', title: 'Accessories', desc: 'Finish the look', icon: <Glasses className="w-8 h-8" />, bg: 'bg-[#264441]', defaultGender: 'men' }
  ];

  return (
    <div className="w-full space-y-14 py-6 animate-fadeIn">
      
      {/* ===== HERO SECTION ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="relative rounded-[2.5rem] bg-white dark:bg-stone-900 text-stone-900 dark:text-white overflow-hidden p-8 sm:p-12 lg:p-16">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Eyebrow / Badge */}
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500">
                <span className="w-6 h-[2px] bg-indigo-500" />
                New Season Drop
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.05] text-stone-900 dark:text-white">
                Wear the <br />
                <em className="text-indigo-500 not-italic">story</em> <br />
                you write.
              </h1>

              <p className="relative top-8 text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-md leading-relaxed">
                Premium streetwear built for comfort, cut for confidence. Explore tees, hoodies, sweatshirts, and more — designed for the way you actually move through your day.
              </p>

              {/* Action Buttons */}
              <div className="relative top-15 pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setPage('shop')}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 font-medium rounded-full transition-all flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
                >
                  <span>Shop the collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('aboutStorySection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 text-stone-700 dark:text-white font-medium rounded-full transition-all border-b-2 border-stone-400 dark:border-stone-500 hover:border-indigo-500 hover:text-indigo-500 text-sm"
                >
                  Our story
                </button>
              </div>

            </div>

            {/* Right Hero - Hang Tags */}
            <div className="lg:col-span-5 flex items-center justify-center relative h-[340px]">
              
              {/* Tag 1 - Bottom Right (navy) */}
              <div className="absolute -bottom-20 right-0 w-52 bg-[#27345b] shadow-lg border border-white/10 rounded-2xl p-4 rotate-6 z-10">
                <div className="w-5 h-5 rounded-full bg-stone-300/50 mb-5" />
                <p className="text-[10px] uppercase tracking-wider text-white/60">Fabric</p>
                <p className="font-serif font-bold text-lg text-white">100% Cotton</p>
              </div>

              {/* Tag 2 - Top Left (ink/dark) */}
              <div className="absolute top-1 left-0 w-52 bg-[#1a1716] shadow-lg border border-white/10 rounded-2xl p-4 -rotate-6 z-20">
                <div className="w-5 h-5 rounded-full bg-stone-300/50 mb-5" />
                <p className="text-[10px] uppercase tracking-wider text-white/60">Est.</p>
                <p className="font-serif font-bold text-lg text-white">C-HUB 2024</p>
              </div>

              {/* Center Product Image */}
              <div 
                className="relative top-10 w-48 h-48 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-white/10 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm group cursor-pointer overflow-hidden"
                onClick={() => setPage('clothes', 'tshirt', 'men')}
              >
                <img 
                  src="/images/clothes/men/t-shirts/white.png" 
                  alt="Featured Streetwear Tee"
                  className="w-45 h-45 object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%232A3459"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ===== STAT STRIP ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-stone-200 dark:border-stone-800 pt-6">
          <div>
            <p className="text-2xl font-black text-stone-900 dark:text-white font-serif">10,000+</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Customers dressed since launch</p>
          </div>

          <div>
            <p className="text-2xl font-black text-stone-900 dark:text-white font-serif">5</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Categories, one shared standard</p>
          </div>

          <div>
            <p className="text-2xl font-black text-stone-900 dark:text-white font-serif">4.8/5</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Average rating across collections</p>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-900 dark:text-white">
            Shop by category
          </h2>
          <button
            onClick={() => setPage('shop')}
            className="text-sm font-medium text-stone-600 dark:text-stone-400 border-b-2 border-stone-600 dark:border-stone-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setGender(cat.defaultGender);
                setPage(cat.id);
              }}
              className={`${cat.bg} text-white rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 text-left group min-h-[160px] flex flex-col justify-end`}
            >
              <div className="text-white/70 group-hover:text-white transition-colors mb-2">
                {cat.icon}
              </div>
              <h3 className="font-bold text-base">{cat.title}</h3>
              <p className="text-xs text-white/60 mt-0.5">{cat.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ===== OUR STORY / ABOUT SECTION ===== */}
      <section id="aboutStorySection" className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-900 dark:text-white mb-4">
            Our Story
          </h2>
          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
            C-HUB started in 2024 with a simple idea: everyday clothing should feel as good as it looks. 
            What began as a small run of T-shirts has grown into a full lineup of streetwear built on the same standard — 
            quality materials, honest pricing, and designs made for how people actually move through their day.
          </p>
        </div>
      </section>

    </div>
  );
};