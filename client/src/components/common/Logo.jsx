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
      className={`relative ${currentSize.icon} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300`}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #06b6d4 100%)',
      }}
    >
      {/* Decorative light reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none" />

      {/* Modern Vector SVG: Open Book + Spark of Knowledge */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4 drop-shadow"
      >
        <defs>
          <linearGradient id="bookGrad" x1="6" y1="14" x2="34" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id="sparkGrad" x1="16" y1="6" x2="24" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Central Rising Knowledge Spark */}
        <path
          d="M20 5C20.5 8 22.5 10 25.5 10.5C22.5 11 20.5 13 20 16C19.5 13 17.5 11 14.5 10.5C17.5 10 19.5 8 20 5Z"
          fill="url(#sparkGrad)"
        />

        {/* Left Book Page */}
        <path
          d="M9 16.5C13 15 17.5 16.5 20 18.5V31.5C17.5 29.5 13 28.5 9 30V16.5Z"
          fill="url(#bookGrad)"
          fillOpacity="0.95"
        />

        {/* Right Book Page */}
        <path
          d="M31 16.5C27 15 22.5 16.5 20 18.5V31.5C22.5 29.5 27 28.5 31 30V16.5Z"
          fill="url(#bookGrad)"
          fillOpacity="0.95"
        />

        {/* Book Spine / Bookmark Accent */}
        <path
          d="M19.25 18.2C19.7 18.05 20.3 18.05 20.75 18.2V32C20.3 31.8 19.7 31.8 19.25 32V18.2Z"
          fill="#38BDF8"
        />

        {/* Subtle Page Lines Left */}
        <path
          d="M12 21.5C14.5 20.5 17 21.2 18.5 22.2"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M12 25C14.5 24 17 24.7 18.5 25.7"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Subtle Page Lines Right */}
        <path
          d="M28 21.5C25.5 20.5 23 21.2 21.5 22.2"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M28 25C25.5 24 23 24.7 21.5 25.7"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
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
      <span className={`${currentSize.sub} font-semibold text-slate-400 mt-0.5 tracking-wide uppercase`}>
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
