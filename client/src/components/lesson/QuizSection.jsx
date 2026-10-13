import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Star,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizSection({ lessonId, quizzes = [], onQuizPassed }) {
  const { updateUser, user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionFeedback, setQuestionFeedback] = useState({}); // { [qId]: { isCorrect, selectedOption } }
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);

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

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài quiz cho bài học này.</p>
      </div>
    );
  }

  const currentQ = quizzes[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / quizzes.length) * 100);

  // Submit all collected answers to backend
  const handleSubmitQuiz = async (latestAnswers = answers) => {
    setSubmitting(true);
    clearAutoAdvanceTimer();
    try {
      const res = await api.post(`/quiz/${lessonId}/submit`, { answers: latestAnswers });
      setQuizResult(res.data);
      if (res.data.passed) {
        if (onQuizPassed) onQuizPassed();
      }
    } catch (err) {
      alert('Có lỗi khi nộp bài quiz. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Option selection with strict 1.5s Auto-Advance
  const handleSelectOption = (qId, option) => {
    if (isAdvancing || questionFeedback[qId]?.isCorrect) return;

    const correctAns = currentQ.correctAnswer || '';
    const isMatch = option.trim().toLowerCase() === correctAns.trim().toLowerCase();

    const updatedAnswers = { ...answers, [qId]: option };
    setAnswers(updatedAnswers);

    if (isMatch) {
      setQuestionFeedback((prev) => ({
        ...prev,
        [qId]: { isCorrect: true, selectedOption: option },
      }));

      // Trigger 1.5s Auto-Advance
      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentIndex < quizzes.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Last quiz question answered correctly -> submit automatically!
          handleSubmitQuiz(updatedAnswers);
        }
      }, 1500);
    } else {
      // Wrong answer: DO NOT auto-advance. Highlight red, allow retry!
      setQuestionFeedback((prev) => ({
        ...prev,
        [qId]: { isCorrect: false, selectedOption: option },
      }));
    }
  };

  const handleNext = () => {
    clearAutoAdvanceTimer();
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    clearAutoAdvanceTimer();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Result screen
  if (quizResult) {
    const wrongQuestions = (quizResult.review || []).filter((r) => !r.isCorrect);
    const displayedReview = filterWrongOnly ? wrongQuestions : (quizResult.review || []);

    return (
      <div className="w-full space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-slate-200 shadow-xl text-center space-y-5 sm:space-y-6">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner ${
              quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {quizResult.passed ? <Award className="w-8 h-8 sm:w-10 sm:h-10" /> : <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />}
          </div>

          <div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900">
              {quizResult.passed ? '🎉 Hoàn thành xuất sắc bài học!' : 'Chưa đạt 80% điểm qua môn'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
              {quizResult.message}
            </p>
          </div>

          {/* Score card metrics */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 shadow-2xs">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Số câu đúng</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
                {quizResult.score} / {quizResult.total}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Điểm số</p>
              <p
                className={`text-xl sm:text-2xl font-black mt-0.5 ${
                  quizResult.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {quizResult.percentage}%
              </p>
            </div>
          </div>

          {/* Review items container with filter toggle */}
          <div className="text-left space-y-4 pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chi tiết đánh giá từng câu hỏi ({displayedReview.length} câu):
              </h4>

              {wrongQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterWrongOnly((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto ${
                    filterWrongOnly
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{filterWrongOnly ? 'Hiển thị tất cả câu' : `Chỉ xem ${wrongQuestions.length} câu làm sai`}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {displayedReview.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                    item.isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1.5 flex-1">
                      <p className="font-extrabold text-sm text-slate-900 leading-snug">
                        {item.question}
                      </p>
                      <p className="text-xs">
                        Bạn đã chọn: <strong className="font-semibold">{item.selectedAnswer || '(Bỏ trống)'}</strong>
                      </p>
                      {!item.isCorrect && (
                        <p className="text-xs text-emerald-800 font-bold">
                          Đáp án đúng: <span className="underline">{item.correctAnswer}</span>
                        </p>
                      )}
                      {item.explanation && (
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed border-t border-slate-200/50">
                          💡 <strong>Giải thích:</strong> {item.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action restart */}
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setQuizResult(null);
                setAnswers({});
                setQuestionFeedback({});
                setCurrentIndex(0);
                setFilterWrongOnly(false);
              }}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md shadow-blue-500/25 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại bài Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking Screen with 1.5s Auto-Advance
  const activeFeedback = questionFeedback[currentQ.id];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800">
              Câu {currentIndex + 1} / {quizzes.length}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Ngưỡng đạt tối thiểu 80%
            </span>
          </div>

          <div className="text-slate-500 font-bold">
            Đã trả lời: <strong className="text-blue-600">{answeredCount}</strong> / {quizzes.length}
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Selector Dots Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {quizzes.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const qFb = questionFeedback[q.id];

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => {
                  clearAutoAdvanceTimer();
                  setCurrentIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : qFb?.isCorrect
                    ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                    : qFb && !qFb.isCorrect
                    ? 'bg-rose-100 text-rose-800'
                    : answers[q.id]
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card - Compact */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Câu hỏi kiểm tra cuối bài
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options && currentQ.options.map((opt, idx) => {
            const isSelected = (activeFeedback?.selectedOption === opt) || (answers[currentQ.id] === opt);
            let optStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

            if (activeFeedback) {
              if (activeFeedback.isCorrect && opt === activeFeedback.selectedOption) {
                optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
              } else if (!activeFeedback.isCorrect && isSelected) {
                optStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20 font-bold';
              }
            } else if (isSelected) {
              optStyle = 'bg-blue-50/90 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt)}
                disabled={isAdvancing || activeFeedback?.isCorrect}
                className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between ${optStyle}`}
              >
                <span>{opt}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                    activeFeedback?.isCorrect && opt === activeFeedback.selectedOption
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : !activeFeedback?.isCorrect && isSelected
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-transparent'
                  }`}
                >
                  {activeFeedback?.isCorrect && opt === activeFeedback.selectedOption ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : !activeFeedback?.isCorrect && isSelected ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* 1.5s Auto-advance feedback banner */}
        {activeFeedback && (
          <div
            className={`p-4 rounded-xl border text-xs animate-fade-in space-y-1 ${
              activeFeedback.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <p className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
              {activeFeedback.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>🎉 Chính xác!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Chưa chính xác. Bạn hãy bấm chọn lại phương án đúng.</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Câu trước
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < quizzes.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmitQuiz(answers)}
                disabled={submitting || answeredCount === 0}
                className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
              >
                {submitting ? (
                  <span>Đang chấm điểm...</span>
                ) : (
                  <>
                    <span>Nộp bài & Chấm điểm</span>
                    <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
