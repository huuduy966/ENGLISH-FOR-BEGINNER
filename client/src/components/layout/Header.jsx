import React from 'react';
import { Menu, Flame, Star, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <span>Chào mừng, {user?.name || 'Học viên'}</span>
            <Sparkles className="w-4 h-4 text-amber-500 inline" />
          </span>
        </div>
      </div>

      {/* Right: Gamification indicators & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs sm:text-sm font-bold shadow-sm">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span>{user?.streakDays || 1} ngày streak</span>
        </div>

        {/* XP indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm font-bold shadow-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{user?.xp || 0} XP</span>
        </div>

        {/* User Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden md:inline">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
