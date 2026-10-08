import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Award,
  RotateCcw,
  Check,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { speakText, createSpeechRecognizer } from '../../utils/speech';

export default function PronunciationSection({ vocabularies = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');
  const [completedWordIds, setCompletedWordIds] = useState([]);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);
  const [allDone, setAllDone] = useState(false);

  const autoAdvanceTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Clear timers helper
  const clearAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoAdvanceCountdown(null);
  };

  useEffect(() => {
    return () => clearAutoAdvance();
  }, []);

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có dữ liệu phát âm cho bài học này.</p>
      </div>
    );
  }

  const currentWord = vocabularies[currentIndex] || vocabularies[0];

  const handleSelectWord = (idx) => {
    // Only allow selecting words that have already been unlocked / completed or the immediate next word
    if (idx <= completedWordIds.length) {
      clearAutoAdvance();
      setCurrentIndex(idx);
      setScore(null);
      setSpokenText('');
      setError('');
      setAllDone(false);
    } else {
      alert(`Bạn cần phát âm đạt từ 80% trở lên các từ trước đó để mở khóa từ số ${idx + 1}.`);
    }
  };

  const handleStartRecording = () => {
    clearAutoAdvance();
    setError('');
    setSpokenText('');
    setScore(null);

    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setSpokenText(transcript);
        setIsRecording(false);

        // Simple fuzzy match comparison
        const target = currentWord.word.toLowerCase().trim();
        const spoken = transcript.toLowerCase().trim();

        let calculatedScore = 40;
        if (spoken.includes(target) || target.includes(spoken)) {
          calculatedScore = 95;
        } else {
          let matchChars = 0;
          for (let i = 0; i < Math.min(target.length, spoken.length); i++) {
            if (target[i] === spoken[i]) matchChars++;
          }
          calculatedScore = Math.max(Math.round((matchChars / target.length) * 100), 40);
        }

        setScore(calculatedScore);

        // REQUIREMENT: Must achieve at least 80% to pass and auto-advance!
        const isPassed = calculatedScore >= 80;

        if (isPassed) {
          // Mark word as completed
          setCompletedWordIds((prev) =>
            prev.includes(currentWord.id) ? prev : [...prev, currentWord.id]
          );

          // Trigger Auto-advance after 2.5s countdown
          setAutoAdvanceCountdown(2.5);
          let remaining = 2.5;

          countdownIntervalRef.current = setInterval(() => {
            remaining -= 0.5;
            if (remaining > 0) {
              setAutoAdvanceCountdown(remaining);
            } else {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
          }, 500);

          autoAdvanceTimerRef.current = setTimeout(() => {
            clearAutoAdvance();

            // Advance to next word or show complete
            if (currentIndex < vocabularies.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              setScore(null);
              setSpokenText('');
              setError('');
            } else {
              // Reached the end of vocabulary list
              setAllDone(true);
            }
          }, 2500);
        } else {
          // Score < 80%: DO NOT ADVANCE! User must practice again.
          clearAutoAdvance();
        }
      },
      onError: (err) => {
        setIsRecording(false);
        setError('Không nhận diện được giọng nói. Bạn hãy kiểm tra quyền truy cập microphone trên trình duyệt nhé.');
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (!recognizer.isSupported) {
      setError('Trình duyệt hiện tại chưa hỗ trợ Web Speech Recognition. Khuyến khích sử dụng Google Chrome hoặc Microsoft Edge.');
      return;
    }

    setIsRecording(true);
    recognizer.start();
  };

  const handleRestartPractice = () => {
    clearAutoAdvance();
    setAllDone(false);
    setCurrentIndex(0);
    setScore(null);
    setSpokenText('');
    setError('');
  };

  // Congratulations State when all words are finished
  if (allDone) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-200">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Hoàn thành tất cả từ vựng
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Xuất sắc! Bạn đã vượt qua tất cả {vocabularies.length} từ (≥ 80%)!
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Bạn đã phát âm chuẩn xác lần lượt toàn bộ từ vựng trong bài học. Hãy tự tin tiếp tục các bước học tiếp theo nhé!
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleRestartPractice}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện tập lại từ đầu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentWordPassed = score !== null && score >= 80;
  const isCurrentWordFailed = score !== null && score < 80;

  return (
    <div className="w-full space-y-6">
      {/* Progress header & Word Picker Pill list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            Từ {currentIndex + 1} / {vocabularies.length}: <strong className="text-slate-800">{currentWord.word}</strong>
          </span>
          <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Đạt chuẩn (≥80%): {completedWordIds.length} / {vocabularies.length} từ
          </span>
        </div>

        {/* Word Chips Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {vocabularies.map((v, idx) => {
            const isCurrent = currentIndex === idx;
            const isWordDone = completedWordIds.includes(v.id);
            const isWordLocked = idx > completedWordIds.length;

            return (
              <button
                key={v.id}
                onClick={() => handleSelectWord(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isWordDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isWordLocked
                    ? 'bg-slate-50 text-slate-400 border border-slate-200/50 cursor-not-allowed opacity-60'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isWordDone && !isCurrent ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : isWordLocked ? (
                  <Lock className="w-3 h-3 text-slate-400" />
                ) : null}
                <span>{v.word}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Pronunciation Card */}
      {currentWord && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative overflow-hidden">
          {/* Top category badge */}
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Luyện phát âm chuẩn (Yêu cầu ≥ 80%)
          </span>

          <h2 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">
            {currentWord.word}
          </h2>
          <p className="text-lg font-mono text-blue-600 font-semibold mt-1">
            {currentWord.pronunciation}
          </p>
          <p className="text-sm text-slate-500 mt-1">({currentWord.meaning})</p>

          {/* Audio listen button */}
          <div className="mt-6">
            <button
              onClick={() => speakText(currentWord.word)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-95 shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Nghe giọng đọc mẫu</span>
            </button>
          </div>

          {/* Record microphone button */}
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition active:scale-95 ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 ring-4 ring-rose-200'
                  : isCurrentWordFailed
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs font-semibold text-slate-500 mt-3">
              {isRecording
                ? 'Đang lắng nghe... Hãy nói ngay!'
                : isCurrentWordFailed
                ? 'Bấm micro để phát âm lại lần nữa!'
                : 'Bấm micro để bắt đầu phát âm thử'}
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Feedback & Auto-advance Bar */}
          {score !== null && (
            <div
              className={`mt-6 p-5 rounded-2xl border animate-fade-in text-left space-y-3 ${
                isCurrentWordPassed
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Độ chính xác nhận diện:</span>
                <span
                  className={`text-sm font-extrabold ${
                    isCurrentWordPassed ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {score}% {isCurrentWordPassed ? '(Đạt chuẩn)' : '(Chưa đạt ≥80%)'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCurrentWordPassed ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <p className="text-xs text-slate-700">
                Bạn đã phát âm là: <strong className="text-slate-900">"{spokenText || currentWord.word}"</strong>
              </p>

              {/* Success / Warning Message */}
              {isCurrentWordPassed ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Phát âm đạt chuẩn ({score}%)! Rất tốt.</span>
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  </p>

                  {/* Auto-advance Countdown Banner */}
                  {autoAdvanceCountdown !== null && (
                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        <span>Tự động chuyển từ tiếp theo sau {autoAdvanceCountdown}s...</span>
                      </span>

                      <button
                        onClick={() => {
                          clearAutoAdvance();
                          if (currentIndex < vocabularies.length - 1) {
                            setCurrentIndex((prev) => prev + 1);
                            setScore(null);
                            setSpokenText('');
                            setError('');
                          } else {
                            setAllDone(true);
                          }
                        }}
                        className="font-bold text-emerald-700 hover:text-emerald-900 underline text-xs"
                      >
                        Chuyển ngay →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/80 border border-rose-200 text-rose-800 text-xs space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Chưa đạt yêu cầu! Bạn cần đạt tối thiểu 80% để qua bài.</span>
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hãy bấm nút <strong>"Nghe giọng đọc mẫu"</strong> ở trên để nghe lại phát âm, sau đó bấm micro để đọc lại từ này nhé!
                  </p>
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={handleStartRecording}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đọc lại ngay</span>
                    </button>
                    <button
                      onClick={() => speakText(currentWord.word)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Nghe lại mẫu</span>
                    </button>
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
