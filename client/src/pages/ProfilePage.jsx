import React, { useState } from 'react';
import { User, Mail, Target, Award, Flame, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Hồ sơ cá nhân
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Thông tin học viên
        </h1>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Level {user.level || 'A1'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                {user.xp || 0} XP
              </span>
              {user.role === 'ADMIN' && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                  Quản trị viên
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Mục tiêu học tập</span>
            <span className="text-sm font-bold text-slate-800">{user.goal || 'Zero-foundation'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Chuỗi ngày liên tục</span>
            <span className="text-sm font-bold text-orange-600 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500" />
              {user.streakDays || 1} ngày streak
            </span>
          </div>
        </div>

        {/* Settings toggles */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Cài đặt ứng dụng</h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-sm font-medium text-slate-700">Âm thanh phát âm tự động</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-sm font-medium text-slate-700">Nhắc nhở học tập hàng ngày</span>
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full py-3.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}
