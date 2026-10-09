import React, { useState, useEffect, useRef } from 'react';
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
  const [isAdvancing, setIsAdvancing] = useState(false);
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
    setIsAdvancing(false);
  };

  useEffect(() => {
    return () => {
      clearTimer();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData);
      setCurrentPartNum(initialPartNumber || 1);
      setCurrentQIndex(initialQuestionIndex || 0);
      setIsDayFinished(sessionData.completed || false);
    }
  }, [sessionData, initialPartNumber, initialQuestionIndex, isOpen]);

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

  // Immediate Option Click Verification
  const handleSelectOption = async (option) => {
    if (isAdvancing || submitting || feedback?.isCorrect) return;

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

      if (isCorrect) {
        setFeedback({
          isCorrect: true,
          pointsDelta: 4,
          explanation: explanation || 'Chính xác!',
        });

        // 1.5s Auto-advance
        setIsAdvancing(true);
        autoAdvanceTimerRef.current = setTimeout(() => {
          setIsAdvancing(false);
          // Advance question
          if (currentQIndex < currentPart.questions.length - 1) {
            setCurrentQIndex((prev) => prev + 1);
          } else if (currentPartNum < 5) {
            // Next part
            setCurrentPartNum((prev) => prev + 1);
            setCurrentQIndex(0);
          } else {
            // Whole Day Completed!
            setIsDayFinished(true);
          }
        }, 1500);
      } else {
        // Wrong answer: -2 points, DO NOT advance, allow retry
        setFeedback({
          isCorrect: false,
          pointsDelta: -2,
          explanation: explanation || 'Chưa chính xác. Hãy đọc kỹ lại và chọn đáp án khác.',
        });
      }
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
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

        {/* Modal Main Content Area */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {isDayFinished ? (
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
                    let style = 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 text-slate-800';

                    if (feedback) {
                      if (opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase()) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                      } else if (isSelected && !feedback.isCorrect) {
                        style = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20 font-bold';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        disabled={isAdvancing || submitting || (feedback && feedback.isCorrect)}
                        className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between shadow-2xs ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {feedback && opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {feedback && isSelected && !feedback.isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Instant Feedback Banner */}
              {feedback && (
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fade-in flex items-start gap-3 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/90 border-rose-200 text-rose-900'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="font-black text-sm">
                      {feedback.isCorrect
                        ? '🎉 Chính xác! +4 điểm (Tự động chuyển câu sau 1,5s...)'
                        : 'Chưa chính xác! -2 điểm'}
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {feedback.explanation}
                    </p>
                    {!feedback.isCorrect && (
                      <p className="text-[11px] font-bold text-rose-700 pt-0.5">
                        👉 Hãy suy nghĩ lại và chọn một phương án khác bên trên.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
