import React, { useState, useEffect, useRef } from 'react';
import {
  BookMarked,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Languages,
} from 'lucide-react';

export default function ReadingSection({ readings = [], onStepComplete }) {
  const [showTranslation, setShowTranslation] = useState(false);
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

  if (!readings || readings.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài đọc hiểu cho bài học này.</p>
      </div>
    );
  }

  const currentReading = readings[0];
  const questionsList = currentReading.questions || [];

  const handleSelectOption = (qIdx, option, correctAnswer) => {
    if (isAdvancing || showFeedback[qIdx]?.isCorrect) return;

    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }));
    const isMatch = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isMatch) {
      setShowFeedback((prev) => ({
        ...prev,
        [qIdx]: { isCorrect: true, explanation: currentQ?.explanation },
      }));

      // Trigger 1.5s Auto-advance
      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentQuestionIndex < questionsList.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // All 5 reading comprehension questions finished!
          setAllQuestionsDone(true);
          if (onStepComplete) onStepComplete(true);
        }
      }, 1500);
    } else {
      // Wrong answer: DO NOT auto-advance. Allow retry!
      setShowFeedback((prev) => ({
        ...prev,
        [qIdx]: { isCorrect: false },
      }));
    }
  };

  const currentQ = questionsList[currentQuestionIndex];
  const passageParagraphs = (currentReading.passage || '').split('\n\n');
  const translationParagraphs = (currentReading.translation || '').split('\n\n');

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* Top Header Badge */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0 border border-teal-100">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                Bước 5 • Đọc hiểu văn bản
              </span>
              <span className="text-xs text-slate-400 font-bold">
                • 5 câu hỏi kiểm tra
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {currentReading.title || 'Reading Comprehension'}
            </h3>
          </div>
        </div>

        {/* Translation Toggle Button */}
        <button
          type="button"
          onClick={() => setShowTranslation((prev) => !prev)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto ${
            showTranslation
              ? 'bg-teal-600 text-white shadow-teal-500/20'
              : 'bg-white hover:bg-teal-50 text-teal-700 border border-teal-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Xem bản dịch tiếng Việt'}</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout: Left (Passage) & Right (Questions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (Passage Card) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Đoạn văn tiếng Anh</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Đọc kỹ trước khi trả lời
            </span>
          </div>

          {/* English Passage Text */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
            {passageParagraphs.map((para, pIdx) => (
              <p key={pIdx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {para}
              </p>
            ))}
          </div>

          {/* Vietnamese Translation (Collapsible) */}
          {showTranslation && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2 text-xs text-teal-950 leading-relaxed font-medium animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-teal-800 text-[11px] uppercase tracking-wide">
                <Languages className="w-3.5 h-3.5 text-teal-600" />
                <span>Bản dịch tiếng Việt tham khảo:</span>
              </div>
              <div className="space-y-2">
                {translationParagraphs.map((tPara, tIdx) => (
                  <p key={tIdx}>{tPara}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Questions Card) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Câu hỏi đọc hiểu ({currentQuestionIndex + 1}/{questionsList.length})
                </h4>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Đạt: <strong className="text-teal-600">{Object.values(showFeedback).filter((f) => f.isCorrect).length}</strong> / {questionsList.length}
            </div>
          </div>

          {allQuestionsDone ? (
            <div className="p-8 text-center bg-teal-50/80 rounded-2xl border border-teal-200 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
              <h4 className="text-lg sm:text-xl font-black text-teal-950">
                Xuất sắc! Bạn đã trả lời đúng toàn bộ câu hỏi Đọc hiểu.
              </h4>
              <p className="text-xs text-teal-800 font-medium">
                Bạn đã sẵn sàng để tiếp tục sang Bước 6 (Bài tập tương tác).
              </p>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {currentQ.options &&
                  currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQuestionIndex] === opt;
                    const feedback = showFeedback[currentQuestionIndex];
                    const isChecked = !!feedback;

                    let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';
                    if (isChecked) {
                      if (opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase()) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20 font-bold animate-shake';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-teal-50 border-teal-600 text-teal-900 font-bold ring-2 ring-teal-500/20';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestionIndex, opt, currentQ.correctAnswer)}
                        disabled={isAdvancing || feedback?.isCorrect}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-2 shadow-2xs ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isChecked && opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isChecked && isSelected && !feedback?.isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Feedback alert banner */}
              {showFeedback[currentQuestionIndex]?.isCorrect && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Chính xác! Tự động chuyển câu tiếp theo sau 1,5 giây...</span>
                  </div>
                </div>
              )}
              {showFeedback[currentQuestionIndex] && !showFeedback[currentQuestionIndex]?.isCorrect && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900 font-bold animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Chưa chính xác! Hãy đọc lại đoạn văn bên trái và chọn lại đáp án.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
