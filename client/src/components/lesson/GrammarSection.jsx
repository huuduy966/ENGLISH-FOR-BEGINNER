import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function GrammarSection({ grammarPoints = [], onStepComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [allQuestionsDone, setAllQuestionsDone] = useState(false);

  const autoAdvanceTimerRef = useRef(null);

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsAdvancing(false);
  };

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, []);

  if (!grammarPoints || grammarPoints.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài giảng ngữ pháp cho bài học này.</p>
      </div>
    );
  }

  const gp = grammarPoints[0];
  const questionsList = gp.practiceQuestions || [];

  const handleSelectOption = (qId, option, correctAnswer) => {
    if (isAdvancing || showFeedback[qId]?.isCorrect) return;

    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
    const isMatch = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isMatch) {
      setShowFeedback((prev) => ({
        ...prev,
        [qId]: { isCorrect: true },
      }));

      // Trigger 1.5s Auto-advance
      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentQuestionIndex < questionsList.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // All grammar questions done!
          setAllQuestionsDone(true);
          if (onStepComplete) onStepComplete(true);
        }
      }, 1500);
    } else {
      // Wrong answer: DO NOT auto-advance. Allow retry!
      setShowFeedback((prev) => ({
        ...prev,
        [qId]: { isCorrect: false },
      }));
    }
  };

  const currentQ = questionsList[currentQuestionIndex];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* 1. Theory Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Lý thuyết Ngữ pháp cốt lõi
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {gp.title}
            </h3>
          </div>
        </div>

        {/* Explanation Text */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100/90 font-medium">
          {gp.explanation}
        </div>

        {/* Formula Highlight Box */}
        {gp.formula && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Cấu trúc / Công thức then chốt:</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-black text-emerald-950">
              {gp.formula}
            </p>
          </div>
        )}

        {/* Bilingual Examples list */}
        {gp.examples && gp.examples.length > 0 && (
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ví dụ ứng dụng mẫu:</span>
            </h4>
            <div className="grid gap-2.5">
              {gp.examples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-blue-900 font-mono">
                      {ex.en}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {ex.vi}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(ex.en)}
                    className="self-start sm:self-auto p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Phát âm</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Mistakes Notice Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Lỗi thường gặp cần tránh (Common Mistakes):</span>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
            Hãy chú ý sự hòa hợp giữa chủ ngữ và động từ, không quên chia động từ theo ngôi số ít hoặc thêm đuôi phù hợp theo thì.
          </p>
        </div>
      </div>

      {/* 2. Interactive Practice Questions with 1.5s Auto-Advance */}
      {questionsList.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-lg text-slate-900">
                  Câu hỏi vận dụng ({currentQuestionIndex + 1} / {questionsList.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Trả lời đúng sẽ tự động chuyển sang câu tiếp theo sau 1,5 giây
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Đạt: <strong className="text-emerald-600">{Object.values(showFeedback).filter(f => f.isCorrect).length}</strong> / {questionsList.length}
            </div>
          </div>

          {allQuestionsDone ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-xl font-bold text-emerald-950">
                Xuất sắc! Bạn đã hoàn thành toàn bộ bài tập ngữ pháp.
              </h4>
              <p className="text-xs text-emerald-800">
                Bạn đã sẵn sàng để tiếp tục sang Bước 4 (Luyện nghe).
              </p>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentQ.options && currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === opt;
                  const feedback = showFeedback[currentQ.id];
                  const isChecked = !!feedback;

                  let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';
                  if (isChecked) {
                    if (opt.toLowerCase() === currentQ.correctAnswer.toLowerCase()) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20 font-bold';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt, currentQ.correctAnswer)}
                      disabled={isAdvancing || feedback?.isCorrect}
                      className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isChecked && opt.toLowerCase() === currentQ.correctAnswer.toLowerCase() && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isChecked && isSelected && !feedback?.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Auto-advance banner */}
              {showFeedback[currentQ.id] && (
                <div
                  className={`p-4 rounded-xl border text-xs animate-fade-in space-y-1 ${
                    showFeedback[currentQ.id].isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                    {showFeedback[currentQ.id].isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Đang tự động chuyển câu tiếp theo sau 1,5 giây...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Chưa chính xác. Bạn hãy bấm chọn lại phương án đúng.</span>
                      </>
                    )}
                  </p>
                  {currentQ.explanation && (
                    <p className="text-slate-600 pt-0.5 leading-relaxed">
                      💡 <strong>Giải thích:</strong> {currentQ.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
