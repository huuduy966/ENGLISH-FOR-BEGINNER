import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../services/api';

export default function LessonsListPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lessons')
      .then((res) => setLessons(res.data.lessons || []))
      .catch((err) => console.error('Fetch lessons error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải danh sách bài học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Lộ trình Tuần tự ({lessons.length} Bài học)
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Danh sách Bài học (Lessons)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Học tập theo thứ tự từng bước: hoàn thành bài học và bài kiểm tra để tự động mở khóa các bài tiếp theo.
        </p>
      </div>

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
                  ? 'bg-slate-50/70 border border-dashed border-slate-300 opacity-75'
                  : isCurrentActive
                  ? 'bg-white border-2 border-blue-500 shadow-md ring-4 ring-blue-500/10'
                  : 'bg-white border border-slate-200/80 shadow-sm hover:shadow-lg'
              }`}
            >
              <div>
                {/* Header status bar */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : isCurrentActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    Bài {lesson.orderNumber}
                  </span>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã hoàn thành</span>
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cần làm Bài {lesson.orderNumber - 1}</span>
                    </span>
                  ) : isCurrentActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                      <span>Đang học</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.durationMinutes} phút
                    </span>
                  )}
                </div>

                <h3
                  className={`font-bold text-xl transition ${
                    isLocked ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-600'
                  }`}
                >
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 mb-4">
                  {lesson.category}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6">
                  {lesson.description}
                </p>

                {/* Micro Counts */}
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 mb-6">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>{lesson.counts?.vocabularies || 8} từ vựng</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Ngữ pháp</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-purple-500" />
                    <span>Nghe & Nói</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quiz</span>
                  </span>
                </div>
              </div>

              {/* Progress and button */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Tiến độ</span>
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
                  <div className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chưa mở khóa (Học tuần tự)</span>
                  </div>
                ) : (
                  <Link
                    to={`/lessons/${lesson.id}`}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                      isDone
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : isCurrentActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 ring-2 ring-blue-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    }`}
                  >
                    <span>{isDone ? 'Ôn tập lại bài này' : 'Bắt đầu học'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
