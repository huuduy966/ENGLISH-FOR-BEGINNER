import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  BarChart3,
  Layers,
  Headphones,
  Mic,
  BookMarked,
  CheckSquare,
  ClipboardCheck,
  Calendar,
  Sparkles,
  Filter,
  RotateCcw,
  Info,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProgressPage() {
  const { user } = useAuth();

  // Period: '7_days' | '30_days' | '90_days' | 'all_time'
  const [selectedPeriod, setSelectedPeriod] = useState('7_days');
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart Metric: 'studyMinutes' | 'questionsCount' | 'correctCount' | 'scoreGained' | 'lessonsCompleted'
  const [chartMetric, setChartMetric] = useState('questionsCount');

  // Heatmap day popover/modal
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // Activity feed filter: 'ALL' | 'LESSON' | 'EXAM' | 'DAILY' | 'VOCAB'
  const [activityFilter, setActivityFilter] = useState('ALL');

  const fetchProgressStats = (period) => {
    setLoading(true);
    setError(null);
    api.get('/dashboard/progress/stats', { params: { period } })
      .then((res) => {
        setStatsData(res.data);
      })
      .catch((err) => {
        console.error('Fetch progress stats error:', err);
        setError('Không thể tải dữ liệu tiến độ học tập. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProgressStats(selectedPeriod);
  }, [selectedPeriod]);

  // Loading state
  if (loading && !statsData) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Đang tổng hợp dữ liệu tiến độ học tập...</p>
      </div>
    );
  }

  // Error state
  if (error && !statsData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
          <Info className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Lỗi tải dữ liệu</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchProgressStats(selectedPeriod)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  const {
    kpiCards = {},
    periodSummary = {},
    dailyActivity = [],
    skillMetrics = {},
    cefrRoadmap = [],
    recentActivities = [],
    userLevel = user?.level || 'A1',
  } = statsData || {};

  // Chart Metric configurations
  const metricOptions = [
    { id: 'questionsCount', label: 'Số câu đã làm', unit: 'câu', color: 'bg-blue-500', barColor: '#3b82f6' },
    { id: 'correctCount', label: 'Số câu đúng', unit: 'câu đúng', color: 'bg-emerald-500', barColor: '#10b981' },
    { id: 'scoreGained', label: 'Điểm làm bài', unit: 'điểm', color: 'bg-indigo-500', barColor: '#6366f1' },
    { id: 'studyMinutes', label: 'Số phút học', unit: 'phút', color: 'bg-amber-500', barColor: '#f59e0b' },
    { id: 'lessonsCompleted', label: 'Bài học hoàn thành', unit: 'bài', color: 'bg-purple-500', barColor: '#a855f7' },
  ];

  const currentMetricOpt = metricOptions.find((m) => m.id === chartMetric) || metricOptions[0];

  // Calculate maximum value for chart scaling
  const maxMetricVal = Math.max(1, ...dailyActivity.map((d) => d[chartMetric] || 0));

  // Filter activities
  const filteredActivities = recentActivities.filter((act) => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'LESSON') return act.type === 'LESSON_COMPLETED';
    if (activityFilter === 'EXAM') return act.type === 'EXAM_COMPLETED';
    if (activityFilter === 'DAILY') return act.type === 'DAILY_PRACTICE';
    if (activityFilter === 'VOCAB') return act.type === 'VOCAB_SAVED';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header & Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Trung tâm Tiến độ & Phân tích Năng lực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tiến độ học tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi bức tranh toàn diện về thời gian học, độ chính xác theo kỹ năng và lộ trình CEFR của bạn.
          </p>
        </div>

        {/* Time Period Filter Switcher */}
        <div className="inline-flex p-1 sm:p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200 shrink-0 self-start md:self-center shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: '7_days', label: '7 ngày qua' },
            { id: '30_days', label: '30 ngày' },
            { id: '90_days', label: '90 ngày' },
            { id: 'all_time', label: 'Toàn bộ' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap shrink-0 ${
                selectedPeriod === p.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 6 KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {/* Card 1: Completed Lessons */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bài học</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {kpiCards.completedLessons?.value || 0}
              <span className="text-xs text-slate-400 font-semibold ml-1">/ {kpiCards.completedLessons?.total || 180}</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              +{kpiCards.completedLessons?.periodValue || 0} bài trong kỳ
            </p>
          </div>
        </div>

        {/* Card 2: Practice Score */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Điểm làm bài</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-600">
              {kpiCards.practiceScore?.value || 0}
            </div>
            <p className="text-[11px] text-blue-600 font-bold mt-0.5">
              +{kpiCards.practiceScore?.periodValue || 0} điểm trong kỳ
            </p>
          </div>
        </div>

        {/* Card 3: Words Learned */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Từ vựng</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {kpiCards.wordsLearned?.value || 0}
              <span className="text-xs text-slate-400 font-semibold ml-1">từ</span>
            </div>
            <p className="text-[11px] text-purple-600 font-bold mt-0.5">
              {kpiCards.wordsLearned?.mastered || 0} từ đã thuộc
            </p>
          </div>
        </div>

        {/* Card 4: Study Time */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Thời gian học</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {kpiCards.studyTime?.value || '0.0'}
              <span className="text-xs text-slate-400 font-semibold ml-1">giờ</span>
            </div>
            <p className="text-[11px] text-amber-700 font-bold mt-0.5">
              {kpiCards.studyTime?.periodMinutes || 0} phút trong kỳ
            </p>
          </div>
        </div>

        {/* Card 5: Streak Days */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chuỗi ngày</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-orange-600">
              {kpiCards.streak?.value || 0}
              <span className="text-xs text-slate-400 font-semibold ml-1">ngày 🔥</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Duy trì liên tục
            </p>
          </div>
        </div>

        {/* Card 6: Accuracy */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Độ chính xác</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600">
              {kpiCards.accuracy?.value || periodSummary.accuracyPercent || 0}
              <span className="text-xs text-slate-400 font-semibold ml-1">%</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Cấp độ {userLevel}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Daily Activity Chart & Metric Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Biểu đồ hoạt động theo ngày (Giờ Việt Nam)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Khoảng thời gian: <strong className="text-slate-600">{statsData.startDate}</strong> đến <strong className="text-slate-600">{statsData.endDate}</strong>
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {metricOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setChartMetric(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartMetric === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stat Strip */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-medium text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
          <div>
            <span className="text-slate-400">Tổng trong kỳ: </span>
            <strong className="text-slate-900 text-sm font-black">
              {periodSummary[chartMetric === 'studyMinutes' ? 'studyMinutes' : chartMetric === 'scoreGained' ? 'scoreGained' : chartMetric === 'correctCount' ? 'correctAnswers' : chartMetric === 'lessonsCompleted' ? 'lessonsCompleted' : 'questionsAnswered'] || 0}
            </strong> {currentMetricOpt.unit}
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-slate-400">Độ chính xác kỳ này: </span>
            <strong className="text-emerald-600 text-sm font-black">{periodSummary.accuracyPercent || 0}%</strong>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-slate-400">Thời gian học kỳ này: </span>
            <strong className="text-blue-600 text-sm font-black">{periodSummary.studyHours || '0.0'} giờ</strong>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-4">
          <div className="h-56 sm:h-64 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-6">
            {dailyActivity.map((day, idx) => {
              const val = day[chartMetric] || 0;
              const heightPercent = maxMetricVal > 0 ? Math.max(val > 0 ? 8 : 2, Math.round((val / maxMetricVal) * 100)) : 2;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayDetail(day)}
                  className="flex-1 min-w-[28px] sm:min-w-[36px] flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold whitespace-nowrap shadow-md z-20">
                    {val} {currentMetricOpt.unit} ({day.displayDate})
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        val > 0 ? currentMetricOpt.color : 'bg-transparent'
                      } group-hover:brightness-110`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day label below */}
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-2 text-center group-hover:text-blue-600">
                    <span className="block">{day.dayOfWeek}</span>
                    <span className="block text-[9px] text-slate-300 font-mono">{day.displayDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Heatmap Calendar (Lịch hoạt động học tập) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span>Lịch hoạt động học tập (Heatmap)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bấm vào bất kỳ ngày nào để xem chi tiết bài học, điểm số và bài thi đã hoàn thành trong ngày đó.
            </p>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Ít</span>
            <div className="w-3.5 h-3.5 rounded-md bg-slate-100" />
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-200" />
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-400" />
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-600" />
            <span>Nhiều</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-2 pt-2">
          {dailyActivity.map((day, idx) => {
            const intensityColors = [
              'bg-slate-100 border-slate-200/60 hover:border-slate-300', // 0
              'bg-emerald-100 border-emerald-200 text-emerald-800 hover:border-emerald-400', // 1
              'bg-emerald-300 border-emerald-400 text-emerald-900 hover:border-emerald-500', // 2
              'bg-emerald-500 border-emerald-600 text-white hover:border-emerald-700', // 3
              'bg-emerald-700 border-emerald-800 text-white hover:border-emerald-900', // 4
            ];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDayDetail(day)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold transition shadow-2xs hover:scale-105 active:scale-95 ${
                  intensityColors[day.intensity || 0]
                }`}
                title={`${day.date} (${day.dayOfWeek}): ${day.questionsCount} câu, ${day.studyMinutes} phút`}
              >
                <span>{day.displayDate.split('/')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal (when user clicks a day in chart or heatmap) */}
      {selectedDayDetail && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedDayDetail(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Chi tiết hoạt động</span>
                <h4 className="text-lg font-black text-slate-900">
                  {selectedDayDetail.dayOfWeek}, {selectedDayDetail.date}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">Số câu đã làm</span>
                <strong className="text-lg font-black text-slate-900">{selectedDayDetail.questionsCount}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-600 block">Số câu đúng</span>
                <strong className="text-lg font-black text-emerald-700">{selectedDayDetail.correctCount}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-600 block">Điểm làm bài</span>
                <strong className="text-lg font-black text-blue-700">+{selectedDayDetail.scoreGained}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-600 block">Thời gian học</span>
                <strong className="text-lg font-black text-amber-700">{selectedDayDetail.studyMinutes} phút</strong>
              </div>
            </div>

            {/* Completed lessons on that day */}
            {selectedDayDetail.details?.lessons?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bài học hoàn thành:</span>
                <div className="space-y-1.5">
                  {selectedDayDetail.details.lessons.map((l, lIdx) => (
                    <div key={lIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                      <span>{l.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px]">{l.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed exams on that day */}
            {selectedDayDetail.details?.exams?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bài kiểm tra nộp:</span>
                <div className="space-y-1.5">
                  {selectedDayDetail.details.exams.map((ex, eIdx) => (
                    <div key={eIdx} className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between">
                      <span>{ex.title}</span>
                      <span className="font-bold text-blue-700">{ex.score} / 10.0 đ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedDayDetail.hasActivity && (
              <div className="text-center py-4 text-xs text-slate-400 font-medium">
                Ngày này chưa ghi nhận hoạt động học tập nào.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 7 Skills Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Độ chính xác theo 7 Kỹ năng cốt lõi</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu được tính toán trung thực từ toàn bộ câu hỏi luyện tập hằng ngày và bài kiểm tra đã làm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Skill 1: Vocabulary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span>Từ vựng (Vocabulary)</span>
              </span>
              {skillMetrics.vocabulary?.hasData ? (
                <span className="text-xs font-black text-blue-600">{skillMetrics.vocabulary.accuracyPercent}%</span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Chưa đủ dữ liệu</span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${skillMetrics.vocabulary?.accuracyPercent || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Đã làm: <strong>{skillMetrics.vocabulary?.totalQuestions || 0}</strong> câu</span>
              <span>Đúng: <strong>{skillMetrics.vocabulary?.correctCount || 0}</strong></span>
            </div>
          </div>

          {/* Skill 2: Grammar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Ngữ pháp (Grammar)</span>
              </span>
              {skillMetrics.grammar?.hasData ? (
                <span className="text-xs font-black text-emerald-600">{skillMetrics.grammar.accuracyPercent}%</span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Chưa đủ dữ liệu</span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${skillMetrics.grammar?.accuracyPercent || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Đã làm: <strong>{skillMetrics.grammar?.totalQuestions || 0}</strong> câu</span>
              <span>Đúng: <strong>{skillMetrics.grammar?.correctCount || 0}</strong></span>
            </div>
          </div>

          {/* Skill 3: Speaking */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-amber-600" />
                <span>Luyện nói & Giao tiếp</span>
              </span>
              {skillMetrics.speaking?.hasData ? (
                <span className="text-xs font-black text-amber-600">{skillMetrics.speaking.accuracyPercent}%</span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Chưa đủ dữ liệu</span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${skillMetrics.speaking?.accuracyPercent || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Đã làm: <strong>{skillMetrics.speaking?.totalQuestions || 0}</strong> câu</span>
              <span>Đúng: <strong>{skillMetrics.speaking?.correctCount || 0}</strong></span>
            </div>
          </div>

          {/* Skill 4: Listening */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-purple-600" />
                <span>Luyện nghe (Listening)</span>
              </span>
              {skillMetrics.listening?.hasData ? (
                <span className="text-xs font-black text-purple-600">{skillMetrics.listening.accuracyPercent}%</span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Chưa đủ dữ liệu</span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${skillMetrics.listening?.accuracyPercent || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Đã làm: <strong>{skillMetrics.listening?.totalQuestions || 0}</strong> câu</span>
              <span>Đúng: <strong>{skillMetrics.listening?.correctCount || 0}</strong></span>
            </div>
          </div>

          {/* Skill 5: Reading */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-rose-600" />
                <span>Đọc hiểu (Reading)</span>
              </span>
              {skillMetrics.reading?.hasData ? (
                <span className="text-xs font-black text-rose-600">{skillMetrics.reading.accuracyPercent}%</span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Chưa đủ dữ liệu</span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${skillMetrics.reading?.accuracyPercent || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Đã làm: <strong>{skillMetrics.reading?.totalQuestions || 0}</strong> câu</span>
              <span>Đúng: <strong>{skillMetrics.reading?.correctCount || 0}</strong></span>
            </div>
          </div>

          {/* Skill 6: Sentence Reordering */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-cyan-600" />
                <span>Sắp xếp câu & Cấu trúc</span>
              </span>
              {skillMetrics.sentenceBuilding?.hasData ? (
                <span className="text-xs font-black text-cyan-600">{skillMetrics.sentenceBuilding.accuracyPercent}%</span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Chưa đủ dữ liệu</span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                style={{ width: `${skillMetrics.sentenceBuilding?.accuracyPercent || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Đã làm: <strong>{skillMetrics.sentenceBuilding?.totalQuestions || 0}</strong> câu</span>
              <span>Đúng: <strong>{skillMetrics.sentenceBuilding?.correctCount || 0}</strong></span>
            </div>
          </div>

          {/* Skill 7: Proficiency Exam Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span>Bài kiểm tra năng lực (Proficiency Exam)</span>
              </span>
              <Link
                to="/exam"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Vào phòng thi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {skillMetrics.exam?.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-white shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Số lượt thi</span>
                  <strong className="text-sm font-black text-slate-900">{skillMetrics.exam.totalAttempts} lượt</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Điểm trung bình</span>
                  <strong className="text-sm font-black text-blue-600">{skillMetrics.exam.averageScore} / 10.0</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Điểm cao nhất</span>
                  <strong className="text-sm font-black text-emerald-600">{skillMetrics.exam.highestScore} / 10.0</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tỷ lệ đạt (≥5đ)</span>
                  <strong className="text-sm font-black text-purple-600">{skillMetrics.exam.passRate}%</strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Bạn chưa hoàn thành bài kiểm tra nào. Hãy bấm "Vào phòng thi" để thử sức với đề thi 40 câu ngẫu nhiên.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6. CEFR Roadmap (A1 to C2) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Tiến độ theo Lộ trình Chuẩn CEFR (A1 - C2)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tỷ lệ hoàn thành được tính từ các bài học và bài kiểm tra thuộc từng cấp độ tương ứng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cefrRoadmap.map((lvl) => {
            const isCompleted = lvl.status === 'COMPLETED';
            const isInProgress = lvl.status === 'IN_PROGRESS';

            return (
              <div
                key={lvl.level}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : isInProgress
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : 'bg-slate-50/50 border-slate-200/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">{lvl.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? 'Hoàn thành' : isInProgress ? 'Đang học' : 'Chưa bắt đầu'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Tiến độ bài học</span>
                    <span>{lvl.completedLessons} / {lvl.totalLessons} ({lvl.progressPercent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${lvl.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Điểm thi cấp độ:</span>
                  <strong className="text-slate-900 font-bold">
                    {lvl.averageExamScore !== null ? `${lvl.averageExamScore}/10.0 đ` : 'Chưa thi'}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Recent Chronological Activities Feed */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span>Nhật ký hoạt động học tập gần đây</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ghi nhận theo thời gian thực mỗi khi bạn hoàn thành bài học, làm bài thi hoặc lưu từ vựng.
            </p>
          </div>

          {/* Activity Type Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'LESSON', label: 'Bài học' },
              { id: 'EXAM', label: 'Bài thi' },
              { id: 'DAILY', label: 'Luyện tập' },
              { id: 'VOCAB', label: 'Từ vựng' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActivityFilter(f.id)}
                className={`px-3 py-1 rounded-lg transition ${
                  activityFilter === f.id
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => {
              const dateObj = new Date(act.timestamp);
              const timeFormatted = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

              return (
                <div key={act.id} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{act.title}</p>
                    <p className="text-xs text-slate-500">{act.subtitle}</p>
                    <span className="text-[10px] text-slate-400 font-mono block pt-0.5">{timeFormatted}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${act.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {act.badge}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            Không có hoạt động nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>
    </div>
  );
}
