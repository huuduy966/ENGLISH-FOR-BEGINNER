import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizSection({ lessonId, quizzes = [], onQuizPassed }) {
  const { updateUser, user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có bài quiz cho bài học này.</p>
      </div>
    );
  }

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
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-inner ${
              quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {quizResult.passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {quizResult.passed ? 'Hoàn thành xuất sắc bài học!' : 'Chưa đạt điểm qua môn'}
            </h3>
            <p className="text-sm text-slate-600 mt-2">{quizResult.message}</p>
          </div>

          {/* Score card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium">Số câu đúng</p>
              <p className="text-xl font-black text-slate-800">
                {quizResult.score} / {quizResult.total}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Điểm số</p>
              <p
                className={`text-xl font-black ${
                  quizResult.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {quizResult.percentage}%
              </p>
            </div>
            {quizResult.xpGained > 0 && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Thưởng XP</p>
                  <p className="text-xl font-black text-amber-500 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    +{quizResult.xpGained} XP
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Review items */}
          <div className="text-left space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chi tiết câu trả lời:
            </h4>
            {quizResult.review && quizResult.review.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs ${
                  item.isCorrect
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{item.question}</p>
                    <p>
                      Bạn chọn: <strong>{item.selectedAnswer || '(Chưa chọn)'}</strong>
                    </p>
                    {!item.isCorrect && (
                      <p className="text-emerald-700">
                        Đáp án đúng: <strong>{item.correctAnswer}</strong>
                      </p>
                    )}
                    {item.explanation && (
                      <p className="text-slate-500 italic mt-1">💡 {item.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setQuizResult(null);
                setAnswers({});
                setCurrentIndex(0);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quizzes[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / quizzes.length) * 100);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Progress Tracker */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Câu hỏi {currentIndex + 1} / {quizzes.length}</span>
          <span>Đã trả lời: {answeredCount} / {quizzes.length}</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options && currentQ.options.map((opt, idx) => {
            const isSelected = answers[currentQ.id] === opt;
            const letter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt)}
                className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </div>
                <span className="flex-1 text-base">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-30"
          >
            Câu trước
          </button>

          {currentIndex < quizzes.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || answeredCount < quizzes.length}
              className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-40 flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nộp bài Quiz (+30 XP)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
