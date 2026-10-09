import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, Award, Play, Clock, FileText } from 'lucide-react';

export default function TodaysLearningCard({ packageData }) {
  const navigate = useNavigate();

  if (!packageData) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 shadow-md shadow-blue-500/15">
      {/* Subtle decorative background circle */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Top Mini Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-wider">
              Today's Learning
            </span>
            <span className="text-xs text-blue-100 font-medium hidden sm:inline">
              • {packageData.lessonTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>~{packageData.estimatedMinutes || 15} phút</span>
          </div>
        </div>

        {/* Title row */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Hôm nay học gì?
          </h2>
          <p className="text-xs text-blue-100 sm:hidden">
            {packageData.lessonTitle}
          </p>
        </div>

        {/* Compact Content Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] text-blue-100 font-medium">Từ vựng</span>
            </div>
            <p className="text-xs sm:text-sm font-bold">{packageData.vocabCount} từ mới</p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[11px] text-blue-100 font-medium">Ngữ pháp</span>
            </div>
            <p className="text-xs sm:text-sm font-bold truncate">{packageData.grammarTitle}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Headphones className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-[11px] text-blue-100 font-medium">Luyện nghe</span>
            </div>
            <p className="text-xs sm:text-sm font-bold truncate">1 bài audio</p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Award className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-[11px] text-blue-100 font-medium">Thực hành</span>
            </div>
            <p className="text-xs sm:text-sm font-bold truncate">Bài tập & Quiz</p>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-1 flex items-center justify-between">
          <p className="text-[11px] text-blue-100/90 hidden sm:block">
            Mở rộng vốn tiếng Anh mỗi ngày từng bước nhỏ.
          </p>

          <button
            onClick={() => navigate(`/lessons/${packageData.lessonId}`)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-blue-700" />
            <span>BẮT ĐẦU NGAY (START)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
