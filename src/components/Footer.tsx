import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { Box } from 'lucide-react';

export const Footer: React.FC = () => {
  const { page, setPage, setGender, showToast, activeBgColor, activeTextColor } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }
    showToast('Thank you for subscribing to C-HUB newsletter!', 'success');
    setEmail('');
  };

  const handleShopClick = (g: GenderType) => {
    setGender(g);
    setPage('clothes', 'tshirt', g);
  };

  const handleSupportClick = (p: PageType) => {
    setPage(p);
  };

  // Better dark color detection
  const isDark = activeTextColor === '#FFFFFF' || 
    activeTextColor === 'white' ||
    activeBgColor === '#111111' ||
    activeBgColor === '#1a1716' ||
    activeBgColor === '#27345b' ||
    activeBgColor === '#3f3128' ||
    activeBgColor === '#432838' ||
    activeBgColor === '#264441' ||
    activeBgColor === '#4A4A4A' ||
    activeBgColor === '#2A3459' ||
    activeBgColor === '#D44545' ||
    activeBgColor === '#2A8C5E' ||
    activeBgColor === '#CEB699' ||
    activeBgColor === '#806875' ||
    activeBgColor === '#648C7A' ||
    activeBgColor === '#572A34' ||
    activeBgColor === '#433630' ||
    activeBgColor === '#28479D' ||
    activeBgColor === '#6B432E' ||
    activeBgColor === '#B7857A' ||
    activeBgColor === '#CDA677' ||
    activeBgColor === '#8B654E' ||
    activeBgColor === '#3A3A3A' ||
    activeBgColor === '#36395F' ||
    activeBgColor === '#3A5A9A' ||
    activeBgColor === '#7A5A3A' ||
    activeBgColor === '#2A5A8A' ||
    activeBgColor === '#C44A4A' ||
    activeBgColor === '#3A7A4A' ||
    activeBgColor === '#E88A3A' ||
    activeBgColor === '#B44A4A' ||
    activeBgColor === '#4A7A5A' ||
    activeBgColor === '#2A3A5A' ||
    activeBgColor === '#8A8A8A' ||
    activeBgColor === '#223A67' ||
    activeBgColor === '#4A3328' ||
    activeBgColor === '#572A34';

  const isShowcase = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page);
  const footerBg = isShowcase ? (activeBgColor || '#111111') : '#ffffff';

  return (
    <footer 
      className="hidden md:block w-full pt-16 pb-12 mt-16 transition-colors duration-500"
      style={{ 
        backgroundColor: footerBg,
        ...(!isShowcase && {
          backgroundImage: `
            radial-gradient(900px 520px at 50% -6%, rgba(99,102,241,0.14), transparent 62%),
            radial-gradient(760px 480px at 88% 22%, rgba(56,189,248,0.12), transparent 60%),
            radial-gradient(820px 560px at 8% 78%, rgba(129,140,248,0.10), transparent 60%),
            linear-gradient(180deg, #ffffff 0%, #f4f5fb 100%)
          `,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }),
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Top Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-black text-2xl tracking-wide" style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}>
              <div className="w-8 h-8 flex items-center justify-center">
                <Box className="w-5 h-5 stroke-[2.5] text-indigo-600" />
              </div>
              <span>C-HUB</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              Redefining streetwear with bold silhouettes, premium fabrics, and timeless design for men, women, and youth.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://www.instagram.com/yourhandle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center text-sm"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                }}
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://www.facebook.com/cmlvyannnn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center text-sm"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                }}
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://www.twitter.com/yourhandle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center text-sm"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                }}
                aria-label="Twitter/X"
              >
                <i className="fab fa-x-twitter"></i>
              </a>
              <a 
                href="https://www.tiktok.com/@cmlvxyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center text-sm"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                }}
                aria-label="TikTok"
              >
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="font-bold text-base tracking-wider uppercase mb-4" style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}>
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleShopClick('men')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Men's Collection
                </button>
              </li>
              <li>
                <button onClick={() => handleShopClick('women')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Women's Collection
                </button>
              </li>
              <li>
                <button onClick={() => handleShopClick('boys')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Boys' Collection
                </button>
              </li>
              <li>
                <button onClick={() => handleShopClick('girls')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Girls' Collection
                </button>
              </li>
              <li>
                <button onClick={() => setPage('shop')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  All Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="font-bold text-base tracking-wider uppercase mb-4" style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}>
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleSupportClick('faq')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={() => handleSupportClick('shipping')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Shipping Info
                </button>
              </li>
              <li>
                <button onClick={() => handleSupportClick('returns')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => handleSupportClick('size-guide')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Size Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleSupportClick('contact')} className="hover:text-indigo-400 transition-colors" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h4 className="font-bold text-base tracking-wider uppercase mb-4" style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}>
              Stay Connected
            </h4>
            <p className="text-sm mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              Subscribe for exclusive drops, private sales, and secret discount codes.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                style={{ 
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)'
                }}
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
          <p>© 2026 C-HUB. All rights reserved.</p>
          <div className="flex items-center gap-4 text-lg" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
            <i className="fab fa-cc-visa hover:text-white transition-colors" title="Visa"></i>
            <i className="fab fa-cc-mastercard hover:text-white transition-colors" title="Mastercard"></i>
            <i className="fab fa-cc-paypal hover:text-white transition-colors" title="PayPal"></i>
            <i className="fab fa-cc-apple-pay hover:text-white transition-colors" title="Apple Pay"></i>
            <i className="fas fa-credit-card hover:text-white transition-colors" title="Credit Card"></i>
          </div>
        </div>

      </div>
    </footer>
  );
};