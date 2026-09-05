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

const categoryCards: CategoryItem[] = [
  {
    id: 'clothes',
    title: 'Clothes',
    desc: 'T-Shirts, hoodies & sweatshirts',
    bgColor: 'bg-[#1a1716]',
    icon: (
      <i className="fa-solid fa-shirt text-4xl md:text-5xl text-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"></i>
    )
  },
  {
    id: 'shoes',
    title: 'Footwear',
    desc: 'Sneakers, boots & footwear',
    bgColor: 'bg-[#27345b]',
    icon: (
      <svg
        viewBox="0 0 512 512"
        className="w-10 h-10 md:w-14 md:h-14 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
      >
        <path d="M499.7 348.6c-4.4-10.4-13.4-18.4-24.3-21.7l-97.4-29.2-34.9-76.7c-7.9-17.4-25.2-28.7-44.3-29l-92.4-1.3c-13.5-.2-26.3 5.4-35.3 15.3L123.6 258c-4.2 4.6-9.8 7.7-16 8.8l-72.3 12.8C15.8 283.1 0 300.2 0 320.6V384c0 35.3 14.3 64 64 64h384c35.3 0 64-28.7 64-64v-11.4c0-8.6-4.5-16.6-12.3-24zM304 256h-48l-24-48h56l16 48z" />
      </svg>
    )
  },
  {
    id: 'pants',
    title: 'Bottom',
    desc: 'Denim jeans, joggers & trousers',
    bgColor: 'bg-[#3f3128]',
    icon: (
      <svg
        viewBox="0 0 512 512"
        className="w-10 h-10 md:w-12 md:h-12 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
      >
        <path d="M96 32c-17.7 0-32 14.3-32 32v128c0 14.1 9.3 26.2 22.8 29.8L128 448c4.4 26.5 27.3 46 54.1 46h43.9c16.2 0 30.7-10.8 35.4-26.3l34.6-115.7 34.6 115.7c4.7 15.6 19.2 26.3 35.4 26.3H410c26.8 0 49.7-19.5 54.1-46l41.2-226.2c13.5-3.6 22.8-15.7 22.8-29.8V64c0-17.7-14.3-32-32-32H96zm128 64h64v32h-64V96z" />
      </svg>
    )
  },
  {
    id: 'underwear',
    title: 'Underwear',
    desc: 'Everyday boxers & briefs',
    bgColor: 'bg-[#432838]',
    icon: (
      <svg
        viewBox="0 0 512 512"
        className="w-10 h-10 md:w-14 md:h-14 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
      >
        <path d="M70 96c-17.7 0-32 14.3-32 32v64c0 35.3 14.3 69.1 39.5 93.8l70.1 68.7c15.6 15.3 36.8 23.5 58.4 23.5h112c21.6 0 42.8-8.2 58.4-23.5l70.1-68.7c25.2-24.7 39.5-58.5 39.5-93.8v-64c0-17.7-14.3-32-32-32H64zm160 64h64v32h-64v-32z" />
      </svg>
    )
  },
  {
    id: 'accessories',
    title: 'Accessories',
    desc: 'Bags, caps & essentials',
    bgColor: 'bg-[#264441]',
    icon: (
      <i className="fa-solid fa-gem text-4xl md:text-5xl text-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"></i>
    )
  }
];

export const ShopPage: React.FC = () => {
  const { gender, setPage } = useStore();
  const [search, setSearch] = useState('');

  const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1);

  const filteredCategories = categoryCards.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return cat.title.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q);
  });

  return (
    <div className="w-full min-h-screen animate-fadeIn">
      <div className="max-w-lg md:max-w-[1240px] mx-auto px-4 md:px-8 py-6 md:py-12 space-y-5 md:space-y-9">

        <div className="text-center space-y-1 md:space-y-4">
          <h1 className="text-2xl md:text-5xl font-extrabold font-serif tracking-tight text-stone-900 dark:text-white">
            Shop by Category
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs md:text-[15px] leading-relaxed">
            Pick a category to browse. Every piece is built on the same standard &mdash;
            quality materials, honest pricing, everyday comfort.
          </p>

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 sm:gap-5 justify-center">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              id={`shopCat-${cat.id}`}
              onClick={() => setPage(cat.id)}
              className={`${cat.bgColor} text-white rounded-2xl md:rounded-[1.75rem] p-4 md:p-5 min-h-[150px] md:min-h-[260px]
                flex flex-col items-center justify-between text-center
                transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-95
                shadow-md group cursor-pointer overflow-hidden`}
            >
              <div className="w-10 h-10 md:w-24 md:h-24 flex items-center justify-center pt-1">
                {cat.icon}
              </div>
              <div className="space-y-0.5 md:space-y-1 w-full pb-0.5 md:pb-1 z-10">
                <h3 className="text-base md:text-xl font-serif font-bold tracking-tight text-white">
                  {cat.title}
                </h3>
                <p className="text-[10px] md:text-xs text-white/70 md:text-white/80 leading-tight line-clamp-2">
                  {cat.desc}
                </p>
                <span className="text-[10px] md:text-[11px] font-medium text-white/50 md:text-white/60 pt-1 md:pt-1.5 block">
                  {genderLabel}
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
