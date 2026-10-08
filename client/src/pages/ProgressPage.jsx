import React, { useState, useEffect } from 'react';
import { BarChart2, Flame, Award, Clock, BookOpen, CheckCircle, TrendingUp, Layers, Headphones, Mic, Check, Lightbulb } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProgressPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/progress/stats')
      .then((res) => setStatsData(res.data))
      .catch((err) => console.error('Fetch progress stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { overview, skills, recentQuizzes } = statsData || {};

  const daysOfWeek = [
    { day: 'T2', active: true },
    { day: 'T3', active: true },
    { day: 'T4', active: true },
    { day: 'T5', active: true },
    { day: 'T6', active: true },
    { day: 'T7', active: false },
    { day: 'CN', active: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Học tập cá nhân hóa
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Tiến độ & Thành tích học tập
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi mức độ hoàn thiện các kỹ năng và nhật ký nỗ lực của bạn qua từng ngày.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Thời gian học tập</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{overview?.totalStudyHours || '2.5'} giờ</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Bài học hoàn thành</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {overview?.completedLessons || 1} / {overview?.totalLessons || 5} bài
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Điểm Quiz trung bình</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{overview?.averageScore || 85}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Chuỗi ngày (Streak)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{user?.streakDays || 1} ngày</p>
          </div>
        </div>
      </div>

      {/* 2-Columns: Skills Breakdown & Streak Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progress */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Mức độ thành thạo 4 Kỹ năng
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Vocabulary (Từ vựng)</span>
                </span>
                <span>{skills?.vocabulary || 75}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${skills?.vocabulary || 75}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Grammar (Ngữ pháp)</span>
                </span>
                <span>{skills?.grammar || 60}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${skills?.grammar || 60}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-purple-500" />
                  <span>Listening (Luyện nghe)</span>
                </span>
                <span>{skills?.listening || 55}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${skills?.listening || 55}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-500" />
                  <span>Speaking (Phát âm & Nói)</span>
                </span>
                <span>{skills?.speaking || 45}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${skills?.speaking || 45}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak Calendar Tracker */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              Lịch học tuần này
            </h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              Duy trì thói quen
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center pt-2">
            {daysOfWeek.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{d.day}</span>
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition ${
                    d.active
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {d.active ? <Check className="w-4 h-4 stroke-[3]" /> : '•'}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Mẹo duy trì động lực:</strong> Học đều đặn 15 phút mỗi ngày hiệu quả hơn gấp nhiều lần so với việc dồn 3 tiếng vào cuối tuần.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
