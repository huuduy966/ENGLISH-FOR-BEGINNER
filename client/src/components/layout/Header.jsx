import React, { useState } from 'react';
import { Menu, Flame, Star, Search, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import QuickDictionaryModal from '../common/QuickDictionaryModal';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [lookupWord, setLookupWord] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setLookupWord(headerSearch.trim());
      setDictModalOpen(true);
      setHeaderSearch('');
    }
  };

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Greeting */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-slate-700">
              Chào mừng, {user?.name || 'Học viên'}
            </span>
          </div>
        </div>

        {/* Center: Global Quick Dictionary Search Bar (Free Dictionary API) */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2">
          <form onSubmit={handleHeaderSearch} className="relative">
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Tra từ nhanh (Free Dictionary API)..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 bottom-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition hidden sm:inline-block"
            >
              Tra
            </button>
          </form>
        </div>

        {/* Right: Gamification indicators & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs sm:text-sm font-bold shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="hidden xs:inline">{user?.streakDays || 1} ngày</span>
          </div>

          {/* XP indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm font-bold shadow-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{user?.xp || 0} XP</span>
          </div>

          {/* User Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition"
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

      {/* Global Quick Dictionary Modal */}
      <QuickDictionaryModal
        word={lookupWord}
        isOpen={dictModalOpen}
        onClose={() => setDictModalOpen(false)}
      />
    </>
  );
}
