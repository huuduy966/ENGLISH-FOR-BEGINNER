import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Target, Award, Flame, LogOut, CheckCircle2, Compass } from 'lucide-react';
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
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 border-b border-slate-100 pb-5 sm:pb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-blue-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{user.name}</h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Level {user.level || 'A1'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                {user.practiceScore || 0} điểm làm bài
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

        {/* Placement Test Status & Action Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">Đánh giá trình độ đầu vào</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {user.placementStatus === 'ASSESSED'
                  ? `Đã hoàn thành đánh giá • Trình độ hiện tại: Level ${user.level || 'A1'}`
                  : 'Trạng thái: Chưa đánh giá trình độ (Đang học từ đầu)'}
              </span>
            </div>
          </div>
          <Link
            to="/placement-test"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm self-start sm:self-auto text-center"
          >
            {user.placementStatus === 'ASSESSED' ? 'Kiểm tra lại' : 'Làm bài kiểm tra ngay'}
          </Link>
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
