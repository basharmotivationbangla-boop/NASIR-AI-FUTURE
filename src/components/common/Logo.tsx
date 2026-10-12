import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-lg font-extrabold',
    lg: 'text-2xl font-black',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Futuristic SVG Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))"
        >
          {/* Outer hexagonal quantum ring */}
          <polygon
            points="50,4 92,27 92,73 50,96 8,73 8,27"
            stroke="url(#outerGrad)"
            strokeWidth="5"
            strokeLinejoin="round"
            className="animate-pulse"
          />
          {/* Futuristic N Monogram Vector */}
          <path
            d="M32 72V28L68 72V28"
            stroke="url(#coreGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Energy core node */}
          <circle cx="50" cy="50" r="5" fill="#38bdf8" />
          <defs>
            <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#9b51e0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`tracking-wider bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent ${textSizes[size]}`}>
            NASIR AI FUTURE
          </span>
          <span className="text-[9px] tracking-widest text-sky-400/90 uppercase font-mono mt-0.5 font-bold">
            IMAGINE · CREATE · INVENT
          </span>
        </div>
      )}
    </div>
  );
};
