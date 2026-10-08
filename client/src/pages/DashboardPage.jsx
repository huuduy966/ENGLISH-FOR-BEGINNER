import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, BookOpen, Layers, CheckCircle2, Search, Headphones, Globe } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TodaysLearningCard from '../components/dashboard/TodaysLearningCard';
import ContinueCard from '../components/dashboard/ContinueCard';
import StatsRow from '../components/dashboard/StatsRow';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
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

      {/* Main Focus: Today's Learning Package */}
      <TodaysLearningCard packageData={todaysPackage} />

      {/* Stats Row */}
      <StatsRow stats={stats} />

      {/* 2-Column: Today's Goal & Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Goal */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Mục tiêu hôm nay (Today's Goal)</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {todaysGoal?.progressPercent || 60}% hoàn thành
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Học từ vựng</span>
                </span>
                <span>{todaysGoal?.vocabulary?.current || 0} / {todaysGoal?.vocabulary?.target || 15} từ</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(((todaysGoal?.vocabulary?.current || 0) / (todaysGoal?.vocabulary?.target || 15)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ngữ pháp nền tảng</span>
                </span>
                <span>{todaysGoal?.grammar?.current || 0} / {todaysGoal?.grammar?.target || 1} chủ điểm</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${todaysGoal?.grammar?.current ? 100 : 20}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-purple-500" />
                  <span>Luyện nghe & Hội thoại</span>
                </span>
                <span>{todaysGoal?.listening?.current || 0} / {todaysGoal?.listening?.target || 1} bài</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${todaysGoal?.listening?.current ? 100 : 15}%` }}
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
                <h4 className="font-bold text-slate-900 mt-2 mb-1">Tra từ điển Free Dictionary</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Tra cứu nghĩa chi tiết, phiên âm IPA, câu ví dụ và audio bản xứ thực tế từ Free Dictionary API.
                </p>
              </div>
              <div className="space-y-2">
                <Link
                  to="/dictionary"
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Mở Từ điển Quốc tế</span>
                </Link>
                <Link
                  to="/vocabulary"
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>Sổ tay từ vựng</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
