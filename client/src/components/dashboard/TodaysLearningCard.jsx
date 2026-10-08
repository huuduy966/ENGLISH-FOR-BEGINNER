import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Headphones, MessageSquare, Play, Clock, ArrowRight } from 'lucide-react';

export default function TodaysLearningCard({ packageData }) {
  const navigate = useNavigate();

  if (!packageData) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/20">
      {/* Decorative background circle */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Today's Learning Package</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
            <Clock className="w-4 h-4" />
            <span>~{packageData.estimatedMinutes || 15} phút</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Hôm nay học gì?
        </h2>
        <p className="mt-1 text-sm text-blue-100 font-medium">
          {packageData.lessonTitle}
        </p>

        {/* Content Breakdown Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="text-xs text-blue-100 font-medium">Từ vựng</span>
            </div>
            <p className="text-lg font-bold">{packageData.vocabCount} từ mới</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-xs text-blue-100 font-medium">Ngữ pháp</span>
            </div>
            <p className="text-sm font-bold truncate">{packageData.grammarTitle}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Headphones className="w-4 h-4 text-purple-300" />
              <span className="text-xs text-blue-100 font-medium">Luyện nghe</span>
            </div>
            <p className="text-sm font-bold truncate">1 bài audio</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-rose-300" />
              <span className="text-xs text-blue-100 font-medium">Hội thoại</span>
            </div>
            <p className="text-sm font-bold truncate">1 tình huống</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-blue-100 hidden sm:block">
            Sẵn sàng mở rộng vốn tiếng Anh mỗi ngày từng bước nhỏ.
          </p>

          <button
            onClick={() => navigate(`/lessons/${packageData.lessonId}`)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-blue-700 font-extrabold text-sm hover:bg-blue-50 transition shadow-lg shadow-black/10 flex items-center justify-center gap-2.5 active:scale-95"
          >
            <Play className="w-4 h-4 fill-blue-700" />
            <span>BẮT ĐẦU NGAY (START)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
