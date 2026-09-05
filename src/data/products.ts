import { GenderType, ProductItem, SubCategoryHeadline } from '../types';

export interface CategoryData {
  subCategories: string[];
  subCategoryLabels: Record<string, string>;
  defaultSubCategory: string;
  headlines: Record<string, SubCategoryHeadline>;
  sizes: Record<string, string[]>;
  basePrices: Record<string, { price: number; original: number }>;
  products: Record<string, {
    name: string;
    image: string;
    colorName: string;
    bgColor: string;
    textColor: string;
  }[]>;
}

// Parehong pagkasunod ng kulay sa mobile at desktop.
// Uunahin ang White (kung mayroon), sundan ng natural order ng data.
export function withWhiteFirst<T extends { colorName: string }>(arr: T[]): T[] {
  const whiteIdx = arr.findIndex((p) => p.colorName.toLowerCase() === 'white');
  if (whiteIdx <= 0) return arr;
  const w = arr[whiteIdx];
  return [w, ...arr.slice(0, whiteIdx), ...arr.slice(whiteIdx + 1)];
}

// Complete Product Registry matching the original C-HUB HTML & JS files
export const PRODUCTS_CONFIG: Record<string, Record<GenderType, CategoryData>> = {
  clothes: {
    men: {
      subCategories: ['tshirt', 'hoodie', 'sweatshirt'],
      subCategoryLabels: { tshirt: 'T-Shirt', hoodie: 'Hoodie', sweatshirt: 'Sweatshirts' },
      defaultSubCategory: 'tshirt',
      headlines: {
        tshirt: {
          main: 'Wear Confidence',
          sub: 'Define Your Style.',
          desc: 'Discover premium T-shirts designed for comfort, quality, and everyday expression.',
          price: 1999,
          original: 2999
        },
        hoodie: {
          main: 'Stay Cozy',
          sub: 'Stay Stylish.',
          desc: 'Our hoodies are crafted with a soft cotton-blend fabric for warmth and comfort, perfect for any season.',
          price: 2499,
          original: 3499
        },
        sweatshirt: {
          main: 'Comfort Layers',
          sub: 'Make a Statement.',
          desc: 'Comfortable layers that combine classic style with modern comfort for everyday wear.',
          price: 2199,
          original: 3199
        }
      },
      sizes: {
        tshirt: ['S', 'M', 'L', 'XL'],
        hoodie: ['S', 'M', 'L', 'XL'],
        sweatshirt: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        tshirt: { price: 1999, original: 2999 },
        hoodie: { price: 2499, original: 3499 },
        sweatshirt: { price: 2199, original: 3199 }
      },
      products: {
        tshirt: [
          { name: 'Premium T-Shirt - White', image: '/images/clothes/men/t-shirts/white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Black', image: '/images/clothes/men/t-shirts/black.png', colorName: 'Black', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Blue', image: '/images/clothes/men/t-shirts/blue.png', colorName: 'Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Yellow', image: '/images/clothes/men/t-shirts/yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Red', image: '/images/clothes/men/t-shirts/red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Green', image: '/images/clothes/men/t-shirts/green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        hoodie: [
          { name: 'Cozy Hoodie - Beige', image: '/images/clothes/men/hoodie/beige.png', colorName: 'Beige', bgColor: '#CEB699', textColor: '#FFFFFF' },
          { name: 'Cozy Hoodie - Mauve', image: '/images/clothes/men/hoodie/mauve.png', colorName: 'Mauve', bgColor: '#806875', textColor: '#FFFFFF' },
          { name: 'Cozy Hoodie - Pink', image: '/images/clothes/men/hoodie/pink.png', colorName: 'Pink', bgColor: '#E7A8CA', textColor: '#1d1a18' },
          { name: 'Cozy Hoodie - Sage', image: '/images/clothes/men/hoodie/sage.png', colorName: 'Sage', bgColor: '#648C7A', textColor: '#FFFFFF' },
          { name: 'Cozy Hoodie - Burgundy', image: '/images/clothes/men/hoodie/burgundy.png', colorName: 'Burgundy', bgColor: '#572A34', textColor: '#FFFFFF' },
          { name: 'Cozy Hoodie - Brown', image: '/images/clothes/men/hoodie/brown.png', colorName: 'Brown', bgColor: '#433630', textColor: '#FFFFFF' }
        ],
        sweatshirt: [
          { name: 'Classic Sweatshirt - White', image: '/images/clothes/men/sweatshirts/white1.png', colorName: 'White', bgColor: '#F5F4EF', textColor: '#1d1a18' },
          { name: 'Classic Sweatshirt - Gray', image: '/images/clothes/men/sweatshirts/gray1.png', colorName: 'Gray', bgColor: '#E6E5E1', textColor: '#1d1a18' },
          { name: 'Classic Sweatshirt - Blue', image: '/images/clothes/men/sweatshirts/blue1.png', colorName: 'Blue', bgColor: '#28479D', textColor: '#FFFFFF' },
          { name: 'Classic Sweatshirt - Brown', image: '/images/clothes/men/sweatshirts/brown2.png', colorName: 'Brown', bgColor: '#6B432E', textColor: '#FFFFFF' },
          { name: 'Classic Sweatshirt - Pink', image: '/images/clothes/men/sweatshirts/pink1.png', colorName: 'Pink', bgColor: '#B7857A', textColor: '#FFFFFF' },
          { name: 'Classic Sweatshirt - Beige', image: '/images/clothes/men/sweatshirts/beige1.png', colorName: 'Beige', bgColor: '#CDA677', textColor: '#FFFFFF' }
        ]
      }
    },
    women: {
      subCategories: ['top', 'dress', 'tshirt'],
      subCategoryLabels: { top: 'Top', dress: 'Dress', tshirt: 'T-Shirt' },
      defaultSubCategory: 'top',
      headlines: {
        top: {
          main: 'Top Style',
          sub: 'Define Your Look.',
          desc: 'Discover premium tops designed for comfort, quality, and everyday style.',
          price: 1799,
          original: 2799
        },
        dress: {
          main: 'Dress Up',
          sub: 'Effortless Elegance.',
          desc: 'Stylish dresses designed for any occasion. Comfortable, flattering, and perfect for everyday wear.',
          price: 2999,
          original: 3999
        },
        tshirt: {
          main: 'T-Shirt Style',
          sub: 'Define Your Look.',
          desc: 'Classic T-shirts designed for comfort, quality, and everyday style.',
          price: 1599,
          original: 2599
        }
      },
      sizes: {
        top: ['S', 'M', 'L', 'XL'],
        dress: ['S', 'M', 'L', 'XL'],
        tshirt: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        top: { price: 1799, original: 2799 },
        dress: { price: 2999, original: 3999 },
        tshirt: { price: 1599, original: 2599 }
      },
      products: {
        top: [
          { name: 'Peplum Top - Cream', image: '/images/clothes/women/top/top1.png', colorName: 'Cream', bgColor: '#F3F0EA', textColor: '#1d1a18' },
          { name: 'Peplum Top - White', image: '/images/clothes/women/top/top2.png', colorName: 'White', bgColor: '#F1F1EE', textColor: '#1d1a18' },
          { name: 'Peplum Top - Sky Blue Gingham', image: '/images/clothes/women/top/top3.png', colorName: 'Sky Blue Gingham', bgColor: '#C8D8F2', textColor: '#1d1a18' },
          { name: 'Peplum Top - Sage Green', image: '/images/clothes/women/top/top4.png', colorName: 'Sage Green', bgColor: '#C8D0B4', textColor: '#1d1a18' },
          { name: 'Peplum Top - Mocha Brown', image: '/images/clothes/women/top/top5.png', colorName: 'Mocha Brown', bgColor: '#8B654E', textColor: '#FFFFFF' },
          { name: 'Peplum Top - Obsidian Black', image: '/images/clothes/women/top/top6.png', colorName: 'Obsidian Black', bgColor: '#3A3A3A', textColor: '#FFFFFF' }
        ],
        dress: [
          { name: 'Summer Halter Dress - Polka White', image: '/images/clothes/women/dress/dress1.png', colorName: 'Polka White', bgColor: '#F4F2EE', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Sky Stripe', image: '/images/clothes/women/dress/dress2.png', colorName: 'Sky Stripe', bgColor: '#DDEAF5', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Buttercup Gingham', image: '/images/clothes/women/dress/dress3.png', colorName: 'Buttercup Gingham', bgColor: '#F2E29A', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Rose Gingham', image: '/images/clothes/women/dress/dress4.png', colorName: 'Rose Gingham', bgColor: '#E9BDD1', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Ocean Gingham', image: '/images/clothes/women/dress/dress5.png', colorName: 'Ocean Gingham', bgColor: '#AFC7E8', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Midnight Polka', image: '/images/clothes/women/dress/dress6.png', colorName: 'Midnight Polka', bgColor: '#36395F', textColor: '#FFFFFF' }
        ],
        tshirt: [
          { name: 'Premium T-Shirt - White', image: '/images/clothes/men/t-shirts/white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Black', image: '/images/clothes/men/t-shirts/black.png', colorName: 'Black', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Blue', image: '/images/clothes/men/t-shirts/blue.png', colorName: 'Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Yellow', image: '/images/clothes/men/t-shirts/yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Red', image: '/images/clothes/men/t-shirts/red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Green', image: '/images/clothes/men/t-shirts/green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    boys: {
      subCategories: ['polo', 'poloshirt', 'tshirt'],
      subCategoryLabels: { polo: 'Polo', poloshirt: 'Polo-Shirt', tshirt: 'T-Shirt' },
      defaultSubCategory: 'polo',
      headlines: {
        polo: {
          main: 'Polo Style',
          sub: 'Classic & Cool.',
          desc: 'Classic polo shirts designed for comfort and style. Perfect for school, play, or any occasion.',
          price: 1299,
          original: 1999
        },
        poloshirt: {
          main: 'Polo Shirt',
          sub: 'Casual Comfort.',
          desc: 'Comfortable polo shirts designed for everyday wear. Made with soft, breathable fabrics.',
          price: 1499,
          original: 2299
        },
        tshirt: {
          main: 'T-Shirt Style',
          sub: 'Everyday Comfort.',
          desc: 'Classic T-shirts designed for comfort and style. Perfect for school, play, or any occasion.',
          price: 999,
          original: 1599
        }
      },
      sizes: {
        polo: ['S', 'M', 'L', 'XL'],
        poloshirt: ['S', 'M', 'L', 'XL'],
        tshirt: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        polo: { price: 1299, original: 1999 },
        poloshirt: { price: 1499, original: 2299 },
        tshirt: { price: 999, original: 1599 }
      },
      products: {
        polo: [
          { name: 'Boys Polo - Crisp White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Polo - Ocean Blue', image: 'blue.png', colorName: 'Blue', bgColor: '#2A5A8A', textColor: '#FFFFFF' },
          { name: 'Boys Polo - Ruby Red', image: 'red.png', colorName: 'Red', bgColor: '#C44A4A', textColor: '#FFFFFF' },
          { name: 'Boys Polo - Forest Green', image: 'green.png', colorName: 'Green', bgColor: '#3A7A4A', textColor: '#FFFFFF' },
          { name: 'Boys Polo - Sunshine Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#F5D84A', textColor: '#1d1a18' },
          { name: 'Boys Polo - Sunset Orange', image: 'brown2.png', colorName: 'Orange', bgColor: '#E88A3A', textColor: '#FFFFFF' }
        ],
        poloshirt: [
          { name: 'Boys Polo Shirt - White', image: '/images/clothes/boys/poloshirt/bpoloshirt1.png', colorName: 'White', bgColor: '#F0F0F0', textColor: '#1d1a18' },
          { name: 'Boys Polo Shirt - Slate Blue', image: '/images/clothes/boys/poloshirt/bpoloshirt2.png', colorName: 'Slate Blue', bgColor: '#3A5A8A', textColor: '#FFFFFF' },
          { name: 'Boys Polo Shirt - Crimson', image: '/images/clothes/boys/poloshirt/bpoloshirt3.png', colorName: 'Crimson', bgColor: '#B44A4A', textColor: '#FFFFFF' },
          { name: 'Boys Polo Shirt - Pine Green', image: 'sage.png', colorName: 'Pine Green', bgColor: '#4A7A5A', textColor: '#FFFFFF' },
          { name: 'Boys Polo Shirt - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3A5A', textColor: '#FFFFFF' },
          { name: 'Boys Polo Shirt - Gray', image: 'gray1.png', colorName: 'Gray', bgColor: '#8A8A8A', textColor: '#FFFFFF' }
        ],
        tshirt: [
          { name: 'Premium T-Shirt - White', image: '/images/clothes/men/t-shirts/white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Black', image: '/images/clothes/men/t-shirts/black.png', colorName: 'Black', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Blue', image: '/images/clothes/men/t-shirts/blue.png', colorName: 'Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Yellow', image: '/images/clothes/men/t-shirts/yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Red', image: '/images/clothes/men/t-shirts/red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Green', image: '/images/clothes/men/t-shirts/green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    girls: {
      subCategories: ['top', 'dress', 'tshirt'],
      subCategoryLabels: { top: 'Top', dress: 'Dress', tshirt: 'T-Shirt' },
      defaultSubCategory: 'top',
      headlines: {
        top: {
          main: 'Top Style',
          sub: 'Define Your Look.',
          desc: 'Discover premium tops designed for comfort, quality, and everyday style.',
          price: 1699,
          original: 2699
        },
        dress: {
          main: 'Dress Up',
          sub: 'Effortless Elegance.',
          desc: 'Stylish dresses designed for any occasion. Comfortable, flattering, and perfect for everyday wear.',
          price: 2899,
          original: 3899
        },
        tshirt: {
          main: 'T-Shirt Style',
          sub: 'Define Your Look.',
          desc: 'Classic T-shirts designed for comfort, quality, and everyday style.',
          price: 1499,
          original: 2499
        }
      },
      sizes: {
        top: ['S', 'M', 'L', 'XL'],
        dress: ['S', 'M', 'L', 'XL'],
        tshirt: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        top: { price: 1699, original: 2699 },
        dress: { price: 2899, original: 3899 },
        tshirt: { price: 1499, original: 2499 }
      },
      products: {
        top: [
          { name: 'Peplum Top - Cream', image: '/images/clothes/women/top/top1.png', colorName: 'Cream', bgColor: '#F3F0EA', textColor: '#1d1a18' },
          { name: 'Peplum Top - White', image: '/images/clothes/women/top/top2.png', colorName: 'White', bgColor: '#F1F1EE', textColor: '#1d1a18' },
          { name: 'Peplum Top - Sky Blue Gingham', image: '/images/clothes/women/top/top3.png', colorName: 'Sky Blue Gingham', bgColor: '#C8D8F2', textColor: '#1d1a18' },
          { name: 'Peplum Top - Sage Green', image: '/images/clothes/women/top/top4.png', colorName: 'Sage Green', bgColor: '#C8D0B4', textColor: '#1d1a18' },
          { name: 'Peplum Top - Mocha Brown', image: '/images/clothes/women/top/top5.png', colorName: 'Mocha Brown', bgColor: '#8B654E', textColor: '#FFFFFF' },
          { name: 'Peplum Top - Obsidian Black', image: '/images/clothes/women/top/top6.png', colorName: 'Obsidian Black', bgColor: '#3A3A3A', textColor: '#FFFFFF' }
        ],
        dress: [
          { name: 'Summer Halter Dress - Polka White', image: '/images/clothes/girls/dress/gdress1.png', colorName: 'Polka White', bgColor: '#F4F2EE', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Sky Stripe', image: '/images/clothes/girls/dress/gdress2.png', colorName: 'Sky Stripe', bgColor: '#DDEAF5', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Buttercup Gingham', image: '/images/clothes/girls/dress/gdress3.png', colorName: 'Buttercup Gingham', bgColor: '#F2E29A', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Rose Gingham', image: '/images/clothes/women/dress/dress4.png', colorName: 'Rose Gingham', bgColor: '#E9BDD1', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Ocean Gingham', image: '/images/clothes/women/dress/dress5.png', colorName: 'Ocean Gingham', bgColor: '#AFC7E8', textColor: '#1d1a18' },
          { name: 'Summer Halter Dress - Midnight Polka', image: '/images/clothes/women/dress/dress6.png', colorName: 'Midnight Polka', bgColor: '#36395F', textColor: '#FFFFFF' }
        ],
        tshirt: [
          { name: 'Premium T-Shirt - White', image: '/images/clothes/men/t-shirts/white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Black', image: '/images/clothes/men/t-shirts/black.png', colorName: 'Black', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Blue', image: '/images/clothes/men/t-shirts/blue.png', colorName: 'Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Yellow', image: '/images/clothes/men/t-shirts/yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Premium T-Shirt - Red', image: '/images/clothes/men/t-shirts/red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Premium T-Shirt - Green', image: '/images/clothes/men/t-shirts/green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    }
  },
  shoes: {
    men: {
      subCategories: ['sneakers', 'boots', 'sandals'],
      subCategoryLabels: { sneakers: 'Sneakers', boots: 'Boots', sandals: 'Sandals' },
      defaultSubCategory: 'sneakers',
      headlines: {
        sneakers: {
          main: 'Step in Style',
          sub: 'Walk with Confidence.',
          desc: 'Discover premium sneakers designed for comfort, durability, and everyday style.',
          price: 2499,
          original: 3499
        },
        boots: {
          main: 'Built to Last',
          sub: 'Rugged & Refined.',
          desc: 'Durable, stylish boots built to last. Perfect for work or outdoor adventures.',
          price: 2999,
          original: 3999
        },
        sandals: {
          main: 'Breathe Easy',
          sub: 'Summer Ready.',
          desc: 'Comfortable and breathable sandals designed for warm weather. Stay cool all day.',
          price: 1599,
          original: 2299
        }
      },
      sizes: {
        sneakers: ['7', '8', '9', '10', '11'],
        boots: ['7', '8', '9', '10', '11'],
        sandals: ['7', '8', '9', '10', '11']
      },
      basePrices: {
        sneakers: { price: 2499, original: 3499 },
        boots: { price: 2999, original: 3999 },
        sandals: { price: 1599, original: 2299 }
      },
      products: {
        sneakers: [
          { name: 'Urban Sneakers - Chalk White', image: 'shoes1.png', colorName: 'Chalk White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Urban Sneakers - Stealth Charcoal', image: 'shoes2.png', colorName: 'Stealth Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Urban Sneakers - Deep Navy', image: 'shoes3.png', colorName: 'Deep Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Urban Sneakers - Solar Yellow', image: 'shoes4.png', colorName: 'Solar Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Urban Sneakers - Crimson Red', image: 'shoes5.png', colorName: 'Crimson Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Urban Sneakers - Emerald Green', image: 'shoes6.png', colorName: 'Emerald Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        boots: [
          { name: 'Leather Boots - Desert Tan', image: 'shoes1.png', colorName: 'Desert Tan', bgColor: '#CEB699', textColor: '#FFFFFF' },
          { name: 'Leather Boots - Vintage Plum', image: 'shoes2.png', colorName: 'Vintage Plum', bgColor: '#806875', textColor: '#FFFFFF' },
          { name: 'Leather Boots - Rosewood', image: 'shoes3.png', colorName: 'Rosewood', bgColor: '#E7A8CA', textColor: '#1d1a18' },
          { name: 'Leather Boots - Highland Green', image: 'shoes4.png', colorName: 'Highland Green', bgColor: '#648C7A', textColor: '#FFFFFF' },
          { name: 'Leather Boots - Port Burgundy', image: 'shoes5.png', colorName: 'Port Burgundy', bgColor: '#572A34', textColor: '#FFFFFF' },
          { name: 'Leather Boots - Dark Espresso', image: 'shoes6.png', colorName: 'Dark Espresso', bgColor: '#433630', textColor: '#FFFFFF' }
        ],
        sandals: [
          { name: 'Slide Sandals - Sandstone', image: 'shoes1.png', colorName: 'Sandstone', bgColor: '#F5F4EF', textColor: '#1d1a18' },
          { name: 'Slide Sandals - Slate Mist', image: 'shoes2.png', colorName: 'Slate Mist', bgColor: '#E6E5E1', textColor: '#1d1a18' },
          { name: 'Slide Sandals - Royal Blue', image: 'shoes3.png', colorName: 'Royal Blue', bgColor: '#28479D', textColor: '#FFFFFF' },
          { name: 'Slide Sandals - Rustic Clay', image: 'shoes4.png', colorName: 'Rustic Clay', bgColor: '#6B432E', textColor: '#FFFFFF' },
          { name: 'Slide Sandals - Terra Cotta', image: 'shoes5.png', colorName: 'Terra Cotta', bgColor: '#B7857A', textColor: '#1d1a18' },
          { name: 'Slide Sandals - Warm Camel', image: 'shoes6.png', colorName: 'Warm Camel', bgColor: '#CDA677', textColor: '#1d1a18' }
        ]
      }
    },
    women: {
      subCategories: ['sneakers', 'heels', 'sandals'],
      subCategoryLabels: { sneakers: 'Sneakers', heels: 'Heels', sandals: 'Sandals' },
      defaultSubCategory: 'sneakers',
      headlines: {
        sneakers: {
          main: 'Step in Style',
          sub: 'Walk with Confidence.',
          desc: 'Discover premium sneakers designed for comfort, durability, and everyday style.',
          price: 2499,
          original: 3499
        },
        heels: {
          main: 'Elevate Your Style',
          sub: 'Step Up.',
          desc: 'Stylish heels designed for any occasion. Comfortable, elegant, and perfect for everyday wear.',
          price: 3499,
          original: 4499
        },
        sandals: {
          main: 'Breathe Easy',
          sub: 'Summer Ready.',
          desc: 'Comfortable and breathable sandals designed for warm weather. Stay cool all day.',
          price: 1599,
          original: 2299
        }
      },
      sizes: {
        sneakers: ['6', '7', '8', '9', '10'],
        heels: ['6', '7', '8', '9', '10'],
        sandals: ['6', '7', '8', '9', '10']
      },
      basePrices: {
        sneakers: { price: 2499, original: 3499 },
        heels: { price: 3499, original: 4499 },
        sandals: { price: 1599, original: 2299 }
      },
      products: {
        sneakers: [
          { name: 'Women Runner - Pure White', image: 'shoes1.png', colorName: 'Pure White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Runner - Carbon', image: 'shoes2.png', colorName: 'Carbon', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Runner - Nightfall', image: 'shoes3.png', colorName: 'Nightfall', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Runner - Buttercup', image: 'shoes4.png', colorName: 'Buttercup', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Runner - Scarlet', image: 'shoes5.png', colorName: 'Scarlet', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Runner - Jade', image: 'shoes6.png', colorName: 'Jade', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        heels: [
          { name: 'Chic Stiletto - Ivory Pearl', image: 'shoes1.png', colorName: 'Ivory Pearl', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Chic Stiletto - Noir Matte', image: 'shoes2.png', colorName: 'Noir Matte', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Chic Stiletto - Sapphire Blue', image: 'shoes3.png', colorName: 'Sapphire Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Chic Stiletto - Canary Gold', image: 'shoes4.png', colorName: 'Canary Gold', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Chic Stiletto - Ruby Glaze', image: 'shoes5.png', colorName: 'Ruby Glaze', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Chic Stiletto - Pine Glaze', image: 'shoes6.png', colorName: 'Pine Glaze', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        sandals: [
          { name: 'Platform Strap Sandal - Bone', image: 'shoes1.png', colorName: 'Bone', bgColor: '#F5F4EF', textColor: '#1d1a18' },
          { name: 'Platform Strap Sandal - Silver Cloud', image: 'shoes2.png', colorName: 'Silver Cloud', bgColor: '#E6E5E1', textColor: '#1d1a18' },
          { name: 'Platform Strap Sandal - Deep Indigo', image: 'shoes3.png', colorName: 'Deep Indigo', bgColor: '#28479D', textColor: '#FFFFFF' },
          { name: 'Platform Strap Sandal - Espresso', image: 'shoes4.png', colorName: 'Espresso', bgColor: '#6B432E', textColor: '#FFFFFF' },
          { name: 'Platform Strap Sandal - Blush Coral', image: 'shoes5.png', colorName: 'Blush Coral', bgColor: '#B7857A', textColor: '#1d1a18' },
          { name: 'Platform Strap Sandal - Pecan', image: 'shoes6.png', colorName: 'Pecan', bgColor: '#CDA677', textColor: '#1d1a18' }
        ]
      }
    },
    boys: {
      subCategories: ['sneakers', 'sandals', 'boots'],
      subCategoryLabels: { sneakers: 'Sneakers', sandals: 'Sandals', boots: 'Boots' },
      defaultSubCategory: 'sneakers',
      headlines: {
        sneakers: { main: 'Sneakers', sub: 'Style & Comfort.', desc: 'Premium sneakers designed for comfort and style. Perfect for school, play, or any occasion.', price: 1999, original: 2999 },
        sandals: { main: 'Breathe Easy', sub: 'Summer Ready.', desc: 'Comfortable and breathable sandals designed for warm weather. Stay cool all day.', price: 1299, original: 1899 },
        boots: { main: 'Built to Last', sub: 'Rugged & Refined.', desc: 'Durable, stylish boots built to last. Perfect for outdoor adventures.', price: 2499, original: 3499 }
      },
      sizes: {
        sneakers: ['3', '4', '5', '6', '7'],
        sandals: ['3', '4', '5', '6', '7'],
        boots: ['3', '4', '5', '6', '7']
      },
      basePrices: {
        sneakers: { price: 1999, original: 2999 },
        sandals: { price: 1299, original: 1899 },
        boots: { price: 2499, original: 3499 }
      },
      products: {
        sneakers: [
          { name: 'Boys Kick - White', image: 'shoes1.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Kick - Charcoal', image: 'shoes2.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Kick - Navy', image: 'shoes3.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Kick - Yellow', image: 'shoes4.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Kick - Red', image: 'shoes5.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Kick - Green', image: 'shoes6.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        sandals: [
          { name: 'Boys Trail Sandal - Off White', image: 'shoes1.png', colorName: 'Off White', bgColor: '#F5F4EF', textColor: '#1d1a18' },
          { name: 'Boys Trail Sandal - Stone', image: 'shoes2.png', colorName: 'Stone', bgColor: '#E6E5E1', textColor: '#1d1a18' },
          { name: 'Boys Trail Sandal - Cadet Blue', image: 'shoes3.png', colorName: 'Cadet Blue', bgColor: '#28479D', textColor: '#FFFFFF' },
          { name: 'Boys Trail Sandal - Oak', image: 'shoes4.png', colorName: 'Oak', bgColor: '#6B432E', textColor: '#FFFFFF' },
          { name: 'Boys Trail Sandal - Terra', image: 'shoes5.png', colorName: 'Terra', bgColor: '#B7857A', textColor: '#1d1a18' },
          { name: 'Boys Trail Sandal - Honey', image: 'shoes6.png', colorName: 'Honey', bgColor: '#CDA677', textColor: '#1d1a18' }
        ],
        boots: [
          { name: 'Boys Trek Boot - Khaki', image: 'shoes1.png', colorName: 'Khaki', bgColor: '#CEB699', textColor: '#FFFFFF' },
          { name: 'Boys Trek Boot - Granite', image: 'shoes2.png', colorName: 'Granite', bgColor: '#806875', textColor: '#FFFFFF' },
          { name: 'Boys Trek Boot - Rose Quartz', image: 'shoes3.png', colorName: 'Rose Quartz', bgColor: '#E7A8CA', textColor: '#1d1a18' },
          { name: 'Boys Trek Boot - Forest', image: 'shoes4.png', colorName: 'Forest', bgColor: '#648C7A', textColor: '#FFFFFF' },
          { name: 'Boys Trek Boot - Maroon', image: 'shoes5.png', colorName: 'Maroon', bgColor: '#572A34', textColor: '#FFFFFF' },
          { name: 'Boys Trek Boot - Chestnut', image: 'shoes6.png', colorName: 'Chestnut', bgColor: '#433630', textColor: '#FFFFFF' }
        ]
      }
    },
    girls: {
      subCategories: ['sneakers', 'sandals', 'boots'],
      subCategoryLabels: { sneakers: 'Sneakers', sandals: 'Sandals', boots: 'Boots' },
      defaultSubCategory: 'sneakers',
      headlines: {
        sneakers: { main: 'Sneakers', sub: 'Style & Comfort.', desc: 'Premium sneakers designed for comfort and style. Perfect for school, play, or any occasion.', price: 1999, original: 2999 },
        sandals: { main: 'Breathe Easy', sub: 'Summer Ready.', desc: 'Comfortable and breathable sandals designed for warm weather. Stay cool all day.', price: 1299, original: 1899 },
        boots: { main: 'Built to Last', sub: 'Rugged & Refined.', desc: 'Durable, stylish boots built to last. Perfect for outdoor adventures.', price: 2499, original: 3499 }
      },
      sizes: {
        sneakers: ['3', '4', '5', '6', '7'],
        sandals: ['3', '4', '5', '6', '7'],
        boots: ['3', '4', '5', '6', '7']
      },
      basePrices: {
        sneakers: { price: 1999, original: 2999 },
        sandals: { price: 1299, original: 1899 },
        boots: { price: 2499, original: 3499 }
      },
      products: {
        sneakers: [
          { name: 'Girls Spark Sneaker - Cloud White', image: 'shoes1.png', colorName: 'Cloud White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Spark Sneaker - Heather', image: 'shoes2.png', colorName: 'Heather', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Spark Sneaker - Twilight Blue', image: 'shoes3.png', colorName: 'Twilight Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Spark Sneaker - Sunray', image: 'shoes4.png', colorName: 'Sunray', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Spark Sneaker - Poppy Red', image: 'shoes5.png', colorName: 'Poppy Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Spark Sneaker - Mint Clover', image: 'shoes6.png', colorName: 'Mint Clover', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        sandals: [
          { name: 'Girls Summer Strap - Vanilla', image: 'shoes1.png', colorName: 'Vanilla', bgColor: '#F5F4EF', textColor: '#1d1a18' },
          { name: 'Girls Summer Strap - Silver Light', image: 'shoes2.png', colorName: 'Silver Light', bgColor: '#E6E5E1', textColor: '#1d1a18' },
          { name: 'Girls Summer Strap - Blue Ocean', image: 'shoes3.png', colorName: 'Blue Ocean', bgColor: '#28479D', textColor: '#FFFFFF' },
          { name: 'Girls Summer Strap - Cocoa', image: 'shoes4.png', colorName: 'Cocoa', bgColor: '#6B432E', textColor: '#FFFFFF' },
          { name: 'Girls Summer Strap - Coral Pink', image: 'shoes5.png', colorName: 'Coral Pink', bgColor: '#B7857A', textColor: '#1d1a18' },
          { name: 'Girls Summer Strap - Biscuit', image: 'shoes6.png', colorName: 'Biscuit', bgColor: '#CDA677', textColor: '#1d1a18' }
        ],
        boots: [
          { name: 'Girls Blossom Boot - Almond', image: 'shoes1.png', colorName: 'Almond', bgColor: '#CEB699', textColor: '#FFFFFF' },
          { name: 'Girls Blossom Boot - Violet Dusk', image: 'shoes2.png', colorName: 'Violet Dusk', bgColor: '#806875', textColor: '#FFFFFF' },
          { name: 'Girls Blossom Boot - Pastel Pink', image: 'shoes3.png', colorName: 'Pastel Pink', bgColor: '#E7A8CA', textColor: '#1d1a18' },
          { name: 'Girls Blossom Boot - Sage Laurel', image: 'shoes4.png', colorName: 'Sage Laurel', bgColor: '#648C7A', textColor: '#FFFFFF' },
          { name: 'Girls Blossom Boot - Wine Berry', image: 'shoes5.png', colorName: 'Wine Berry', bgColor: '#572A34', textColor: '#FFFFFF' },
          { name: 'Girls Blossom Boot - Cocoa Brown', image: 'shoes6.png', colorName: 'Cocoa Brown', bgColor: '#433630', textColor: '#FFFFFF' }
        ]
      }
    }
  },
  pants: {
    men: {
      subCategories: ['jeans', 'shorts', 'joggers'],
      subCategoryLabels: { jeans: 'Jeans', shorts: 'Shorts', joggers: 'Joggers' },
      defaultSubCategory: 'jeans',
      headlines: {
        jeans: {
          main: 'Classic Denim',
          sub: 'Timeless Style.',
          desc: 'Premium jeans crafted for everyday comfort and durability. Made with high-quality denim that fits perfectly.',
          price: 1799,
          original: 2499
        },
        shorts: {
          main: 'Stay Cool',
          sub: 'Summer Ready.',
          desc: 'Lightweight and breathable shorts designed for warm weather. Perfect for casual outings and everyday wear.',
          price: 1299,
          original: 1899
        },
        joggers: {
          main: 'Ultimate Comfort',
          sub: 'Effortless Style.',
          desc: 'Soft and cozy joggers perfect for lounging, workouts, or running errands. Comfort meets style.',
          price: 1499,
          original: 2199
        }
      },
      sizes: {
        jeans: ['28', '30', '32', '34', '36'],
        shorts: ['28', '30', '32', '34', '36'],
        joggers: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        jeans: { price: 1799, original: 2499 },
        shorts: { price: 1299, original: 1899 },
        joggers: { price: 1499, original: 2199 }
      },
      products: {
        jeans: [
          { name: 'Classic Denim Jeans - Light Stone', image: '/images/pants/men/pants/pants1.png', colorName: 'Light Stone', bgColor: '#D9D9D9', textColor: '#1E1E1E' },
          { name: 'Classic Denim Jeans - Mid Gray', image: '/images/pants/men/pants/pants2.png', colorName: 'Mid Gray', bgColor: '#D6D6D6', textColor: '#1E1E1E' },
          { name: 'Classic Denim Jeans - Off White', image: '/images/pants/men/pants/pants3.png', colorName: 'Off White', bgColor: '#F3EFE6', textColor: '#1E1E1E' },
          { name: 'Classic Denim Jeans - Silver Sand', image: '/images/pants/men/pants/pants4.png', colorName: 'Silver Sand', bgColor: '#D8D8D8', textColor: '#1E1E1E' },
          { name: 'Classic Denim Jeans - Deep Indigo Navy', image: '/images/pants/men/pants/pants5.png', colorName: 'Deep Indigo Navy', bgColor: '#223A67', textColor: '#FFFFFF' },
          { name: 'Classic Denim Jeans - Rustic Brown', image: '/images/pants/men/pants/pants6.png', colorName: 'Rustic Brown', bgColor: '#4A3328', textColor: '#FFFFFF' }
        ],
        shorts: [
          { name: 'Everyday Shorts - White', image: 'pants1.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Everyday Shorts - Charcoal', image: 'pants2.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Everyday Shorts - Navy', image: 'pants3.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Everyday Shorts - Yellow', image: 'pants4.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Everyday Shorts - Red', image: 'pants5.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Everyday Shorts - Green', image: 'pants6.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        joggers: [
          { name: 'Fleece Joggers - Ash', image: 'pants1.png', colorName: 'Ash', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Fleece Joggers - Graphite', image: 'pants2.png', colorName: 'Graphite', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Fleece Joggers - Midnight', image: 'pants3.png', colorName: 'Midnight', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Fleece Joggers - Ochre', image: 'pants4.png', colorName: 'Ochre', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Fleece Joggers - Crimson', image: 'pants5.png', colorName: 'Crimson', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Fleece Joggers - Forest', image: 'pants6.png', colorName: 'Forest', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    women: {
      subCategories: ['jeans', 'shorts', 'joggers'],
      subCategoryLabels: { jeans: 'Jeans', shorts: 'Shorts', joggers: 'Joggers' },
      defaultSubCategory: 'jeans',
      headlines: {
        jeans: { main: 'High Rise Denim', sub: 'Flattering & Clean.', desc: 'Tailored fit high-rise jeans crafted with stretch denim for all-day elegance.', price: 1799, original: 2499 },
        shorts: { main: 'Breezy Cutoffs', sub: 'Effortless Summer.', desc: 'High-waisted lightweight cotton shorts built for warm-weather adventures.', price: 1299, original: 1899 },
        joggers: { main: 'Lounge Sweatpants', sub: 'Supreme Softness.', desc: 'Plush cloud-soft joggers with tapered ribbed cuffs and drawstring waist.', price: 1499, original: 2199 }
      },
      sizes: {
        jeans: ['24', '26', '28', '30', '32'],
        shorts: ['24', '26', '28', '30', '32'],
        joggers: ['XS', 'S', 'M', 'L', 'XL']
      },
      basePrices: {
        jeans: { price: 1799, original: 2499 },
        shorts: { price: 1299, original: 1899 },
        joggers: { price: 1499, original: 2199 }
      },
      products: {
        jeans: [
          { name: 'Women Denim - Light Stone', image: 'pants1.png', colorName: 'Light Stone', bgColor: '#D9D9D9', textColor: '#1E1E1E' },
          { name: 'Women Denim - Mid Gray', image: 'pants2.png', colorName: 'Mid Gray', bgColor: '#D6D6D6', textColor: '#1E1E1E' },
          { name: 'Women Denim - Cream', image: 'pants3.png', colorName: 'Cream', bgColor: '#F3EFE6', textColor: '#1E1E1E' },
          { name: 'Women Denim - Bleach Wash', image: 'pants4.png', colorName: 'Bleach Wash', bgColor: '#D8D8D8', textColor: '#1E1E1E' },
          { name: 'Women Denim - Dark Navy', image: 'pants5.png', colorName: 'Dark Navy', bgColor: '#223A67', textColor: '#FFFFFF' },
          { name: 'Women Denim - Warm Rust', image: 'pants6.png', colorName: 'Warm Rust', bgColor: '#4A3328', textColor: '#FFFFFF' }
        ],
        shorts: [
          { name: 'Women Cutoff - White', image: 'pants1.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Cutoff - Charcoal', image: 'pants2.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Cutoff - Blue', image: 'pants3.png', colorName: 'Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Cutoff - Lemon', image: 'pants4.png', colorName: 'Lemon', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Cutoff - Coral', image: 'pants5.png', colorName: 'Coral', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Cutoff - Sage', image: 'pants6.png', colorName: 'Sage', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        joggers: [
          { name: 'Women Cloud Jogger - Off White', image: 'pants1.png', colorName: 'Off White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Cloud Jogger - Charcoal', image: 'pants2.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Cloud Jogger - Navy', image: 'pants3.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Cloud Jogger - Pastel Yellow', image: 'pants4.png', colorName: 'Pastel Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Cloud Jogger - Cherry', image: 'pants5.png', colorName: 'Cherry', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Cloud Jogger - Moss', image: 'pants6.png', colorName: 'Moss', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    boys: {
      subCategories: ['jeans', 'shorts', 'joggers'],
      subCategoryLabels: { jeans: 'Jeans', shorts: 'Shorts', joggers: 'Joggers' },
      defaultSubCategory: 'jeans',
      headlines: {
        jeans: { main: 'Boys Denim', sub: 'Sturdy & Cool.', desc: 'Durable stretch denim pants engineered to keep up with daily playtime and style.', price: 1499, original: 2099 },
        shorts: { main: 'Active Shorts', sub: 'Ready for Adventure.', desc: 'Flexible, breathable cotton twill shorts made for high-energy play.', price: 999, original: 1499 },
        joggers: { main: 'Boys Track Joggers', sub: 'Pure Ease.', desc: 'Cozy brushed fleece joggers with reinforced knees and secure pockets.', price: 1199, original: 1699 }
      },
      sizes: {
        jeans: ['6', '8', '10', '12', '14'],
        shorts: ['6', '8', '10', '12', '14'],
        joggers: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        jeans: { price: 1499, original: 2099 },
        shorts: { price: 999, original: 1499 },
        joggers: { price: 1199, original: 1699 }
      },
      products: {
        jeans: [
          { name: 'Boys Classic Denim - Light Gray', image: '/images/pants/boys/pants/bpants1.png', colorName: 'Light Gray', bgColor: '#D9D9D9', textColor: '#1E1E1E' },
          { name: 'Boys Classic Denim - Medium Wash', image: '/images/pants/boys/pants/bpants2.png', colorName: 'Medium Wash', bgColor: '#D6D6D6', textColor: '#1E1E1E' },
          { name: 'Boys Classic Denim - Sandstone', image: '/images/pants/boys/pants/bpants3.png', colorName: 'Sandstone', bgColor: '#F3EFE6', textColor: '#1E1E1E' },
          { name: 'Boys Classic Denim - Vintage Ash', image: '/images/pants/boys/pants/bpants4.png', colorName: 'Vintage Ash', bgColor: '#D8D8D8', textColor: '#1E1E1E' },
          { name: 'Boys Classic Denim - Deep Blue', image: '/images/pants/boys/pants/bpants5.png', colorName: 'Deep Blue', bgColor: '#223A67', textColor: '#FFFFFF' },
          { name: 'Boys Classic Denim - Earth Brown', image: 'pants6.png', colorName: 'Earth Brown', bgColor: '#4A3328', textColor: '#FFFFFF' }
        ],
        shorts: [
          { name: 'Boys Cargo Shorts - White', image: 'pants1.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Cargo Shorts - Smoke', image: 'pants2.png', colorName: 'Smoke', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Cargo Shorts - Ocean', image: 'pants3.png', colorName: 'Ocean', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Cargo Shorts - Sun', image: 'pants4.png', colorName: 'Sun', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Cargo Shorts - Flame', image: 'pants5.png', colorName: 'Flame', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Cargo Shorts - Pine', image: 'pants6.png', colorName: 'Pine', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        joggers: [
          { name: 'Boys Track Jogger - Off White', image: 'pants1.png', colorName: 'Off White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Track Jogger - Black', image: 'pants2.png', colorName: 'Black', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Track Jogger - Navy', image: 'pants3.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Track Jogger - Mustard', image: 'pants4.png', colorName: 'Mustard', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Track Jogger - Crimson', image: 'pants5.png', colorName: 'Crimson', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Track Jogger - Spruce', image: 'pants6.png', colorName: 'Spruce', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    girls: {
      subCategories: ['jeans', 'shorts', 'joggers'],
      subCategoryLabels: { jeans: 'Jeans', shorts: 'Shorts', joggers: 'Joggers' },
      defaultSubCategory: 'jeans',
      headlines: {
        jeans: { main: 'Girls Denim', sub: 'Comfort & Style.', desc: 'Super-soft elasticated stretch denim created for flexibility and everyday charm.', price: 1499, original: 2099 },
        shorts: { main: 'Girls Summer Shorts', sub: 'Sun-Kissed Comfort.', desc: 'Lightweight breezy cotton shorts designed for warm days and joyful play.', price: 999, original: 1499 },
        joggers: { main: 'Girls Soft Joggers', sub: 'Cozy Vibes.', desc: 'Pastel and neutral cozy joggers tailored for school, sports, and weekend relaxation.', price: 1199, original: 1699 }
      },
      sizes: {
        jeans: ['6', '8', '10', '12', '14'],
        shorts: ['6', '8', '10', '12', '14'],
        joggers: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        jeans: { price: 1499, original: 2099 },
        shorts: { price: 999, original: 1499 },
        joggers: { price: 1199, original: 1699 }
      },
      products: {
        jeans: [
          { name: 'Girls Soft Denim - Mist', image: 'pants1.png', colorName: 'Mist', bgColor: '#D9D9D9', textColor: '#1E1E1E' },
          { name: 'Girls Soft Denim - Soft Gray', image: 'pants2.png', colorName: 'Soft Gray', bgColor: '#D6D6D6', textColor: '#1E1E1E' },
          { name: 'Girls Soft Denim - Oat', image: 'pants3.png', colorName: 'Oat', bgColor: '#F3EFE6', textColor: '#1E1E1E' },
          { name: 'Girls Soft Denim - Bleach Ash', image: 'pants4.png', colorName: 'Bleach Ash', bgColor: '#D8D8D8', textColor: '#1E1E1E' },
          { name: 'Girls Soft Denim - Midnight Navy', image: 'pants5.png', colorName: 'Midnight Navy', bgColor: '#223A67', textColor: '#FFFFFF' },
          { name: 'Girls Soft Denim - Cocoa', image: 'pants6.png', colorName: 'Cocoa', bgColor: '#4A3328', textColor: '#FFFFFF' }
        ],
        shorts: [
          { name: 'Girls Denim Shorts - Cotton White', image: 'pants1.png', colorName: 'Cotton White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Denim Shorts - Shadow', image: 'pants2.png', colorName: 'Shadow', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Denim Shorts - Indigo', image: 'pants3.png', colorName: 'Indigo', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Denim Shorts - Butter', image: 'pants4.png', colorName: 'Butter', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Denim Shorts - Coral', image: 'pants5.png', colorName: 'Coral', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Denim Shorts - Sage', image: 'pants6.png', colorName: 'Sage', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        joggers: [
          { name: 'Girls Pastel Jogger - Chalk', image: 'pants1.png', colorName: 'Chalk', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Pastel Jogger - Charcoal', image: 'pants2.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Pastel Jogger - Navy', image: 'pants3.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Pastel Jogger - Sunburst', image: 'pants4.png', colorName: 'Sunburst', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Pastel Jogger - Cherry', image: 'pants5.png', colorName: 'Cherry', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Pastel Jogger - Clover', image: 'pants6.png', colorName: 'Clover', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    }
  },
  underwear: {
    men: {
      subCategories: ['boxers', 'briefs', 'trunks'],
      subCategoryLabels: { boxers: 'Boxers', briefs: 'Briefs', trunks: 'Trunks' },
      defaultSubCategory: 'boxers',
      headlines: {
        boxers: {
          main: 'Comfort First',
          sub: 'Feel Your Best.',
          desc: 'Discover premium boxers designed for comfort, fit, and everyday confidence.',
          price: 599,
          original: 899
        },
        briefs: {
          main: 'Support & Style',
          sub: 'Perfect Fit.',
          desc: 'Supportive and stylish briefs that provide the perfect fit for all-day comfort.',
          price: 499,
          original: 799
        },
        trunks: {
          main: 'Modern Comfort',
          sub: 'Sleek & Stylish.',
          desc: 'Modern and sleek trunks that combine style with comfort for any occasion.',
          price: 549,
          original: 849
        }
      },
      sizes: {
        boxers: ['S', 'M', 'L', 'XL'],
        briefs: ['S', 'M', 'L', 'XL'],
        trunks: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        boxers: { price: 599, original: 899 },
        briefs: { price: 499, original: 799 },
        trunks: { price: 549, original: 849 }
      },
      products: {
        boxers: [
          { name: 'Comfort Boxers - Crisp White', image: 'black.png', colorName: 'Crisp White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Comfort Boxers - Stealth Gray', image: 'black.png', colorName: 'Stealth Gray', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Comfort Boxers - Deep Navy', image: 'blue.png', colorName: 'Deep Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Comfort Boxers - Golden Sand', image: 'yellow.png', colorName: 'Golden Sand', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Comfort Boxers - Crimson', image: 'red.png', colorName: 'Crimson', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Comfort Boxers - Pine Green', image: 'green.png', colorName: 'Pine Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        briefs: [
          { name: 'Support Briefs - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Support Briefs - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Support Briefs - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Support Briefs - Gold', image: 'yellow.png', colorName: 'Gold', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Support Briefs - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Support Briefs - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        trunks: [
          { name: 'Sleek Trunks - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Sleek Trunks - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Sleek Trunks - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Sleek Trunks - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Sleek Trunks - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Sleek Trunks - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    women: {
      subCategories: ['boxers', 'briefs', 'trunks'],
      subCategoryLabels: { boxers: 'Boy Shorts', briefs: 'Bikini Briefs', trunks: 'Hipsters' },
      defaultSubCategory: 'boxers',
      headlines: {
        boxers: { main: 'Boy Shorts', sub: 'Ultra Soft.', desc: 'Seamless, lightweight boy shorts designed for total comfort and no show-through.', price: 599, original: 899 },
        briefs: { main: 'Bikini Briefs', sub: 'Everyday Bliss.', desc: 'Breathable organic cotton briefs with soft elastic trims for zero irritation.', price: 499, original: 799 },
        trunks: { main: 'Hipsters', sub: 'Flawless Fit.', desc: 'Low-rise hipster panties crafted from cooling micro-modal fabric.', price: 549, original: 849 }
      },
      sizes: {
        boxers: ['XS', 'S', 'M', 'L', 'XL'],
        briefs: ['XS', 'S', 'M', 'L', 'XL'],
        trunks: ['XS', 'S', 'M', 'L', 'XL']
      },
      basePrices: {
        boxers: { price: 599, original: 899 },
        briefs: { price: 499, original: 799 },
        trunks: { price: 549, original: 849 }
      },
      products: {
        boxers: [
          { name: 'Women Boy Short - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Boy Short - Slate', image: 'black.png', colorName: 'Slate', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Boy Short - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Boy Short - Butter', image: 'yellow.png', colorName: 'Butter', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Boy Short - Ruby', image: 'red.png', colorName: 'Ruby', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Boy Short - Moss', image: 'green.png', colorName: 'Moss', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        briefs: [
          { name: 'Women Bikini - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Bikini - Slate', image: 'black.png', colorName: 'Slate', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Bikini - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Bikini - Butter', image: 'yellow.png', colorName: 'Butter', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Bikini - Ruby', image: 'red.png', colorName: 'Ruby', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Bikini - Moss', image: 'green.png', colorName: 'Moss', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        trunks: [
          { name: 'Women Hipster - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Hipster - Slate', image: 'black.png', colorName: 'Slate', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Hipster - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Hipster - Butter', image: 'yellow.png', colorName: 'Butter', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Hipster - Ruby', image: 'red.png', colorName: 'Ruby', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Hipster - Moss', image: 'green.png', colorName: 'Moss', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    boys: {
      subCategories: ['boxers', 'briefs', 'trunks'],
      subCategoryLabels: { boxers: 'Boxers', briefs: 'Briefs', trunks: 'Trunks' },
      defaultSubCategory: 'boxers',
      headlines: {
        boxers: { main: 'Boys Boxer Briefs', sub: 'Active Comfort.', desc: 'Tagless organic cotton underwear crafted for all-day breathability and softness.', price: 499, original: 799 },
        briefs: { main: 'Boys Classic Briefs', sub: 'Snug & Secure.', desc: 'Classic comfort briefs with gentle waistband that won’t pinch or ride up.', price: 399, original: 699 },
        trunks: { main: 'Boys Trunks', sub: 'Modern Fit.', desc: 'Short-leg stretch cotton trunks ideal for sports, school, and active days.', price: 449, original: 749 }
      },
      sizes: {
        boxers: ['S', 'M', 'L', 'XL'],
        briefs: ['S', 'M', 'L', 'XL'],
        trunks: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        boxers: { price: 499, original: 799 },
        briefs: { price: 399, original: 699 },
        trunks: { price: 449, original: 749 }
      },
      products: {
        boxers: [
          { name: 'Boys Boxer - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Boxer - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Boxer - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Boxer - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Boxer - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Boxer - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        briefs: [
          { name: 'Boys Brief - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Brief - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Brief - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Brief - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Brief - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Brief - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        trunks: [
          { name: 'Boys Trunk - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Trunk - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Trunk - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Trunk - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Trunk - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Trunk - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    girls: {
      subCategories: ['boxers', 'briefs', 'trunks'],
      subCategoryLabels: { boxers: 'Shorties', briefs: 'Briefs', trunks: 'Hipsters' },
      defaultSubCategory: 'boxers',
      headlines: {
        boxers: { main: 'Girls Shorties', sub: 'Gentle & Pure.', desc: 'Super-soft breathable cotton shorties created for total playtime ease.', price: 499, original: 799 },
        briefs: { main: 'Girls Classic Panties', sub: 'Everyday Sweetness.', desc: 'Comfort-first briefs in delightful shades with itch-free flat seams.', price: 399, original: 699 },
        trunks: { main: 'Girls Hipsters', sub: 'Stay-Put Comfort.', desc: 'Comfortable hipster cut with non-binding waistband for school and sports.', price: 449, original: 749 }
      },
      sizes: {
        boxers: ['S', 'M', 'L', 'XL'],
        briefs: ['S', 'M', 'L', 'XL'],
        trunks: ['S', 'M', 'L', 'XL']
      },
      basePrices: {
        boxers: { price: 499, original: 799 },
        briefs: { price: 399, original: 699 },
        trunks: { price: 449, original: 749 }
      },
      products: {
        boxers: [
          { name: 'Girls Shortie - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Shortie - Slate', image: 'black.png', colorName: 'Slate', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Shortie - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Shortie - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Shortie - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Shortie - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        briefs: [
          { name: 'Girls Panty - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Panty - Slate', image: 'black.png', colorName: 'Slate', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Panty - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Panty - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Panty - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Panty - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        trunks: [
          { name: 'Girls Hipster - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Hipster - Slate', image: 'black.png', colorName: 'Slate', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Hipster - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Hipster - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Hipster - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Hipster - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    }
  },
  accessories: {
    men: {
      subCategories: ['bags', 'hats', 'socks'],
      subCategoryLabels: { bags: 'Bags', hats: 'Hats', socks: 'Socks' },
      defaultSubCategory: 'bags',
      headlines: {
        bags: {
          main: 'Carry in Style',
          sub: 'Functional & Chic.',
          desc: 'Stylish and functional bags designed for everyday use. Perfect for work, travel, or casual outings.',
          price: 1499,
          original: 2199
        },
        hats: {
          main: 'Top It Off',
          sub: 'Complete Your Look.',
          desc: 'Complete your look with our stylish hats. From caps to beanies, find the perfect fit for any outfit.',
          price: 799,
          original: 1199
        },
        socks: {
          main: 'Step in Comfort',
          sub: 'Happy Feet.',
          desc: 'Comfortable and durable socks that keep your feet happy all day long. Available in various styles and colors.',
          price: 399,
          original: 599
        }
      },
      sizes: {
        bags: ['OS', 'S', 'M', 'L'],
        hats: ['OS', 'S', 'M', 'L'],
        socks: ['S', 'M', 'L']
      },
      basePrices: {
        bags: { price: 1499, original: 2199 },
        hats: { price: 799, original: 1199 },
        socks: { price: 399, original: 599 }
      },
      products: {
        bags: [
          { name: 'Everyday Crossbody Bag - Stone', image: 'black.png', colorName: 'Stone', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Everyday Crossbody Bag - Stealth Charcoal', image: 'black.png', colorName: 'Stealth Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Everyday Crossbody Bag - Navy Blue', image: 'blue.png', colorName: 'Navy Blue', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Everyday Crossbody Bag - Vibrant Yellow', image: 'yellow.png', colorName: 'Vibrant Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Everyday Crossbody Bag - Crimson Red', image: 'red.png', colorName: 'Crimson Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Everyday Crossbody Bag - Forest Green', image: 'green.png', colorName: 'Forest Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        hats: [
          { name: 'Classic Street Cap - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Classic Street Cap - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Classic Street Cap - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Classic Street Cap - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Classic Street Cap - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Classic Street Cap - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        socks: [
          { name: 'Cushioned Crew Socks - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Cushioned Crew Socks - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Cushioned Crew Socks - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Cushioned Crew Socks - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Cushioned Crew Socks - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Cushioned Crew Socks - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    women: {
      subCategories: ['bags', 'hats', 'socks'],
      subCategoryLabels: { bags: 'Bags', hats: 'Hats', socks: 'Socks' },
      defaultSubCategory: 'bags',
      headlines: {
        bags: { main: 'Carry in Style', sub: 'Functional & Chic.', desc: 'Stylish and functional bags designed for everyday use. Perfect for work, travel, or casual outings.', price: 1499, original: 2199 },
        hats: { main: 'Top It Off', sub: 'Complete Your Look.', desc: 'Complete your look with our stylish hats. From caps to beanies, find the perfect fit for any outfit.', price: 799, original: 1199 },
        socks: { main: 'Step in Comfort', sub: 'Happy Feet.', desc: 'Comfortable and durable socks that keep your feet happy all day long. Available in various styles and colors.', price: 399, original: 599 }
      },
      sizes: {
        bags: ['OS', 'S', 'M', 'L'],
        hats: ['OS', 'S', 'M', 'L'],
        socks: ['S', 'M', 'L']
      },
      basePrices: {
        bags: { price: 1499, original: 2199 },
        hats: { price: 799, original: 1199 },
        socks: { price: 399, original: 599 }
      },
      products: {
        bags: [
          { name: 'Women Tote & Crossbody - Stone', image: 'white.png', colorName: 'Stone', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Tote & Crossbody - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Tote & Crossbody - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Tote & Crossbody - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Tote & Crossbody - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Tote & Crossbody - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        hats: [
          { name: 'Women Bucket Hat - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Bucket Hat - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Bucket Hat - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Bucket Hat - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Bucket Hat - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Bucket Hat - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        socks: [
          { name: 'Women Ankle Socks - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Women Ankle Socks - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Women Ankle Socks - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Women Ankle Socks - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Women Ankle Socks - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Women Ankle Socks - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    boys: {
      subCategories: ['bags', 'hats', 'socks'],
      subCategoryLabels: { bags: 'Bags', hats: 'Hats', socks: 'Socks' },
      defaultSubCategory: 'bags',
      headlines: {
        bags: { main: 'Boys Backpack', sub: 'School & Fun.', desc: 'Sturdy water-resistant backpack with comfortable padded straps and roomy compartments.', price: 1299, original: 1899 },
        hats: { main: 'Boys Cap', sub: 'Street Ready.', desc: 'Adjustable snapback cap with breathable eyelets and embroidered logo.', price: 699, original: 999 },
        socks: { main: 'Boys Crew Socks', sub: 'Stay Active.', desc: 'Durable anti-odor athletic socks designed for sneakers and playground adventures.', price: 349, original: 499 }
      },
      sizes: {
        bags: ['OS', 'S', 'M', 'L'],
        hats: ['OS', 'S', 'M', 'L'],
        socks: ['S', 'M', 'L']
      },
      basePrices: {
        bags: { price: 1299, original: 1899 },
        hats: { price: 699, original: 999 },
        socks: { price: 349, original: 499 }
      },
      products: {
        bags: [
          { name: 'Boys Daypack - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Daypack - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Daypack - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Daypack - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Daypack - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Daypack - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        hats: [
          { name: 'Boys Cap - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Cap - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Cap - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Cap - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Cap - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Cap - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        socks: [
          { name: 'Boys Socks - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Boys Socks - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Boys Socks - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Boys Socks - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Boys Socks - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Boys Socks - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    },
    girls: {
      subCategories: ['bags', 'hats', 'socks'],
      subCategoryLabels: { bags: 'Bags', hats: 'Hats', socks: 'Socks' },
      defaultSubCategory: 'bags',
      headlines: {
        bags: { main: 'Girls Mini Backpack', sub: 'Charming & Light.', desc: 'Lightweight mini backpack with smooth dual zippers and cute aesthetic finish.', price: 1299, original: 1899 },
        hats: { main: 'Girls Sun Hat', sub: 'Sunny Protection.', desc: 'Charming wide-brim and bucket hat with UV protection for outdoor play.', price: 699, original: 999 },
        socks: { main: 'Girls Ankle Socks', sub: 'Soft Steps.', desc: 'Soft pastel combed cotton socks with seamless toe closure for maximum comfort.', price: 349, original: 499 }
      },
      sizes: {
        bags: ['OS', 'S', 'M', 'L'],
        hats: ['OS', 'S', 'M', 'L'],
        socks: ['S', 'M', 'L']
      },
      basePrices: {
        bags: { price: 1299, original: 1899 },
        hats: { price: 699, original: 999 },
        socks: { price: 349, original: 499 }
      },
      products: {
        bags: [
          { name: 'Girls Mini Pack - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Mini Pack - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Mini Pack - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Mini Pack - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Mini Pack - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Mini Pack - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        hats: [
          { name: 'Girls Hat - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Hat - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Hat - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Hat - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Hat - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Hat - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ],
        socks: [
          { name: 'Girls Socks - White', image: 'white.png', colorName: 'White', bgColor: '#F5F5F5', textColor: '#1d1a18' },
          { name: 'Girls Socks - Charcoal', image: 'black.png', colorName: 'Charcoal', bgColor: '#4A4A4A', textColor: '#FFFFFF' },
          { name: 'Girls Socks - Navy', image: 'blue.png', colorName: 'Navy', bgColor: '#2A3459', textColor: '#FFFFFF' },
          { name: 'Girls Socks - Yellow', image: 'yellow.png', colorName: 'Yellow', bgColor: '#FFE44D', textColor: '#1d1a18' },
          { name: 'Girls Socks - Red', image: 'red.png', colorName: 'Red', bgColor: '#D44545', textColor: '#FFFFFF' },
          { name: 'Girls Socks - Green', image: 'green.png', colorName: 'Green', bgColor: '#2A8C5E', textColor: '#FFFFFF' }
        ]
      }
    }
  }
};
