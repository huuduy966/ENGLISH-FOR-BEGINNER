import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Search,
  Headphones,
  FileText,
  Clock,
  RotateCcw,
  Check,
  Pause,
  Play,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import api from '../../services/api';
import { speakText } from '../../utils/speech';

export default function DailyPracticeModal({
  isOpen,
  onClose,
  initialPartNumber = 1,
  initialQuestionIndex = 0,
  sessionData,
  onSessionUpdated,
}) {
  const [currentPartNum, setCurrentPartNum] = useState(initialPartNumber);
  const [currentQIndex, setCurrentQIndex] = useState(initialQuestionIndex);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDayFinished, setIsDayFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Local copy of session for instant response
  const [session, setSession] = useState(sessionData);

  const autoAdvanceTimerRef = useRef(null);

  const clearTimer = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Only initialize position on initial mount / open
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && sessionData) {
      initializedRef.current = true;
      setSession(sessionData);
      setCurrentPartNum(initialPartNumber || 1);
      setCurrentQIndex(initialQuestionIndex || 0);
      const isDone = sessionData.completed || (sessionData.completedCount >= (sessionData.totalQuestions || 60) && sessionData.completedCount > 0);
      setIsDayFinished(isDone);
    }
  }, [initialPartNumber, initialQuestionIndex, sessionData]);

  // If sessionData updates from outside, update data without resetting navigation index
  useEffect(() => {
    if (sessionData && initializedRef.current) {
      setSession(sessionData);
      if (sessionData.completed || (sessionData.completedCount >= (sessionData.totalQuestions || 60) && sessionData.completedCount > 0)) {
        setIsDayFinished(true);
      }
    }
  }, [sessionData]);

  // Reset feedback & options when question changes
  useEffect(() => {
    clearTimer();
    setSelectedOption(null);
    setFeedback(null);
    setIsPlayingAudio(false);
    window.speechSynthesis?.cancel();
  }, [currentPartNum, currentQIndex]);

  if (!isOpen || !session || !session.parts) return null;

  const currentPart = session.parts.find((p) => p.partNumber === currentPartNum) || session.parts[0];
  const currentQ = currentPart?.questions?.[currentQIndex];

  // Part icons and colors
  const PART_META = {
    1: { name: 'Từ vựng', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    2: { name: 'Luyện nói', icon: MessageSquare, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    3: { name: 'Tìm và sửa lỗi sai', icon: Search, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    4: { name: 'Luyện nghe', icon: Headphones, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    5: { name: 'Luyện đọc', icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  };

  const meta = PART_META[currentPartNum] || PART_META[1];
  const PartIcon = meta.icon;

  // Handle Play Listening Audio
  const handlePlayAudio = () => {
    if (!currentQ?.audioText) return;
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(currentQ.audioText);
      const duration = Math.max(3000, (currentQ.audioText.length / 8) * 1000);
      setTimeout(() => setIsPlayingAudio(false), duration);
    }
  };

  // Advance to next question
  const handleNextQuestion = () => {
    clearTimer();
    const nextQ = currentQIndex + 1;
    const totalInPart = currentPart?.questions?.length || 10;
    const pNum = currentPartNum;

    if (nextQ < totalInPart) {
      setCurrentQIndex(nextQ);
    } else if (pNum < 5) {
      setCurrentPartNum(pNum + 1);
      setCurrentQIndex(0);
    } else {
      setIsDayFinished(true);
    }
  };

  // Immediate Option Click Verification
  const handleSelectOption = async (option) => {
    if (submitting || feedback) return;

    setSelectedOption(option);
    setSubmitting(true);

    try {
      const res = await api.post('/daily-practice/answer', {
        partNumber: currentPartNum,
        questionIndex: currentQIndex,
        selectedOption: option,
      });

      const { isCorrect, pointsDelta, newScore, userPracticeScore, explanation, isDayCompleted } = res.data;

      // Update local session state
      setSession((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        next.score = newScore;
        next.userPracticeScore = userPracticeScore;
        const p = next.parts.find((part) => part.partNumber === currentPartNum);
        if (p && p.questions[currentQIndex]) {
          p.questions[currentQIndex].isCorrect = isCorrect;
          p.questions[currentQIndex].selectedAnswer = option;
        }
        // Recalculate completed count
        let comp = 0;
        next.parts.forEach((part) => {
          comp += part.questions.filter((q) => q.isCorrect).length;
        });
        next.completedCount = comp;
        next.remainingCount = Math.max(0, 60 - comp);
        next.completed = isDayCompleted || false;

        if (onSessionUpdated) onSessionUpdated(next);
        return next;
      });

      setFeedback({
        isCorrect,
        pointsDelta: isCorrect ? 4 : -2,
        explanation: explanation || (isCorrect ? 'Chính xác!' : 'Đáp án chính xác là: ' + currentQ.correctAnswer),
      });
    } catch (err) {
      console.error('Answer submission error:', err);
      alert('Có lỗi khi kiểm tra đáp án. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    clearTimer();
    window.speechSynthesis?.cancel();
    onClose();
  };

  // Overall question index in the 60 questions:
  let overallIndex = 0;
  for (let i = 1; i < currentPartNum; i++) {
    const p = session.parts.find((part) => part.partNumber === i);
    overallIndex += p?.questions?.length || 0;
  }
  overallIndex += currentQIndex + 1;

  const progressPercent = Math.round((overallIndex / 60) * 100);
  const isCompleted = isDayFinished || session?.completed || ((session?.completedCount || 0) >= (session?.totalQuestions || 60) && (session?.completedCount || 0) > 0);

  const modalContent = (
    <div
      className="fixed inset-0 w-screen h-screen h-[100dvh] bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        zIndex: 100,
      }}
    >
      <div
        className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh] z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        {isCompleted ? (
          /* Clean close button when completed (hide question header & progress line entirely) */
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            {/* Modal Top Bar */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${meta.color}`}>
                  <PartIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800">
                      Phần {currentPartNum}/5: {meta.name}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {session.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Câu {overallIndex} / 60 trong ngày (Câu {currentQIndex + 1} / {currentPart?.questions?.length || 10})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Điểm hôm nay
                  </span>
                  <span className="text-sm sm:text-base font-black text-blue-600">
                    {session.score} điểm
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Thoát và lưu tiến độ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Global Progress Line */}
            <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        )}

        {/* Modal Main Content Area */}
        <div className={`p-5 sm:p-8 overflow-y-auto flex-1 space-y-6 ${isCompleted ? 'pt-12 sm:pt-14' : ''}`}>
          {isCompleted ? (
            /* Day Completed Summary Screen */
            <div className="text-center py-8 space-y-6 max-w-lg mx-auto animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  🎉 Chúc mừng! Hoàn thành mục tiêu 60 câu!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn đã xuất sắc vượt qua toàn bộ 5 phần luyện tập hằng ngày cấp độ{' '}
                  <strong className="text-blue-600">{session.level}</strong> của ngày hôm nay.
                </p>
              </div>

              {/* Score summary metrics */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 inline-flex items-center justify-center gap-8 shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Điểm hôm nay</p>
                  <p className="text-2xl font-black text-blue-600 mt-0.5">+{session.score} đ</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Tổng điểm làm bài</p>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">{session.userPracticeScore} đ</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Hoàn thành</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">60 / 60</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition active:scale-95"
                >
                  Quay về Dashboard
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Screen */
            <div className="space-y-6">
              {/* Reading Passage Area (If Part 5: Reading) */}
              {currentQ.type === 'READING' && currentQ.passageText && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-md inline-block">
                    Đoạn văn đọc hiểu: {currentQ.passageTitle}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {currentQ.passageText}
                  </p>
                </div>
              )}

              {/* Listening Audio Player (If Part 4: Listening) */}
              {currentQ.type === 'LISTENING' && currentQ.audioText && (
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className={`p-3.5 rounded-2xl font-bold shadow-md transition active:scale-95 flex items-center justify-center ${
                        isPlayingAudio
                          ? 'bg-amber-500 text-white shadow-amber-500/25 animate-pulse'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25'
                      }`}
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {isPlayingAudio ? 'Đang phát âm giọng đọc bản ngữ...' : 'Bấm để nghe đoạn audio'}
                      </p>
                      <p className="text-[11px] text-purple-700 font-medium">
                        {currentQ.audioTitle || 'Giọng chuẩn tiếng Anh Mỹ'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Câu hỏi {currentQIndex + 1}:
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Multiple Choice Options (Instant Click Check) */}
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options &&
                  currentQ.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer?.trim().toLowerCase();
                    let style = 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 text-slate-800';

                    if (feedback) {
                      if (isCorrect) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/25';
                      } else if (isSelected && !feedback.isCorrect) {
                        style = 'bg-red-50 border-red-300 text-red-950 font-bold ring-2 ring-red-400/25';
                      } else {
                        style = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        disabled={submitting || !!feedback}
                        className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between shadow-2xs ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                              feedback && isCorrect
                                ? 'bg-emerald-200 text-emerald-800'
                                : feedback && isSelected && !feedback.isCorrect
                                ? 'bg-red-200 text-red-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {feedback && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {feedback && isSelected && !feedback.isCorrect && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Instant Feedback & "Tiếp tục" Banner */}
              {feedback && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-black text-sm sm:text-base">
                        {feedback.isCorrect ? '🎉 Chính xác! +4 điểm' : 'Chưa chính xác! -2 điểm'}
                      </p>
                      <p className="text-xs opacity-90 leading-relaxed">
                        {feedback.explanation}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className={`px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 active:scale-95 text-white ${
                      feedback.isCorrect
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
                    }`}
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
