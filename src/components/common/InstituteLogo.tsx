import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  customLogoUrl?: string;
}

export const InstituteLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'dark',
  customLogoUrl,
}) => {
  const sizeMap = {
    sm: { icon: 34, title: 'text-sm', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 44, title: 'text-base font-bold', sub: 'text-xs', gap: 'gap-2.5' },
    lg: { icon: 56, title: 'text-xl font-extrabold', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 80, title: 'text-2xl font-black', sub: 'text-sm', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="Shikshyalaya Shaikshik Sanstha"
          className="object-contain rounded-md shadow-sm"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        />
      ) : (
        <div
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        >
          {/* Vector SVG faithfully representing the Shikshyalaya Shaikshik Sanstha flame, open book & arch */}
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm"
          >
            <defs>
              <linearGradient id="blueArchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
              <linearGradient id="cyanFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="orangeFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <linearGradient id="bookBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>

            {/* Top Outer Arch Ring */}
            <path
              d="M 22 66 A 40 40 0 1 1 98 66"
              stroke="url(#blueArchGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Flame 1: Top Cyan/Blue Swirl */}
            <path
              d="M 60 18 C 65 24 67 31 63 37 C 60 41 54 41 58 46 C 62 49 66 43 66 37 C 66 27 60 21 60 18 Z"
              fill="url(#cyanFlameGrad)"
            />

            {/* Flame 2: Center Warm Amber/Orange Swirl */}
            <path
              d="M 52 35 C 57 32 64 34 67 39 C 69 44 65 49 57 48 C 50 48 51 54 59 55 C 67 56 71 49 70 42 C 69 33 57 28 52 35 Z"
              fill="url(#orangeFlameGrad)"
            />

            {/* Flame 3: Lower Cyan/Blue Wave */}
            <path
              d="M 51 46 C 47 50 47 57 53 60 C 58 63 64 61 62 67 C 60 72 53 71 50 66 C 45 61 46 51 51 46 Z"
              fill="url(#cyanFlameGrad)"
            />

            {/* Open Book: Orange Upper Leaves */}
            <path
              d="M 60 74 C 47 70 30 71 16 77 C 28 85 46 82 60 88 C 74 82 92 85 104 77 C 90 71 73 70 60 74 Z"
              fill="url(#orangeFlameGrad)"
            />

            {/* Open Book: Blue Spine / Base Cover */}
            <path
              d="M 60 88 C 45 83 28 86 17 80 C 26 89 44 87 60 92 C 76 87 94 89 103 80 C 92 86 75 83 60 88 Z"
              fill="url(#bookBlueGrad)"
            />
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-tight select-none min-w-0 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
            <span
              className={`font-['Noto_Sans_Devanagari',sans-serif] ${currentSize.title} tracking-tight shrink-0 ${
                textColor === 'light' ? 'text-white' : 'text-[#12315A]'
              }`}
            >
              शिक्षालय
            </span>
            <span
              className={`font-['Noto_Sans_Devanagari',sans-serif] text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                textColor === 'light'
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              शैक्षिक संस्था
            </span>
          </div>
          <span
            className={`font-sans tracking-wider uppercase font-bold text-[9px] sm:text-[10px] leading-snug whitespace-nowrap mt-0.5 ${
              textColor === 'light' ? 'text-amber-300' : 'text-[#12315A]'
            }`}
          >
            SHIKSHYALAYA SHAIKSHIK SANSTHA
          </span>
        </div>
      )}
    </div>
  );
};
