import React, { useState } from 'react';
import { Menu, Flame, CheckCircle2, Search, Globe } from 'lucide-react';
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
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-2.5 sm:px-4 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Mobile hamburger & Greeting */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-slate-700">
              Chào mừng, {user?.name || 'Học viên'}
            </span>
          </div>
        </div>

        {/* Center: Global Quick Dictionary Search Bar */}
        <div className="flex-1 min-w-0 max-w-[140px] xs:max-w-xs md:max-w-md mx-1 sm:mx-2">
          <form
            onSubmit={handleHeaderSearch}
            className="flex items-center bg-slate-50 hover:bg-white focus-within:bg-white rounded-xl border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/10 transition p-0.5 sm:p-1"
          >
            <div className="pl-1.5 sm:pl-2 pr-1 text-slate-400 flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Tra từ nhanh..."
              className="flex-1 min-w-0 py-1 px-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent outline-none truncate"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition hidden sm:inline-block shrink-0"
            >
              Tra từ
            </button>
          </form>
        </div>

        {/* Right: Gamification indicators & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Streak indicator */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs sm:text-sm font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 animate-pulse shrink-0" />
            <span>{user?.streakDays || 1}</span>
            <span className="hidden xs:inline">ngày</span>
          </div>

          {/* Practice score indicator */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
            <span>{user?.practiceScore || 0}</span>
            <span className="hidden xs:inline">điểm</span>
          </div>

          {/* User Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-0.5 sm:p-1 pl-1 rounded-full hover:bg-slate-100 transition shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-slate-700 hidden md:inline truncate max-w-[100px]">
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
