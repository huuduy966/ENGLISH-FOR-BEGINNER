import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function ListeningSection({ listenings = [], onStepComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
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
    return () => {
      clearAutoAdvanceTimer();
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!listenings || listenings.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài luyện nghe cho bài học này.</p>
      </div>
    );
  }

  const current = listenings[0];
  const questionsList = current.questions || [];

  const handlePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(current.transcript);
      const duration = Math.max(3000, (current.transcript.length / 8) * 1000);
      setTimeout(() => {
        setIsPlaying(false);
      }, duration);
    }
  };

  const handleSelectOption = (qIdx, option, correctAnswer) => {
    if (isAdvancing || showFeedback[qIdx]?.isCorrect) return;

    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }));
    const isMatch = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isMatch) {
      setShowFeedback((prev) => ({
        ...prev,
        [qIdx]: { isCorrect: true },
      }));

      // Trigger 1.5s Auto-advance
      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentQuestionIndex < questionsList.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // All questions finished!
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

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* 1. Audio Player Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
          <Headphones className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
            Luyện nghe hiểu bản ngữ (Listening Comprehension)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {current.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Lắng nghe cẩn thận audio để trả lời câu hỏi nghe hiểu bên dưới.
          </p>
        </div>

        {/* Audio controller bar */}
        <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/80 via-slate-50 to-indigo-50/80 border border-purple-200 flex items-center justify-center gap-4 shadow-2xs">
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`p-4 rounded-full font-bold shadow-md transition-all active:scale-95 flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-amber-500/25 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <div className="text-left">
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {isPlaying ? 'Đang phát âm giọng đọc bản ngữ...' : 'Bấm Play để nghe toàn bộ audio'}
            </p>
            <p className="text-[11px] text-purple-600 font-medium">Giọng chuẩn tiếng Anh Mỹ (US Native Voice)</p>
          </div>
        </div>

        {/* Transcript Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl hover:bg-purple-50"
          >
            {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showTranscript ? 'Ẩn lời thoại (Transcript)' : 'Xem lời thoại (Transcript)'}</span>
          </button>

          {showTranscript && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-purple-200/80 text-left text-xs sm:text-sm font-medium text-slate-700 leading-relaxed animate-fade-in shadow-2xs max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                Transcript tiếng Anh:
              </span>
              "{current.transcript}"
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Comprehension Questions with 1.5s Auto-Advance */}
      {questionsList.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-lg text-slate-900">
                  Câu hỏi nghe hiểu ({currentQuestionIndex + 1} / {questionsList.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Trả lời đúng sẽ tự động chuyển sang câu tiếp theo sau 1,5 giây
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Đạt: <strong className="text-purple-600">{Object.values(showFeedback).filter(f => f.isCorrect).length}</strong> / {questionsList.length}
            </div>
          </div>

          {allQuestionsDone ? (
            <div className="p-8 text-center bg-purple-50 rounded-2xl border border-purple-200 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-purple-600 mx-auto" />
              <h4 className="text-xl font-bold text-purple-950">
                Xuất sắc! Bạn đã hoàn thành toàn bộ câu hỏi nghe hiểu.
              </h4>
              <p className="text-xs text-purple-800">
                Bạn đã sẵn sàng để tiếp tục sang Bước 5 (Bài tập).
              </p>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentQ.options && currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIndex] === opt;
                  const feedback = showFeedback[currentQuestionIndex];
                  const isChecked = !!feedback;

                  let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';
                  if (isChecked) {
                    if (opt.toLowerCase() === currentQ.correctAnswer.toLowerCase()) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20 font-bold';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-purple-50 border-purple-600 text-purple-900 font-bold ring-2 ring-purple-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestionIndex, opt, currentQ.correctAnswer)}
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
              {showFeedback[currentQuestionIndex] && (
                <div
                  className={`p-4 rounded-xl border text-xs animate-fade-in space-y-1 ${
                    showFeedback[currentQuestionIndex].isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                    {showFeedback[currentQuestionIndex].isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Đang tự động chuyển câu tiếp theo sau 1,5 giây...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Chưa chính xác. Bạn hãy nghe lại audio và chọn lại đáp án đúng.</span>
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
