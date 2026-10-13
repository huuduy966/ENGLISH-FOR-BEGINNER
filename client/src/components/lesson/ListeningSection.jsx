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
  Gauge,
  Lightbulb,
  Send,
  ArrowRight,
  HelpCircle,
  Check,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.,!?;:"'()]/g, '')
    .replace(/\b15\b/g, 'fifteen')
    .replace(/\b20\b/g, 'twenty')
    .replace(/\b21\b/g, 'twenty-one')
    .replace(/\b22\b/g, 'twenty-two')
    .replace(/\b25\b/g, 'twenty-five')
    .replace(/\b30\b/g, 'thirty')
    .replace(/\s+/g, ' ');
}

function checkListeningMatch(userAns, question) {
  const normUser = normalizeText(userAns);
  if (!normUser) return false;

  const normCorrect = normalizeText(question.correctAnswer);
  if (normUser === normCorrect) return true;

  // Inclusion match
  if (normUser.length >= 3 && (normCorrect.includes(normUser) || normUser.includes(normCorrect))) {
    return true;
  }

  // Check matching option text from curriculum
  if (Array.isArray(question.options)) {
    for (const opt of question.options) {
      const normOpt = normalizeText(opt);
      if (
        normOpt === normCorrect &&
        (normOpt === normUser || (normUser.length >= 4 && (normOpt.includes(normUser) || normUser.includes(normOpt))))
      ) {
        return true;
      }
    }
  }

  // Significant keyword match (at least 60% of core keywords matched)
  const correctKeywords = normCorrect.split(' ').filter((w) => w.length >= 3);
  if (correctKeywords.length > 0) {
    const userWords = new Set(normUser.split(' '));
    const matched = correctKeywords.filter((w) => userWords.has(w));
    if (matched.length / correctKeywords.length >= 0.6) {
      return true;
    }
  }

  return false;
}

export default function ListeningSection({ listenings = [], onStepComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); // 1x or 0.8x for slower practice
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [allQuestionsDone, setAllQuestionsDone] = useState(false);

  const inputRef = useRef(null);
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
  const currentQ = questionsList[currentQuestionIndex];

  // Sync input on question change
  useEffect(() => {
    clearTimers();
    setShowHint(false);
    const existing = userAnswers[currentQuestionIndex] || '';
    setCurrentInput(existing);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [currentQuestionIndex]);

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

  const handleCheckAnswer = () => {
    if (!currentInput.trim() || isAdvancing || showFeedback[currentQuestionIndex]?.isCorrect) return;

    const isMatch = checkListeningMatch(currentInput, currentQ);
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: currentInput.trim() }));

    if (isMatch) {
      setShowFeedback((prev) => ({
        ...prev,
        [currentQuestionIndex]: { isCorrect: true, explanation: currentQ?.explanation },
      }));

      const solvedCount = Object.keys(showFeedback).filter((k) => showFeedback[k]?.isCorrect).length + 1;

      if (currentQuestionIndex < questionsList.length - 1) {
        setIsAdvancing(true);
        autoAdvanceTimerRef.current = setTimeout(() => {
          setIsAdvancing(false);
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 1800);
      } else if (solvedCount >= questionsList.length) {
        setAllQuestionsDone(true);
        if (onStepComplete) onStepComplete(true);
      }
    } else {
      setShowFeedback((prev) => ({
        ...prev,
        [currentQuestionIndex]: { isCorrect: false },
      }));
    }
  };

  const handleNextQuestion = () => {
    clearTimers();
    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setAllQuestionsDone(true);
      if (onStepComplete) onStepComplete(true);
    }
  };

  const handleRetry = () => {
    setShowFeedback((prev) => {
      const next = { ...prev };
      delete next[currentQuestionIndex];
      return next;
    });
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const solvedCount = Object.values(showFeedback).filter((f) => f.isCorrect).length;

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* 1. Audio Player Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-center space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
            Bước 4 • Luyện nghe hiểu tự luận
          </span>
          <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span></span>
          </span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {current.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lắng nghe thông tin trong đoạn audio và tự nhập câu trả lời cho các câu hỏi bên dưới.
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
            title="Nghe lại"
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

      {/* 2. Interactive Subjective Comprehension Questions */}
      {questionsList.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Câu hỏi nghe hiểu tự luận ({currentQuestionIndex + 1}/{questionsList.length})
                </h4>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Đạt: <strong className="text-purple-600">{solvedCount}</strong> / {questionsList.length} câu
            </div>
          </div>

          {allQuestionsDone ? (
            <div className="p-8 text-center bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-purple-600 mx-auto" />
              <h4 className="text-lg sm:text-xl font-black text-purple-950">
                Xuất sắc! Bạn đã hoàn thành toàn bộ câu hỏi.
              </h4>
              <p className="text-xs text-purple-800 font-medium">
                Bạn đã sẵn sàng để tiếp tục sang Bước 5 (Đọc hiểu).
              </p>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              {/* Question Prompt */}
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Subjective Input Form */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Câu trả lời của bạn (bằng tiếng Anh):
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCheckAnswer();
                        }
                      }}
                      disabled={isAdvancing || showFeedback[currentQuestionIndex]?.isCorrect}
                      placeholder="Gõ thông tin nghe được bằng tiếng Anh vào đây..."
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition ${
                        showFeedback[currentQuestionIndex]?.isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                          : showFeedback[currentQuestionIndex]?.isCorrect === false
                          ? 'bg-rose-50/60 border-rose-300 text-rose-950 focus:ring-4 focus:ring-rose-500/10'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {showFeedback[currentQuestionIndex]?.isCorrect === false && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Làm lại</span>
                      </button>
                    )}

                    {!showFeedback[currentQuestionIndex]?.isCorrect ? (
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        disabled={!currentInput.trim() || isAdvancing}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kiểm tra câu trả lời</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Câu tiếp theo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hint Box */}
                {showHint && currentQ && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1 animate-fade-in font-medium">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gợi ý nghe:</span>
                    </p>
                    <p className="leading-relaxed text-[11px]">
                      Hãy chú ý các từ khóa trong audio liên quan đến: "<strong>{currentQ.question}</strong>". Bạn có thể bấm "Nghe lại" ở trên nếu cần nghe lại rõ hơn.
                    </p>
                  </div>
                )}

                {/* Feedback: Success Banner */}
                {showFeedback[currentQuestionIndex]?.isCorrect && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fade-in text-xs">
                    <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Chính xác! Bạn nghe rất tốt!</span>
                    </div>
                    <div className="text-emerald-950 space-y-1 font-medium bg-white/70 p-3 rounded-lg border border-emerald-100">
                      <p>
                        <strong className="text-emerald-800">Đáp án chuẩn: </strong>
                        {currentQ.correctAnswer}
                      </p>
                      {currentQ.explanation && (
                        <p className="text-slate-600 pt-1 border-t border-emerald-100 text-[11px]">
                          <strong>Giải thích: </strong>
                          {currentQ.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Feedback: Wrong Alert */}
                {showFeedback[currentQuestionIndex]?.isCorrect === false && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900 animate-shake">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-rose-950">Câu trả lời chưa chính xác!</p>
                      <p className="text-rose-800 text-[11px]">
                        Hãy lắng nghe lại đoạn audio hoặc xem lời thoại.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
