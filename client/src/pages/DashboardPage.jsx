import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Search,
  Headphones,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TodaysLearningCard from '../components/dashboard/TodaysLearningCard';
import ContinueCard from '../components/dashboard/ContinueCard';
import StatsRow from '../components/dashboard/StatsRow';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang chuẩn bị gói học hôm nay...</p>
      </div>
    );
  }

  const { todaysPackage, continueLesson, stats, todaysGoal } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Chào buổi sáng, {user?.name || 'bạn'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mục tiêu học: <span className="font-semibold text-blue-600">{user?.goal || 'Lấy lại gốc từ đầu'}</span> • Cấp độ: <span className="font-bold text-slate-700">{user?.level || 'A1'}</span>
          </p>
        </div>

        <Link
          to="/lessons"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 font-semibold text-xs transition shadow-sm self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Tất cả bài học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Focus: Today's Learning Package (60 Daily Questions) */}
      <TodaysLearningCard onScoreUpdated={fetchDashboardData} />

      {/* Stats Row */}
      <StatsRow stats={stats} />

      {/* 2-Column: Today's Goal & Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Goal - Synchronized with Today's Learning (60 Questions) */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Mục tiêu hôm nay (Today's Goal)</h3>
                <p className="text-xs text-slate-400">Đồng bộ theo tiến độ 60 câu luyện tập hằng ngày</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {todaysGoal?.completedCount || 0} / 60 câu
              </span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                {todaysGoal?.progressPercent || 0}% hoàn thành
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Từ vựng (20 câu) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>1. Từ vựng</span>
                </span>
                <span>{todaysGoal?.vocabulary?.current || 0} / 20 câu</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((todaysGoal?.vocabulary?.current || 0) / 20) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Luyện nói (10 câu) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                  <span>2. Luyện nói</span>
                </span>
                <span>{todaysGoal?.speaking?.current || 0} / 10 câu</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((todaysGoal?.speaking?.current || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Tìm & sửa lỗi sai (10 câu) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. Tìm & sửa lỗi sai</span>
                </span>
                <span>{todaysGoal?.errorCorrection?.current || 0} / 10 câu</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((todaysGoal?.errorCorrection?.current || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Luyện nghe (10 câu) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-purple-500" />
                  <span>4. Luyện nghe</span>
                </span>
                <span>{todaysGoal?.listening?.current || 0} / 10 câu</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((todaysGoal?.listening?.current || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 5. Luyện đọc (10 câu) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>5. Luyện đọc</span>
                </span>
                <span>{todaysGoal?.reading?.current || 0} / 10 câu</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((todaysGoal?.reading?.current || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Card */}
        <div>
          {continueLesson ? (
            <ContinueCard continueLesson={continueLesson} />
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Luyện tập & Tra cứu
                </span>
                <h4 className="font-bold text-slate-900 mt-2 mb-1">Tra cứu từ điển</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Tra cứu nghĩa chi tiết, phiên âm IPA, câu ví dụ thực tế và phát âm giọng bản xứ.
                </p>
              </div>
              <div className="space-y-2">
                <Link
                  to="/dictionary"
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Mở Từ điển</span>
                </Link>
                <Link
                  to="/lessons"
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>Danh sách bài học</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
