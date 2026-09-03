import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageType } from '../types';
import { Search } from 'lucide-react';

interface CategoryItem {
  id: PageType;
  title: string;
  desc: string;
  bgColor: string;
  icon: React.ReactNode;
}

export const ShopPage: React.FC = () => {
  const { gender, setPage } = useStore();
  const [search, setSearch] = useState('');

  const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1);

  const categoryCards: CategoryItem[] = [
    {
      id: 'clothes',
      title: 'Clothes',
      desc: 'T-Shirts, hoodies & sweatshirts',
      bgColor: 'bg-[#1a1716]', // Dark obsidian / charcoal
      icon: (
        <i className="fa-solid fa-shirt text-4xl md:text-5xl text-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"></i>
      )
    },
    {
      id: 'shoes',
      title: 'Shoes',
      desc: 'Sneakers, boots & footwear',
      bgColor: 'bg-[#27345b]', // Navy blue
      icon: (
        /* Precise Shoe vector icon matching fa-solid fa-shoe style */
        <svg
          viewBox="0 0 512 512"
          className="w-20 h-20 sm:w-14 sm:h-14 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
        >
          <path d="M499.7 348.6c-4.4-10.4-13.4-18.4-24.3-21.7l-97.4-29.2-34.9-76.7c-7.9-17.4-25.2-28.7-44.3-29l-92.4-1.3c-13.5-.2-26.3 5.4-35.3 15.3L123.6 258c-4.2 4.6-9.8 7.7-16 8.8l-72.3 12.8C15.8 283.1 0 300.2 0 320.6V384c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64v-11.4c0-8.6-4.5-16.6-12.3-24zM304 256h-48l-24-48h56l16 48z" />
        </svg>
      )
    },
    {
      id: 'pants',
      title: 'Pants',
      desc: 'Denim jeans, joggers & trousers',
      bgColor: 'bg-[#3f3128]', // Espresso brown
      icon: (
        /* Precise Trousers/Pants vector icon matching fa-solid fa-pants style */
        <svg
          viewBox="0 0 512 512"
          className="w-20 h-20 sm:w-12 sm:h-12 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
        >
          <path d="M96 32c-17.7 0-32 14.3-32 32v128c0 14.1 9.3 26.2 22.8 29.8L128 448c4.4 26.5 27.3 46 54.1 46h43.9c16.2 0 30.7-10.8 35.4-26.3l34.6-115.7 34.6 115.7c4.7 15.6 19.2 26.3 35.4 26.3H410c26.8 0 49.7-19.5 54.1-46l41.2-226.2c13.5-3.6 22.8-15.7 22.8-29.8V64c0-17.7-14.3-32-32-32H96zm128 64h64v32h-64V96z" />
        </svg>
      )
    },
    {
      id: 'underwear',
      title: 'Underwear',
      desc: 'Everyday boxers & briefs',
      bgColor: 'bg-[#432838]', // Deep plum / maroon
      icon: (
        /* Precise Underwear/Briefs vector icon matching fa-solid fa-briefs style */
        <svg
          viewBox="0 0 512 512"
          className="w-20 h-20 sm:w-14 sm:h-14 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
        >
          <path d="M70 96c-17.7 0-32 14.3-32 32v64c0 35.3 14.3 69.1 39.5 93.8l70.1 68.7c15.6 15.3 36.8 23.5 58.4 23.5h112c21.6 0 42.8-8.2 58.4-23.5l70.1-68.7c25.2-24.7 39.5-58.5 39.5-93.8v-64c0-17.7-14.3-32-32-32H64zm160 64h64v32h-64v-32z" />
        </svg>
      )
    },
    {
      id: 'accessories',
      title: 'Accessories',
      desc: 'Bags, caps & essentials',
      bgColor: 'bg-[#264441]', // Forest teal green
      icon: (
        <i className="fa-solid fa-gem text-5xl sm:text-5xl text-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"></i>
      )
    }
  ];

  const filteredCategories = categoryCards.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return cat.title.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q);
  });

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-9 sm:space-y-11 animate-fadeIn">
      
      {/* Title, Subtitle, and Search Bar */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-stone-900 dark:text-white">
          Shop by Category
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-[15px] leading-relaxed max-w-xl mx-auto">
          Pick a category to browse. Every piece is built on the same standard –
          quality materials, honest pricing, everyday comfort.
        </p>

        {/* Centered Search Pill */}
        <div className="relative max-w-md w-full mx-auto pt-3">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-5 pr-11 py-3 rounded-full bg-white dark:bg-indigo-900 border-[1px] border-indigo-500 dark:border-indigo-500 text-sm text-stone-900 dark:text-white placeholder-stone-400 shadow-sm transition-all"
          />
          <Search className="absolute right-4 top-[35px] -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* 5 Compact Category Cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 justify-center">
        {filteredCategories.map((cat) => (
          <button
            key={cat.id}
            id={`shopCat-${cat.id}`}
            onClick={() => setPage(cat.id)}
            className={`${cat.bgColor} text-white rounded-[1.75rem] p-5 sm:p-6 min-h-[260px] sm:min-h-[280px] flex flex-col items-center justify-between text-center transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-95 shadow-md group cursor-pointer overflow-hidden relative`}
          >
            {/* Top / Center Category Icon matching request */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              {cat.icon}
            </div>

            {/* Middle & Bottom Text */}
            <div className="space-y-1 pb-1 w-full z-10">
              <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
                {cat.title}
              </h3>
              <p className="text-xs text-white/80 font-normal leading-tight px-1 line-clamp-2">
                {cat.desc}
              </p>
              <span className="text-[11px] font-medium text-white/60 pt-1.5 block">
                {genderLabel}
              </span>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};

