import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Volume2,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  Layers,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function GrammarSection({ grammarPoints = [], onStepComplete }) {
  // Track open/collapsed cards. By default, open the first grammar point.
  const [expandedIndices, setExpandedIndices] = useState(() => new Set([0]));
  const [isCompleted, setIsCompleted] = useState(false);

  if (!grammarPoints || grammarPoints.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài giảng ngữ pháp cho bài học này.</p>
      </div>
    );
  }

  // Toggle single accordion card
  const toggleCard = (index) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Expand or Collapse All cards
  const allExpanded = expandedIndices.size === grammarPoints.length;
  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedIndices(new Set());
    } else {
      setExpandedIndices(new Set(grammarPoints.map((_, i) => i)));
    }
  };

  // Complete Grammar step
  const handleConfirmComplete = () => {
    setIsCompleted(true);
    if (onStepComplete) {
      onStepComplete(true);
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Lý thuyết Trọng tâm
              </span>
              <span className="text-xs text-slate-400 font-bold">
                • {grammarPoints.length} điểm ngữ pháp
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              Kiến thức & Quy tắc Ngữ pháp Bài học
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleToggleAll}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
          </button>
        </div>
      </div>

      {/* 2. List of Multi-Point Grammar Cards (Accordion) */}
      <div className="space-y-3">
        {grammarPoints.map((gp, idx) => {
          const isExpanded = expandedIndices.has(idx);

          // Parse examples if stored as JSON string
          let examplesList = [];
          if (gp.examples) {
            try {
              const parsed = typeof gp.examples === 'string' ? JSON.parse(gp.examples) : gp.examples;
              if (Array.isArray(parsed)) {
                examplesList = parsed;
              } else if (parsed && Array.isArray(parsed.list)) {
                examplesList = parsed.list;
              }
            } catch {
              examplesList = [];
            }
          }

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isExpanded ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {/* Accordion Card Header */}
              <button
                type="button"
                onClick={() => toggleCard(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left bg-white hover:bg-slate-50/60 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                      {gp.title}
                    </h4>
                    {gp.formula && (
                      <p className="font-mono text-xs text-blue-700 font-bold mt-0.5 line-clamp-1">
                        {gp.formula}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                    {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Card Content (Collapsible) */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-slate-100 space-y-4 animate-fade-in">
                  {/* Formula Box */}
                  {gp.formula && (
                    <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-blue-50/80 border border-blue-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-800 uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                        <span>Cấu trúc / Công thức:</span>
                      </div>
                      <p className="font-mono text-sm sm:text-base font-black text-blue-950 tracking-wide">
                        {gp.formula}
                      </p>
                    </div>
                  )}

                  {/* Explanation Section */}
                  {gp.explanation && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Cách dùng & Giải thích:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 font-medium">
                        {gp.explanation}
                      </p>
                    </div>
                  )}

                  {/* Bilingual Examples with Audio */}
                  {examplesList.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ví dụ minh họa thực tế:</span>
                      </div>

                      <div className="grid gap-2">
                        {examplesList.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-3 rounded-xl bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition"
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs sm:text-sm font-bold text-blue-900">
                                {ex.en}
                              </p>
                              <p className="text-xs text-slate-600 font-medium">
                                {ex.vi}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => speakText(ex.en)}
                              className="self-start sm:self-auto px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold shrink-0"
                              title="Nghe phát âm chuẩn"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Phát âm</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Mistakes / Notes Box */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lưu ý tránh nhầm lẫn & Lỗi thường gặp:</span>
                    </div>
                    <p className="text-xs text-amber-950/80 leading-relaxed font-medium">
                      Hãy luôn chú ý đến vị trí của chủ ngữ, chia động từ theo đúng ngôi và thì của câu. Tránh dịch từ theo kiểu từng chữ một (word-by-word) để câu văn giữ được sự tự nhiên chuẩn tiếng Anh.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Step Completion Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="space-y-0.5">
          <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Xác nhận hoàn thành phần lý thuyết Ngữ pháp</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {isCompleted
              ? '✅ Bạn đã xác nhận nắm vững lý thuyết. Hãy chuyển sang Bước 4 (Luyện nghe).'
              : 'Đọc kỹ các điểm ngữ pháp ở trên, sau đó nhấn xác nhận để mở khóa bước tiếp theo.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirmComplete}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
            isCompleted
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Đã hoàn thành lý thuyết</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Tôi đã hiểu các điểm ngữ pháp này</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
