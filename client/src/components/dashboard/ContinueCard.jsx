import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function ContinueCard({ continueLesson }) {
  const navigate = useNavigate();

  if (!continueLesson) return null;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Tiếp tục học dở dang
        </span>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Bài {continueLesson.orderNumber}
        </span>
      </div>

      <h3 className="font-bold text-lg text-slate-900 mb-1">
        {continueLesson.title}
      </h3>
      <p className="text-xs text-slate-500 mb-4">{continueLesson.category}</p>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Tiến độ bài học</span>
          <span>{continueLesson.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${continueLesson.progress}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate(`/lessons/${continueLesson.id}`)}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition"
      >
        <PlayCircle className="w-4 h-4" />
        <span>Tiếp tục học ngay</span>
      </button>
    </div>
  );
}
