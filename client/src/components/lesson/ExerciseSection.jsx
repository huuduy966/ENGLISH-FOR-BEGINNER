import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';

export default function ExerciseSection({ exercises = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [arrangedWords, setArrangedWords] = useState([]);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có bài tập cho bài học này.</p>
      </div>
    );
  }

  const current = exercises[currentIndex];
  const isChecked = !!showFeedback[currentIndex];
  const isCorrect = showFeedback[currentIndex]?.isCorrect;

  const handleSelectOption = (opt) => {
    if (isChecked) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const handleWordOrderClick = (word) => {
    if (isChecked) return;
    setArrangedWords((prev) => {
      const next = [...prev, word];
      setUserAnswers((u) => ({ ...u, [currentIndex]: next.join(' ') }));
      return next;
    });
  };

  const handleWordOrderReset = () => {
    if (isChecked) return;
    setArrangedWords([]);
    setUserAnswers((u) => ({ ...u, [currentIndex]: '' }));
  };

  const handleCheckAnswer = () => {
    const ans = (userAnswers[currentIndex] || '').trim().toLowerCase();
    const correct = current.correctAnswer.trim().toLowerCase();

    // Check match
    const correctResult = ans === correct;
    setShowFeedback((prev) => ({
      ...prev,
      [currentIndex]: {
        isCorrect: correctResult,
        explanation: current.explanation || '',
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setArrangedWords([]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setArrangedWords([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Progress tracker */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>Bài tập {currentIndex + 1} / {exercises.length}</span>
        <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full uppercase">
          {current.type.replace('_', ' ')}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
          {current.question}
        </h3>

        {/* 1. MULTIPLE CHOICE or FILL BLANK */}
        {(current.type === 'MULTIPLE_CHOICE' || current.type === 'FILL_BLANK') && (
          <div className="space-y-3">
            {current.options && current.options.map((opt, idx) => {
              const isSelected = userAnswers[currentIndex] === opt;
              let style = 'border-slate-200 hover:bg-slate-50 text-slate-800';

              if (isChecked) {
                if (opt.toLowerCase() === current.correctAnswer.toLowerCase()) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  style = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20';
                }
              } else if (isSelected) {
                style = 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isChecked}
                  className={`w-full text-left p-4 rounded-2xl border text-sm transition flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {isChecked && opt.toLowerCase() === current.correctAnswer.toLowerCase() && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {isChecked && isSelected && opt.toLowerCase() !== current.correctAnswer.toLowerCase() && (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. WORD ORDER */}
        {current.type === 'WORD_ORDER' && (
          <div className="space-y-4">
            <div className="min-h-16 p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center">
              {arrangedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Chạm vào các từ bên dưới theo đúng thứ tự để tạo thành câu...
                </span>
              ) : (
                arrangedWords.map((w, wIdx) => (
                  <span
                    key={wIdx}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm animate-fade-in"
                  >
                    {w}
                  </span>
                ))
              )}
            </div>

            {/* Word choices */}
            <div className="flex flex-wrap gap-2">
              {current.options && current.options.map((word, wIdx) => {
                const used = arrangedWords.includes(word);
                return (
                  <button
                    key={wIdx}
                    type="button"
                    onClick={() => handleWordOrderClick(word)}
                    disabled={used || isChecked}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                      used
                        ? 'opacity-30 bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-blue-400 text-slate-700 hover:bg-blue-50 shadow-sm'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleWordOrderReset}
              disabled={isChecked || arrangedWords.length === 0}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa làm lại câu</span>
            </button>
          </div>
        )}

        {/* 3. MATCHING */}
        {current.type === 'MATCHING' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Các cặp từ và nghĩa tương ứng:
            </p>
            {current.options && Array.isArray(current.options) && current.options.map((m, mIdx) => (
              <div
                key={mIdx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-sm font-semibold"
              >
                <span className="text-blue-700 font-bold">{m.left}</span>
                <span className="text-slate-400">─────</span>
                <span className="text-emerald-700">{m.right}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Alert */}
        {isChecked && (
          <div
            className={`p-4 rounded-2xl border text-sm animate-fade-in flex items-start gap-3 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {isCorrect ? 'Chính xác! Làm rất tốt 🎉' : `Chưa chính xác. Đáp án đúng: "${current.correctAnswer}"`}
              </p>
              {showFeedback[currentIndex]?.explanation && (
                <p className="text-xs mt-1 opacity-90">
                  💡 {showFeedback[currentIndex].explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-30"
          >
            Câu trước
          </button>

          {!isChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!userAnswers[currentIndex] && current.type !== 'MATCHING'}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-40"
            >
              Kiểm tra câu trả lời
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === exercises.length - 1}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-30 flex items-center gap-1.5"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
