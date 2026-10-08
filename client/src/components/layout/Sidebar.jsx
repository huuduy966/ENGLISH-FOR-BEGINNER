import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo';
import {
  Home,
  BookOpen,
  Layers,
  Search,
  CheckSquare,
  BarChart2,
  User,
  ShieldCheck,
  Star,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Trang chủ', path: '/dashboard', icon: Home },
    { name: 'Bài học', path: '/lessons', icon: BookOpen },
    { name: 'Từ vựng & Flashcards', path: '/vocabulary', icon: Layers },
    { name: 'Tra từ điển', path: '/dictionary', icon: Search },
    { name: 'Kiểm tra đầu vào', path: '/placement-test', icon: CheckSquare },
    { name: 'Tiến độ học', path: '/progress', icon: BarChart2 },
    { name: 'Hồ sơ cá nhân', path: '/profile', icon: User },
  ];

  if (user && user.role === 'ADMIN') {
    navItems.push({
      name: 'Quản trị Admin',
      path: '/admin',
      icon: ShieldCheck,
      badge: 'Admin',
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <Logo size="sm" to="/dashboard" />
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="text-xs font-semibold text-slate-400 px-3 pb-2 uppercase tracking-wider">
            Menu học tập
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Level & Streak mini banner */}
        {user && (
          <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Trình độ hiện tại</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[11px]">
                {user.level || 'A1'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200/50 text-xs text-slate-600">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{user.xp || 0} XP tích lũy</span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
