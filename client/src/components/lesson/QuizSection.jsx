import React, { useState } from 'react';
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
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);

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

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/quiz/${lessonId}/submit`, { answers });
      setQuizResult(res.data);
      if (res.data.passed) {
        if (onQuizPassed) onQuizPassed();
        if (user && res.data.xpGained) {
          updateUser({ xp: (user.xp || 0) + res.data.xpGained });
        }
      }
    } catch (err) {
      alert('Có lỗi khi nộp bài quiz. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Result screen
  if (quizResult) {
    const wrongQuestions = (quizResult.review || []).filter((r) => !r.isCorrect);
    const displayedReview = filterWrongOnly ? wrongQuestions : (quizResult.review || []);

    return (
      <div className="w-full space-y-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-inner ${
              quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {quizResult.passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {quizResult.passed ? '🎉 Hoàn thành xuất sắc bài học!' : 'Chưa đạt điểm qua môn'}
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
              {quizResult.message}
            </p>
          </div>

          {/* Score card metrics */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 shadow-2xs">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Số câu đúng</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">
                {quizResult.score} / {quizResult.total}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Điểm số</p>
              <p
                className={`text-2xl font-black mt-0.5 ${
                  quizResult.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {quizResult.percentage}%
              </p>
            </div>
            {quizResult.xpGained > 0 && (
              <>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Thưởng XP</p>
                  <p className="text-2xl font-black text-amber-500 flex items-center gap-1 mt-0.5">
                    <Star className="w-5 h-5 fill-amber-500" />
                    +{quizResult.xpGained} XP
                  </p>
                </div>
              </>
            )}
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

  // Quiz Taking Screen
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
              Cần đạt tối thiểu 70%
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
            const isAnswered = !!answers[q.id];

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Câu hỏi trắc nghiệm
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options && currentQ.options.map((opt, idx) => {
            const isSelected = answers[currentQ.id] === opt;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt)}
                className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{opt}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

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
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
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
