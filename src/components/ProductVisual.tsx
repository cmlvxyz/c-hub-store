import React from 'react';

interface ProductVisualProps {
  category: string;
  subCategory: string;
  colorName: string;
  bgColor: string;
  shirtColor?: string;
  name: string;
  className?: string;
  image?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  category,
  subCategory,
  colorName,
  bgColor,
  shirtColor,
  name,
  className = 'w-full h-full object-contain',
  image
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  const resolvedSrc = React.useMemo(() => {
    if (!image) return null;
    if (image.startsWith('http') || image.startsWith('data:') || image.startsWith('/')) {
      return image;
    }
    if (image.startsWith('images/')) {
      return `/${image}`;
    }
    return null;
  }, [image]);

  if (resolvedSrc && !imageFailed) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  // Derive realistic garment colors
  const primaryColor = shirtColor || bgColor || '#F4F4F5';
  const hex = primaryColor.toLowerCase();
  
  const isWhiteOrLight = 
    hex === '#ffffff' || 
    hex === '#f4f4f5' || 
    hex === '#f5f5f4' || 
    hex === '#f8fafc' ||
    hex === '#e2e8f0' ||
    hex === '#ecebed' ||
    hex === '#eae5d9' ||
    hex === '#fdf6e2' ||
    hex === '#f4ecd8' ||
    hex === '#ffe44d' ||
    hex === '#ceb699' ||
    hex === '#f5f4ef' ||
    hex === '#e6e5e1' ||
    hex === '#cda677';

  const isDark = 
    hex === '#4a4a4a' || 
    hex === '#2a3459' || 
    hex === '#572a34' || 
    hex === '#433630' || 
    hex === '#3a3a3a' || 
    hex === '#36395f' || 
    hex === '#223a67' || 
    hex === '#4a3328' || 
    hex === '#1a1716' || 
    hex === '#27345b' || 
    hex === '#3f3128' || 
    hex === '#432838' || 
    hex === '#264441' ||
    hex === '#18181b' ||
    hex === '#27272a' ||
    hex === '#2b2b2d' ||
    hex === '#202022' ||
    hex === '#09090b' ||
    hex === '#7d5b4f' ||
    hex === '#73574a' ||
    hex === '#4a372e' ||
    hex === '#42322b' ||
    hex === '#c70853' ||
    hex === '#9e1045' ||
    hex === '#6a092b' ||
    hex === '#5e0528';

  const strokeColor = isDark ? 'rgba(0, 0, 0, 0.45)' : isWhiteOrLight ? '#D1D5DB' : 'rgba(0, 0, 0, 0.2)';
  const shadowTone = isDark ? 'rgba(0,0,0,0.5)' : isWhiteOrLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.2)';
  const highlightTone = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)';
  const foldCrease = isDark ? 'rgba(255,255,255,0.1)' : isWhiteOrLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.15)';

  const renderGarment = () => {
    if (category === 'shoes') {
      return (
        <g transform="translate(10, 10)">
          {/* Sneaker */}
          <path
            d="M 90,225 Q 180,215 275,225 Q 290,255 270,270 L 95,270 Q 80,250 90,225 Z"
            fill="#FFFFFF"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          />
          <path
            d="M 95,225 Q 120,165 170,140 L 210,145 L 245,190 L 275,225 Q 210,225 95,225 Z"
            fill={primaryColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path
            d="M 130,205 Q 185,175 250,215"
            fill="none"
            stroke={isDark ? '#FFFFFF' : '#111111'}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M 175,145 L 195,160 M 185,155 L 205,170 M 195,165 L 215,180" stroke="#9CA3AF" strokeWidth="2.5" />
        </g>
      );
    }

    if (category === 'pants') {
      return (
        <g transform="translate(10, 10)">
          {/* Wooden Hanger for pants */}
          <path d="M 190,38 Q 190,15 202,18 Q 212,22 202,36 L 190,38" fill="none" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
          <path d="M 140,58 L 240,58 L 240,64 L 140,64 Z" fill="#C69263" stroke="#9A6B42" strokeWidth="1" />
          {/* Trousers / Jeans */}
          <path
            d="M 142,65 L 238,65 L 248,270 L 218,270 L 190,115 L 162,270 L 132,270 Z"
            fill={primaryColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <line x1="190" y1="65" x2="190" y2="110" stroke={foldCrease} strokeWidth="2" />
        </g>
      );
    }

    if (category === 'underwear') {
      return (
        <g transform="translate(10, 20)">
          <path
            d="M 130,105 L 250,105 L 260,225 L 215,225 L 190,160 L 165,225 L 120,225 Z"
            fill={primaryColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <rect x="128" y="100" width="124" height="20" rx="3" fill="#18181B" />
          <text x="190" y="114" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" letterSpacing="2">C-HUB COMFORT</text>
        </g>
      );
    }

    if (category === 'accessories') {
      return (
        <g transform="translate(10, 15)">
          <rect x="120" y="120" width="140" height="120" rx="18" fill={primaryColor} stroke={strokeColor} strokeWidth="2" />
          <rect x="135" y="145" width="110" height="75" rx="10" fill={shadowTone} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M 125,125 Q 90,60 190,55 Q 290,60 255,125" fill="none" stroke="#27272A" strokeWidth="7" />
          <text x="190" y="185" textAnchor="middle" fill={isDark ? '#FFF' : '#111'} fontSize="11" fontWeight="800" letterSpacing="2">C-HUB</text>
        </g>
      );
    }

    // Default & Clothes (Hoodie / T-Shirt / Dress) - EXACT HANGING GARMENT
    return (
      <g>
        {/* Metal Hook */}
        <path
          d="M 190,40 Q 190,14 204,18 Q 215,22 204,36 L 190,40"
          fill="none"
          stroke="#71717A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="190" cy="40" r="3" fill="#52525B" />

        {/* Natural Wooden Hanger Bar */}
        <path
          d="M 130,76 Q 190,48 250,76 L 254,67 Q 190,39 126,67 Z"
          fill="#C89666"
          stroke="#9D6E43"
          strokeWidth="1.2"
        />
        <path
          d="M 138,72 Q 190,51 242,72"
          stroke="#E6BE94"
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />

        {/* Realistic Drape Folds and Body */}
        {subCategory === 'hoodie' ? (
          <>
            {/* Hoodie Body & Sleeves */}
            <path
              d="M 85,115 L 130,68 Q 160,82 190,82 Q 220,82 250,68 L 295,115 L 265,142 L 245,122 L 245,285 L 135,285 L 135,122 L 115,142 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            {/* Hood */}
            <path
              d="M 130,68 Q 190,22 250,68 Q 225,110 190,110 Q 155,110 130,68 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Kangaroo Pocket */}
            <path
              d="M 152,205 L 228,205 L 238,260 L 142,260 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            {/* Drawstrings */}
            <path d="M 175,98 L 175,155" stroke="#A1A1AA" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 205,98 L 205,150" stroke="#A1A1AA" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* T-Shirt Body & Dropping Short Sleeves with natural 3D contour */}
            <path
              d="M 92,112 L 138,65 Q 190,82 242,65 L 288,112 L 258,144 L 234,122 L 236,285 Q 190,292 144,285 L 146,122 L 122,144 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="1.5"
            />

            {/* Inner Back Collar Depth */}
            <path
              d="M 154,67 Q 190,52 226,67 Q 190,78 154,67 Z"
              fill={isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.12)'}
            />

            {/* Collar Ribbing Front */}
            <path
              d="M 152,66 Q 190,92 228,66"
              fill="none"
              stroke={isDark ? '#000000' : isWhiteOrLight ? '#D1D5DB' : strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 153,66 Q 190,90 227,66"
              fill="none"
              stroke={highlightTone}
              strokeWidth="1.2"
            />

            {/* Inner Neck Tag */}
            <rect x="184" y="60" width="12" height="14" rx="2" fill="#18181B" />
            <circle cx="190" cy="65" r="1.5" fill="#FAFAF9" />
            <line x1="187" y1="70" x2="193" y2="70" stroke="#FAFAF9" strokeWidth="1" />

            {/* Soft Shadow Drapery Fold lines */}
            <path d="M 138,66 L 148,124" stroke={foldCrease} strokeWidth="1.8" fill="none" />
            <path d="M 242,66 L 232,124" stroke={foldCrease} strokeWidth="1.8" fill="none" />
            <path d="M 146,122 Q 162,175 152,240" stroke={foldCrease} strokeWidth="2" fill="none" />
            <path d="M 234,122 Q 218,175 228,240" stroke={foldCrease} strokeWidth="2" fill="none" />
            <path d="M 188,105 L 188,275" stroke={foldCrease} strokeWidth="1.2" fill="none" opacity="0.6" />
          </>
        )}
      </g>
    );
  };

  return (
    <div className={`relative flex items-center justify-center p-2 select-none ${className}`}>
      <svg
        viewBox="60 10 260 300"
        className="w-full h-full filter drop-shadow-2xl transition-all duration-300"
      >
        <defs>
          <radialGradient id={`glow-${category}-${subCategory}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {renderGarment()}
      </svg>
    </div>
  );
};
