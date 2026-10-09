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
  HelpCircle,
  Gauge,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function ListeningSection({ listenings = [], onStepComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); // 1x or 0.8x for slower practice
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [allQuestionsDone, setAllQuestionsDone] = useState(false);

  const autoAdvanceTimerRef = useRef(null);
  const audioDurationTimerRef = useRef(null);

  const clearTimers = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (audioDurationTimerRef.current) {
      clearTimeout(audioDurationTimerRef.current);
      audioDurationTimerRef.current = null;
    }
    setIsAdvancing(false);
  };

  useEffect(() => {
    return () => {
      clearTimers();
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

  const handlePlayAudio = (rate = playbackRate) => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      if (audioDurationTimerRef.current) clearTimeout(audioDurationTimerRef.current);
      setIsPlaying(false);
    } else {
      if (!current.transcript) {
        alert('Nội dung audio chưa sẵn sàng. Vui lòng thử lại sau.');
        return;
      }
      setIsPlaying(true);
      speakText(current.transcript);

      // Estimate audio duration based on word count
      const wordCount = current.transcript.split(/\s+/).length;
      const durationMs = Math.max(3000, ((wordCount / (2.2 * rate)) * 1000) + 1000);

      audioDurationTimerRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, durationMs);
    }
  };

  const handleReplay = () => {
    window.speechSynthesis?.cancel();
    if (audioDurationTimerRef.current) clearTimeout(audioDurationTimerRef.current);
    setIsPlaying(false);
    setTimeout(() => {
      handlePlayAudio(playbackRate);
    }, 100);
  };

  const handleToggleSpeed = () => {
    const nextRate = playbackRate === 1 ? 0.8 : 1;
    setPlaybackRate(nextRate);
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    }
  };

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
          // All 5 listening questions finished!
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
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* 1. Audio Player Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-center space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
            Bước 4 • Luyện nghe hiểu
          </span>
          <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>US Native Voice</span>
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {current.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lắng nghe thông tin chi tiết trong đoạn audio và trả lời 5 câu hỏi bên dưới.
          </p>
        </div>

        {/* Audio controller bar */}
        <div className="max-w-md mx-auto p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border border-purple-200/80 flex flex-wrap items-center justify-center gap-3 shadow-2xs">
          {/* Play / Pause button */}
          <button
            type="button"
            onClick={() => handlePlayAudio(playbackRate)}
            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-2 ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-amber-500/25 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Phát audio</span>
              </>
            )}
          </button>

          {/* Replay button */}
          <button
            type="button"
            onClick={handleReplay}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Nghe lại từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Nghe lại</span>
          </button>

          {/* Speed Toggle (1x / 0.8x) */}
          <button
            type="button"
            onClick={handleToggleSpeed}
            className="px-2.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            title="Tốc độ phát âm"
          >
            <Gauge className="w-3.5 h-3.5 text-purple-500" />
            <span>{playbackRate}x</span>
          </button>
        </div>

        {/* Transcript Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1.5 transition px-3 py-1 rounded-lg hover:bg-purple-50"
          >
            {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTranscript ? 'Ẩn lời thoại' : 'Xem lời thoại (Transcript)'}</span>
          </button>

          {showTranscript && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-purple-200/80 text-left text-xs font-medium text-slate-700 leading-relaxed animate-fade-in shadow-2xs max-w-xl mx-auto">
              "{current.transcript}"
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Comprehension Questions */}
      {questionsList.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Câu hỏi nghe hiểu ({currentQuestionIndex + 1}/{questionsList.length})
                </h4>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Đạt: <strong className="text-purple-600">{Object.values(showFeedback).filter((f) => f.isCorrect).length}</strong> / {questionsList.length}
            </div>
          </div>

          {allQuestionsDone ? (
            <div className="p-8 text-center bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-purple-600 mx-auto" />
              <h4 className="text-lg sm:text-xl font-black text-purple-950">
                Xuất sắc! Bạn đã hoàn thành toàn bộ câu hỏi nghe hiểu.
              </h4>
              <p className="text-xs text-purple-800 font-medium">
                Bạn đã sẵn sàng để tiếp tục sang Bước 5 (Đọc hiểu).
              </p>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
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
                      btnStyle = 'bg-purple-50 border-purple-600 text-purple-900 font-bold ring-2 ring-purple-500/20';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestionIndex, opt, currentQ.correctAnswer)}
                        disabled={isAdvancing || feedback?.isCorrect}
                        className={`p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-2 shadow-2xs ${btnStyle}`}
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
                    <span>Chưa chính xác! Hãy nghe lại audio và chọn đáp án khác.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
