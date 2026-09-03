import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS_CONFIG } from '../data/products';
import { ProductVisual } from './ProductVisual';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  ShoppingBag,
  Check,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react';
import { GenderType, PageType } from '../types';

export const ProductShowcase: React.FC = () => {
  const {
    page,
    gender,
    subCategory,
    currentProductIndex,
    setPage,
    setGender,
    setSubCategory,
    setCurrentProductIndex,
    addToCart,
    user,
    isDarkTheme,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>(subCategory);
  const [selectedSize, setSelectedSize] = useState<string>('XL');
  const [direction, setDirection] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const categoryKey = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page)
    ? page
    : 'clothes';

  const categoryConfig = PRODUCTS_CONFIG[categoryKey]?.[gender] || PRODUCTS_CONFIG['clothes']['men'];
  const currentSubCategory = categoryConfig.subCategories.includes(subCategory)
    ? subCategory
    : categoryConfig.defaultSubCategory;

  const currentProducts = categoryConfig.products[currentSubCategory] || [];
  const activeProduct = currentProducts[currentProductIndex] || currentProducts[0];

  const defaultSizes = ['XL', '2XL', '3XL', '4XL'];
  const availableSizes = categoryConfig.sizes[currentSubCategory] || defaultSizes;
  const basePriceObj = categoryConfig.basePrices[currentSubCategory] || { price: 10000, original: 15000 };

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [currentSubCategory, availableSizes]);

  useEffect(() => {
    setActiveTab(currentSubCategory);
  }, [currentSubCategory]);

  const handleNextProduct = () => {
    if (currentProducts.length <= 1) return;
    setDirection(1);
    setCurrentProductIndex((currentProductIndex + 1) % currentProducts.length);
  };

  const handlePrevProduct = () => {
    if (currentProducts.length <= 1) return;
    setDirection(-1);
    setCurrentProductIndex((currentProductIndex - 1 + currentProducts.length) % currentProducts.length);
  };

  const handleNextSize = () => {
    const currentIndex = availableSizes.indexOf(selectedSize);
    if (currentIndex < availableSizes.length - 1) {
      setSelectedSize(availableSizes[currentIndex + 1]);
    } else {
      setSelectedSize(availableSizes[0]);
    }
  };

  const handlePrevSize = () => {
    const currentIndex = availableSizes.indexOf(selectedSize);
    if (currentIndex > 0) {
      setSelectedSize(availableSizes[currentIndex - 1]);
    } else {
      setSelectedSize(availableSizes[availableSizes.length - 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextProduct();
      if (e.key === 'ArrowLeft') handlePrevProduct();
      if (e.key === 'ArrowUp') handlePrevSize();
      if (e.key === 'ArrowDown') handleNextSize();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProductIndex, currentProducts.length, selectedSize, availableSizes]);

  const nextIndex = (currentProductIndex + 1) % (currentProducts.length || 1);
  const nextProduct = currentProducts[nextIndex];

  const handleAddToCart = () => {
    if (!user.isLoggedIn) {
      showToast('Please log in first to purchase or add to cart.', 'warning');
      setPage('login');
      return;
    }

    if (!activeProduct) return;

    addToCart({
      id: `${categoryKey}-${gender}-${currentSubCategory}-${activeProduct.colorName}-${selectedSize}`,
      name: `${activeProduct.name || activeProduct.colorName}`,
      price: basePriceObj.price,
      image: activeProduct.image,
      size: selectedSize,
      color: activeProduct.colorName,
      subCategory: currentSubCategory,
      gender: gender
    });

    setAddedAnimation(true);
    showToast(`Added ${activeProduct.name || activeProduct.colorName} to cart!`, 'success');
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  const textColorClass = isDarkTheme ? 'text-white' : 'text-stone-900';
  const subTextColorClass = isDarkTheme ? 'text-white/70' : 'text-stone-700';

  // ANIMATION LOGIC: 
  // - Current product exits to TOP-LEFT (↖) with fade
  // - Next product enters from BOTTOM-RIGHT (↘) with bounce
  const slideVariants: Variants = {
    enter: (dir: number) => {
      if (dir > 0) {
        // NEXT PRODUCT: Galing sa bottom-right (↘)
        return {
          x: 400,
          y: 300,
          scale: 0.3,
          opacity: 0,
          rotate: 10,
          zIndex: 30
        };
      }
      return {
        x: -400,
        y: -300,
        scale: 0.3,
        opacity: 0,
        rotate: -10,
        zIndex: 30
      };
    },
    center: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      zIndex: 20,
      transition: {
        duration: 2.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: (dir: number) => {
      if (dir > 0) {
        // CURRENT PRODUCT: Lumabas pa-top-left (↖)
        return {
          x: -350,
          y: -250,
          opacity: 0,
          scale: 0.4,
          rotate: -12,
          zIndex: 10,
          transition: {
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1]
          }
        };
      }
      return {
        x: 350,
        y: 250,
        opacity: 0,
        scale: 0.4,
        rotate: 12,
        zIndex: 10,
        transition: {
          duration: 1.5,
          ease: [0.22, 1, 0.36, 1]
        }
      };
    }
  };

  return (
    <div className="w-full relative transition-colors duration-700 py-3 sm:py-6 px-4 sm:px-8">
      <div className="max-w-85rem mx-auto min-h-40rem flex flex-col justify-between">
        
        {/* Top Product Category Tabs - Clothes, Pants, Shoes, Underwear, Accessories */}
        <div className="flex flex-wrap items-center justify-start gap-2 pb-3 border-black/5 dark:border-white/10 relative z-20 mt-6 ml-6 lg:ml-10">
          {(['clothes', 'pants', 'shoes', 'underwear', 'accessories'] as PageType[]).map((cat) => {
            const isSelected = page === cat;
            const categoryLabels: Record<string, string> = {
              clothes: 'Clothes',
              shoes: 'Footwear',
              pants: 'Pants',
              underwear: 'Underwear',
              accessories: 'Accessories'
            };
            const label = categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
            return (
              <button
                key={cat}
                onClick={() => setPage(cat)}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold tracking-wide capitalize transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/80 backdrop-blur-sm text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30 scale-105'
                    : isDarkTheme
                    ? 'bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 border border-white/5'
                    : 'bg-white/40 backdrop-blur-sm text-stone-700 hover:text-stone-900 hover:bg-white/60 border border-white/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 3-Column Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center relative py-4 flex-1">
          
          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-4 flex flex-col justify-center z-10">
            
            {/* Headline 1 */}
            <div className="relative -top-20 left-10">
              <h1 className={`text-4xl sm:text-5xl lg:text-[40px] font-serif font-bold leading-[1.08] tracking-tight transition-colors duration-500 ${textColorClass}`}>
                Wear Confidence
              </h1>
            </div>

            {/* Headline 2 */}
            <div className="relative -top-18 left-10">
              <h1 className={`text-4xl sm:text-5xl lg:text-[40px] font-serif font-bold leading-[1.08] tracking-tight transition-colors duration-500 ${textColorClass}`}>
                Define Your Style.
              </h1>
            </div>

            {/* Description - Hiwalay na container */}
            <div className="relative -top-10 left-10">
              <p className={`text-sm sm:text-base leading-relaxed ${subTextColorClass} max-w-sm font-normal transition-colors duration-500`}>
                Discover premium T-shirts, hoodies, and sweatshirts designed for comfort, quality, and everyday expression.
              </p>
            </div>

            {/* ===== SUB CATEGORY SWITCHER - Glass Effect Pills ===== */}
            <div className="relative left-6 lg:left-8 top-12 sm:top-16 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold">
              {categoryConfig.subCategories.map((sub) => {
                const label = categoryConfig.subCategoryLabels[sub] || sub;
                const isSelected = activeTab === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      setActiveTab(sub);
                      setSubCategory(sub);
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold capitalize transition-all duration-300 ${
                      isSelected
                        ? 'bg-indigo-500/80 backdrop-blur-sm text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30 scale-105'
                        : isDarkTheme
                        ? 'bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 border border-white/5'
                        : 'bg-white/40 backdrop-blur-sm text-stone-700 hover:text-stone-900 hover:bg-white/60 border border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* ===== GENDER SELECTION - Glass Effect ===== */}
            <div className="relative left-10 top-24 pt-2 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                {(['men', 'women', 'boys', 'girls'] as GenderType[]).map((g) => {
                  const isCurrentGender = gender === g;
                  return (
                    <button
                      key={g}
                      id={`gender-select-${g}`}
                      onClick={() => setGender(g)}
                      className={`text-sm font-bold capitalize transition-all duration-300 cursor-pointer px-3 py-1 rounded-full ${
                        isCurrentGender
                          ? 'bg-indigo-500/80 backdrop-blur-sm text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30 scale-105'
                          : isDarkTheme
                          ? 'bg-white/10 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/20'
                          : 'bg-white/40 backdrop-blur-sm text-stone-700 hover:text-stone-900 hover:bg-white/60'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===== SOCIAL ICONS ===== */}
            <div className={`relative left-10 top-28 pt-6 flex items-center gap-5 transition-colors duration-500 ${isDarkTheme ? 'text-white/80' : 'text-stone-700'}`}>
              <a href="#instagram" aria-label="Instagram" className="hover:opacity-100 opacity-80 transition-opacity">
                <Instagram className="w-5 h-5 stroke-[2]" />
              </a>
              <a href="#x" aria-label="X" className="font-bold text-base hover:opacity-100 opacity-80 transition-opacity">
                𝕏
              </a>
              <a href="#facebook" aria-label="Facebook" className="hover:opacity-100 opacity-80 transition-opacity">
                <Facebook className="w-5 h-5 stroke-[2]" />
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="hover:opacity-100 opacity-80 transition-opacity">
                <Linkedin className="w-5 h-5 stroke-[2]" />
              </a>
              <a href="#tiktok" aria-label="TikTok" className="hover:opacity-100 opacity-80 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
              </a>
            </div>

          </div>

          {/* ===== CENTER COLUMN: Product Image ===== */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2 lg:-top-10">
            
            <div className="relative w-full max-w-[380px] sm:max-w-[440px] flex flex-col items-center justify-center">
              
              {/* Product Visual Container */}
              <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center overflow-visible">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  {activeProduct && (
                    <motion.div
                      key={`${activeProduct.name}-${activeProduct.colorName}-${currentProductIndex}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full h-full flex items-center justify-center select-none absolute inset-0"
                    >
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <ProductVisual
                          category={categoryKey}
                          subCategory={currentSubCategory}
                          colorName={activeProduct.colorName}
                          bgColor={activeProduct.bgColor}
                          name={activeProduct.name}
                          image={activeProduct.image}
                          className="w-full h-full object-contain filter drop-shadow-2xl"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ground Shadow */}
              <motion.div 
                animate={{ scale: [1, 0.94, 1], opacity: [0.35, 0.22, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-52 sm:w-64 h-8 rounded-[100%] bg-stone-950 dark:bg-black blur-md mt-1 transition-all duration-300"
                style={{
                  filter: 'blur(7px)',
                  transform: 'scaleY(0.55)'
                }}
              />

              {/* Slogan */}
              <div className="mt-6 text-center space-y-0.5 select-none transition-colors duration-500">
                <p className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${textColorClass}`}>
                  Dress Better.
                </p>
                <p className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${textColorClass}`}>
                  Feel Better.
                </p>
              </div>

              {/* Navigation Arrows */}
              {currentProducts.length > 1 && (
                <>
                  <button
                    id="prevProductBtn"
                    onClick={handlePrevProduct}
                    className="absolute left-[-12px] sm:left-[-24px] bottom-16 sm:bottom-20 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-stone-700/80 hover:bg-stone-900 text-white shadow-xl hover:scale-110 active:scale-95 z-20 cursor-pointer border border-white/10"
                    aria-label="Previous garment"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </button>

                  <button
                    id="nextProductBtn"
                    onClick={handleNextProduct}
                    className="absolute right-[-12px] sm:right-[-24px] bottom-16 sm:bottom-20 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-stone-700/80 hover:bg-stone-900 text-white shadow-xl hover:scale-110 active:scale-95 z-20 cursor-pointer border border-white/10"
                    aria-label="Next garment"
                  >
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </>
              )}

            </div>

          </div>

          {/* ===== RIGHT COLUMN: Price & Size ===== */}
          <div className="lg:col-span-3 space-y-7 flex flex-col justify-center lg:items-end text-left lg:text-right z-10">
            
            {/* Price */}
            <div className="space-y-1 relative lg:right-15 lg:-top-40">
              <div className={`text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight font-mono transition-colors duration-500 ${textColorClass}`}>
                #{basePriceObj.price.toLocaleString()}
              </div>
              <div className={`text-xl sm:text-2xl font-bold line-through tracking-tight font-mono transition-colors duration-500 ${subTextColorClass} opacity-60`}>
                #{basePriceObj.original.toLocaleString()}
              </div>
            </div>

            {/* Size */}
            <div className="space-y-3 relative lg:right-15 lg:-top-35">
              <p className={`text-xs font-bold tracking-tight capitalize transition-colors duration-500 ${textColorClass}`}>
                Choose your size
              </p>
              
              <div className="flex flex-wrap lg:justify-end items-center gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      id={`size-btn-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer  ${
                        isSelected
                          ? 'bg-white text-stone-950 shadow-xl border-2 border-stone-900 scale-110 ring-2 ring-black/10'
                          : isDarkTheme
                          ? 'bg-stone-800 text-white hover:bg-stone-700'
                          : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Floating Bottom-Right Container: Mini Thumbnail of NEXT Shirt */}
        <div className="fixed sm:absolute bottom-5 right-5 sm:right-35 sm:bottom-20 flex flex-col items-end gap-2 z-30">
          
          {/* Mini Thumbnail of NEXT Shirt */}
          {nextProduct && currentProducts.length > 1 && (
            <button
              id="nextItemCornerThumb"
              onClick={handleNextProduct}
              className="flex flex-col items-center justify-center p-1 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group bg-transparent select-none"
              title={`Next: ${nextProduct.name || nextProduct.colorName}`}
            >
              <div className="w-16 sm:w-20 aspect-square relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`thumb-${nextProduct.name}-${nextProduct.colorName}-${nextIndex}`}
                    initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.6, opacity: 0, rotate: 6 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <ProductVisual
                        category={categoryKey}
                        subCategory={currentSubCategory}
                        colorName={nextProduct.colorName}
                        bgColor={nextProduct.bgColor}
                        name={nextProduct.name}
                        image={nextProduct.image}
                        className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform"
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div 
                animate={{ scale: [1, 0.9, 1], opacity: [0.35, 0.2, 0.35] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 sm:w-12 h-2 rounded-[100%] bg-stone-950 dark:bg-black blur-[3px] -mt-1 transition-all"
                style={{
                  transform: 'scaleY(0.5)'
                }}
              />
            </button>
          )}

          {/* Add to Cart Button */}
          {user.isLoggedIn && (
            <button
              id="addToCartFloatingBtn"
              onClick={handleAddToCart}
              className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all duration-300 shadow-lg cursor-pointer ${
                addedAnimation
                  ? 'bg-emerald-600 text-white scale-105'
                  : isDarkTheme
                  ? 'bg-white text-stone-900 hover:bg-stone-100'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to cart</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};