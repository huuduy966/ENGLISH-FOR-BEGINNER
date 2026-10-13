import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Headphones,
  Award,
  Lock,
  Play,
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LessonsListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // CEFR Levels definition
  const CEFR_LEVELS = [
    { id: 'A1', name: 'A1 - Beginner', desc: 'Mới bắt đầu', color: 'blue', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200', activeBg: 'bg-blue-600 text-white shadow-blue-500/25' },
    { id: 'A2', name: 'A2 - Elementary', desc: 'Sơ cấp', color: 'cyan', badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200', activeBg: 'bg-cyan-600 text-white shadow-cyan-500/25' },
    { id: 'B1', name: 'B1 - Intermediate', desc: 'Trung cấp', color: 'emerald', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', activeBg: 'bg-emerald-600 text-white shadow-emerald-500/25' },
    { id: 'B2', name: 'B2 - Upper Int', desc: 'Trung cao cấp', color: 'amber', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200', activeBg: 'bg-amber-600 text-white shadow-amber-500/25' },
    { id: 'C1', name: 'C1 - Advanced', desc: 'Cao cấp', color: 'purple', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200', activeBg: 'bg-purple-600 text-white shadow-purple-500/25' },
    { id: 'C2', name: 'C2 - Proficiency', desc: 'Thành thạo', color: 'rose', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200', activeBg: 'bg-rose-600 text-white shadow-rose-500/25' },
  ];

  // URL / Initial State
  const validLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(searchParams.get('level'))
    ? searchParams.get('level')
    : (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(user?.level) ? user.level : 'A1');
  const [selectedLevel, setSelectedLevel] = useState(validLevel);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Data states
  const [lessons, setLessons] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [levelStats, setLevelStats] = useState({ totalInLevel: 30, completedInLevel: 0, learningInLevel: 0 });
  const [categoriesList, setCategoriesList] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState(['A1']);
  const [isCurrentLevelLocked, setIsCurrentLevelLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const topRef = useRef(null);

  // Fetch lessons when filters or page change
  const fetchLessons = () => {
    setLoading(true);
    setError(null);

    const params = {
      level: selectedLevel,
      page: currentPage,
      limit: 12,
    };
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (searchKeyword.trim()) params.search = searchKeyword.trim();
    if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

    api.get('/lessons', { params })
      .then((res) => {
        setLessons(res.data.lessons || []);
        if (res.data.pagination) setPagination(res.data.pagination);
        if (res.data.stats) setLevelStats(res.data.stats);
        if (res.data.categories) setCategoriesList(res.data.categories);
        if (res.data.unlockedLevels) setUnlockedLevels(res.data.unlockedLevels);
        setIsCurrentLevelLocked(Boolean(res.data.isCurrentLevelLocked));
      })
      .catch((err) => {
        console.error('Fetch lessons error:', err);
        setError('Không thể tải danh sách bài học. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, [selectedLevel, selectedCategory, selectedStatus, currentPage]);

  // Handle Level Change
  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
    setSelectedCategory('All');
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('level', levelId);
      next.delete('category');
      next.set('page', '1');
      return next;
    });
  };

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLessons();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      next.delete('category');
      next.delete('status');
      next.set('page', '1');
      return next;
    });
    fetchLessons();
  };

  // Change page with smooth scroll
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', newPage.toString());
      return next;
    });
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const completedPercent = levelStats.totalInLevel > 0
    ? Math.round((levelStats.completedInLevel / levelStats.totalInLevel) * 100)
    : 0;

  return (
    <div ref={topRef} className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header Title & User Level Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Chương trình chuẩn CEFR (A1 - C2)
            </span>
            {user?.level && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:inline-block">
                Trình độ đề xuất: <strong className="text-blue-600">{user.level}</strong>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kho Bài Học Toàn Diện (Curriculum)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
          </p>
        </div>

        {/* Quick exam CTA if user wants to test proficiency */}
        <Link
          to="/exam"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 font-bold text-xs transition shadow-xs shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Bài kiểm tra năng lực (40 câu)</span>
        </Link>
      </div>

      {/* 1. Level Filter Tabs (6 CEFR Levels: A1 - C2) */}
      <div className="bg-white p-2 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            const isUserLevel = user?.level === lvl.id;
            const isLevelLocked = !unlockedLevels.includes(lvl.id) && user?.role !== 'ADMIN';

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelChange(lvl.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? `${lvl.activeBg} shadow-md`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 bg-transparent'
                }`}
              >
                <span>{lvl.name}</span>
                {isLevelLocked && (
                  <Lock className="w-3 h-3 text-slate-400" title="Cấp độ này đang bị khóa" />
                )}
                {isUserLevel && !isSelected && !isLevelLocked && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" title="Trình độ hiện tại của bạn" />
                )}
                {isUserLevel && isSelected && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/25 text-white uppercase tracking-wider font-extrabold hidden md:inline">
                    Hiện tại
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Level KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Lessons */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng số bài ({selectedLevel})
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {levelStats.totalInLevel} bài học
            </p>
          </div>
        </div>

        {/* Completed Lessons with Level Progress Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Đã hoàn thành
              </span>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {completedPercent}%
            </span>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {levelStats.completedInLevel} / {levelStats.totalInLevel}
              </span>
              <span className="text-xs text-slate-400 font-medium">bài đạt chuẩn</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Learning In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Đang tiếp tục học
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {levelStats.learningInLevel} bài dở dang
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm bài học theo tiêu đề hoặc mô tả..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword('');
                setCurrentPage(1);
                fetchLessons();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Dropdowns Filter */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 pl-3 pr-8 rounded-xl border border-slate-200 outline-none cursor-pointer transition"
            >
              <option value="All">Tất cả chủ đề</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 pl-3 pr-8 rounded-xl border border-slate-200 outline-none cursor-pointer transition"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="learning">Đang học</option>
              <option value="not_started">Chưa học</option>
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters button */}
          {(searchKeyword || selectedCategory !== 'All' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Level Locked Alert Banner */}
      {isCurrentLevelLocked && !loading && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-black text-sm text-amber-950">
                Toàn bộ bài học cấp độ {selectedLevel} đang bị khóa
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Theo lộ trình chuẩn CEFR, bạn cần hoàn thành tất cả 30 bài học của cấp độ trước đó (hoặc đạt cấp độ {selectedLevel} trong bài kiểm tra đầu vào) để mở khóa khung chương trình này.
              </p>
            </div>
          </div>
          <Link
            to="/placement-test"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm shrink-0 self-start sm:self-auto text-center"
          >
            Làm bài test đầu vào
          </Link>
        </div>
      )}

      {/* 4. Main Lessons Grid / Skeletons / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-16 h-5 bg-slate-200 rounded-md" />
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-3/4 h-6 bg-slate-200 rounded-lg" />
              <div className="w-full h-12 bg-slate-100 rounded-lg" />
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-slate-100 rounded-md" />
                <div className="w-16 h-6 bg-slate-100 rounded-md" />
              </div>
              <div className="w-full h-10 bg-slate-200 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-rose-200 shadow-xs space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-slate-800 font-bold">{error}</p>
          <button
            onClick={fetchLessons}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Không tìm thấy bài học nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc chủ đề và trạng thái để hiển thị bài học.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const isDone = lesson.completed;
            const isLocked = lesson.isLocked;
            const isCurrentActive = lesson.isCurrentActive;

            return (
              <div
                key={lesson.id}
                className={`rounded-3xl p-6 transition-all flex flex-col justify-between ${
                  isLocked
                    ? 'bg-slate-50/80 border border-dashed border-slate-300 opacity-80'
                    : isCurrentActive
                    ? 'bg-white border-2 border-blue-500 shadow-md ring-4 ring-blue-500/10'
                    : isDone
                    ? 'bg-white border border-emerald-200 shadow-xs hover:shadow-md'
                    : 'bg-white border border-slate-200/80 shadow-xs hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar: Order & Badges */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          isLocked
                            ? 'bg-slate-200 text-slate-600'
                            : isCurrentActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        Bài {lesson.orderNumber}
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                        {lesson.level}
                      </span>
                    </div>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã hoàn thành</span>
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{lesson.isLevelLocked ? `Khóa cấp độ ${lesson.level}` : `Cần làm Bài ${lesson.orderNumber - 1}`}</span>
                      </span>
                    ) : isCurrentActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                        <span>Đang học</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} phút
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <h3
                    className={`font-bold text-lg leading-snug transition ${
                      isLocked ? 'text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {lesson.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-3">
                    {lesson.category}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-5">
                    {lesson.description}
                  </p>

                  {/* Micro Module Counts */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 mb-6">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-blue-500" />
                      <span>{lesson.counts?.vocabularies || 10} từ vựng</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-500" />
                      <span>Ngữ pháp</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 flex items-center gap-1.5">
                      <Headphones className="w-3 h-3 text-purple-500" />
                      <span>Nghe & Nói</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>Quiz</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Progress & Action Button */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Tiến độ bài</span>
                      <span>{lesson.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? 'bg-emerald-500' : isLocked ? 'bg-slate-300' : 'bg-blue-600'
                        }`}
                        style={{ width: `${lesson.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.isLevelLocked ? `Cấp độ ${lesson.level} đang bị khóa` : `Chưa mở khóa (Bài ${lesson.orderNumber - 1})`}</span>
                    </div>
                  ) : (
                    <Link
                      to={`/lessons/${lesson.id}`}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs ${
                        isDone
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCurrentActive
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 ring-2 ring-blue-500/20'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isDone ? 'Ôn tập lại bài này' : isCurrentActive ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination Controls */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị bài <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> -{' '}
            <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> trong tổng số{' '}
            <strong>{pagination.total}</strong> bài của cấp độ <strong>{selectedLevel}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                currentPage <= 1
                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trước</span>
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                currentPage >= pagination.totalPages
                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
