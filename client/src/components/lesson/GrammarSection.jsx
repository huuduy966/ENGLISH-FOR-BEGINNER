import React, { useState } from 'react';
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
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function GrammarSection({ grammarPoints = [] }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});

  if (!grammarPoints || grammarPoints.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài giảng ngữ pháp cho bài học này.</p>
      </div>
    );
  }

  const handleSelectOption = (qId, option) => {
    if (showFeedback[qId]) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleCheckAnswer = (qId, correctAnswer) => {
    const selected = userAnswers[qId];
    if (!selected) return;

    const isMatch = selected.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setShowFeedback((prev) => ({
      ...prev,
      [qId]: { isCorrect: isMatch },
    }));
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {grammarPoints.map((gp, idx) => {
        const questionsList = gp.practiceQuestions || [];

        return (
          <div key={idx} className="space-y-6">
            {/* Theory Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Chủ điểm ngữ pháp #{idx + 1}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {gp.title}
                  </h3>
                </div>
              </div>

              {/* Explanation Text */}
              <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100/90 font-medium">
                {gp.explanation}
              </div>

              {/* Formula Highlight Box */}
              {gp.formula && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    <span>Cấu trúc / Công thức trọng tâm</span>
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
                    <span>Ví dụ minh họa thực tế:</span>
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
                          title="Nghe phát âm câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Nghe câu</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Practice Questions Box */}
            {questionsList.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900">
                        Thực hành Ngữ pháp ngay ({questionsList.length} câu)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Chọn câu trả lời chính xác để củng cố quy tắc ngữ pháp vừa học
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions Grid */}
                <div className="space-y-6">
                  {questionsList.map((q, qIndex) => {
                    const selected = userAnswers[q.id];
                    const feedback = showFeedback[q.id];
                    const isChecked = !!feedback;
                    const isCorrect = feedback?.isCorrect;

                    return (
                      <div
                        key={q.id || qIndex}
                        className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {qIndex + 1}
                          </span>
                          <p className="font-bold text-sm text-slate-800 leading-snug">
                            {q.question}
                          </p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options && q.options.map((opt, optIdx) => {
                            const isOptionSelected = selected === opt;
                            let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

                            if (isChecked) {
                              if (opt.toLowerCase() === q.correctAnswer.toLowerCase()) {
                                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                              } else if (isOptionSelected) {
                                btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20';
                              }
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.id, opt)}
                                disabled={isChecked}
                                className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isChecked && opt.toLowerCase() === q.correctAnswer.toLowerCase() && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                                {isChecked && isOptionSelected && opt.toLowerCase() !== q.correctAnswer.toLowerCase() && (
                                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Action check button */}
                        {!isChecked && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleCheckAnswer(q.id, q.correctAnswer)}
                              disabled={!selected}
                              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition disabled:opacity-40 shadow-xs"
                            >
                              Kiểm tra câu này
                            </button>
                          </div>
                        )}

                        {/* Explanation feedback */}
                        {isChecked && (
                          <div
                            className={`p-4 rounded-xl border text-xs animate-fade-in space-y-1 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-rose-50 border-rose-200 text-rose-900'
                            }`}
                          >
                            <p className="font-bold flex items-center gap-1.5">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Chính xác!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-rose-500" />
                                  <span>Chưa chính xác. Đáp án đúng là: "{q.correctAnswer}".</span>
                                </>
                              )}
                            </p>
                            {q.explanation && (
                              <p className="text-slate-600 pt-0.5">
                                💡 {q.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
