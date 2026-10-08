import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', showText = true, to = '/' }) {
  // Dimension presets
  const sizeMap = {
    sm: { icon: 'w-8 h-8', iconInner: 32, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', iconInner: 40, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14', iconInner: 56, text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const LogoIcon = (
    <div
      className={`relative ${currentSize.icon} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300`}
      style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
      }}
    >
      {/* Light sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none" />

      {/* Wise Owl Mascot with Graduation Cap Vector SVG */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="owlBodyGrad" x1="12" y1="16" x2="36" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="capGrad" x1="10" y1="6" x2="38" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1B4B" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="20" y1="10" x2="38" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Owl Ear Tufts */}
        <path d="M12 21L14 14L19 19Z" fill="#DBEAFE" />
        <path d="M36 21L34 14L29 19Z" fill="#DBEAFE" />

        {/* Owl Body & Head Shape */}
        <rect x="10" y="17" width="28" height="24" rx="14" fill="url(#owlBodyGrad)" />

        {/* Owl Wings Accents */}
        <path d="M11 26C11 32 14 37 17 38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        <path d="M37 26C37 32 34 37 31 38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />

        {/* Owl Big Wise Eyes (White Sockets) */}
        <circle cx="18" cy="27" r="5.5" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
        <circle cx="30" cy="27" r="5.5" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />

        {/* Pupils with Sparkle */}
        <circle cx="18.5" cy="27" r="3.2" fill="#0F172A" />
        <circle cx="17.5" cy="25.5" r="1.2" fill="#FFFFFF" />

        <circle cx="29.5" cy="27" r="3.2" fill="#0F172A" />
        <circle cx="28.5" cy="25.5" r="1.2" fill="#FFFFFF" />

        {/* Cute Golden Beak */}
        <path
          d="M21.5 29.5C22.5 32.5 25.5 32.5 26.5 29.5C24.5 30.2 23.5 30.2 21.5 29.5Z"
          fill="url(#goldGrad)"
        />

        {/* Mortarboard Graduation Cap (Mũ Cử Nhân) */}
        {/* Diamond Cap Top */}
        <path d="M24 6L38 11.5L24 17L10 11.5L24 6Z" fill="url(#capGrad)" />

        {/* Cap Skull Base */}
        <path d="M16 13.5V17.5C16 19.8 19.6 21 24 21C28.4 21 32 19.8 32 17.5V13.5" fill="#1E1B4B" />

        {/* Cap Golden Button & Tassel */}
        <circle cx="24" cy="11.5" r="1.2" fill="#FDE047" />
        <path d="M24 11.5L34 15.5V19.5" stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="34" cy="20.5" r="1" fill="#F59E0B" />
      </svg>
    </div>
  );

  const LogoText = showText && (
    <div className="flex flex-col text-left">
      <div className={`font-black ${currentSize.text} leading-none tracking-tight flex items-center gap-1`}>
        <span className="text-slate-900">English</span>
        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
          Beginner
        </span>
      </div>
      <span className={`${currentSize.sub} font-bold text-blue-600/80 mt-0.5 tracking-wide uppercase`}>
        E4B • Học từ số 0
      </span>
    </div>
  );

  if (!to) {
    return (
      <div className="inline-flex items-center gap-3 select-none">
        {LogoIcon}
        {LogoText}
      </div>
    );
  }

  return (
    <Link to={to} className="inline-flex items-center gap-3 select-none group">
      {LogoIcon}
      {LogoText}
    </Link>
  );
}
