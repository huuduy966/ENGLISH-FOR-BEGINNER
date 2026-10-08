import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  Award,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Check,
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
    clearAutoAdvance();
    setCurrentIndex(idx);
    setScore(null);
    setSpokenText('');
    setError('');
    setAllDone(false);
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
              Xuất sắc! Bạn đã luyện nói xong {vocabularies.length} từ!
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Bạn đã phát âm lần lượt toàn bộ từ vựng trong bài học. Hãy tự tin tiếp tục các bước học tiếp theo nhé!
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Progress header & Word Picker Pill list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            Từ {currentIndex + 1} / {vocabularies.length}
          </span>
          <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full">
            Đã luyện: {completedWordIds.length} / {vocabularies.length}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {vocabularies.map((v, idx) => {
            const isCurrent = currentIndex === idx;
            const isWordDone = completedWordIds.includes(v.id);

            return (
              <button
                key={v.id}
                onClick={() => handleSelectWord(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isWordDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isWordDone && !isCurrent && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                )}
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
            Luyện phát âm chuẩn
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
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs font-semibold text-slate-500 mt-3">
              {isRecording ? 'Đang lắng nghe... Hãy nói ngay!' : 'Bấm micro để bắt đầu phát âm thử'}
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
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 animate-fade-in text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Độ chính xác nhận diện:</span>
                <span
                  className={`text-sm font-extrabold ${
                    score >= 70 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {score}%
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <p className="text-xs text-slate-600">
                Bạn đã phát âm là: <strong className="text-slate-900">"{spokenText || currentWord.word}"</strong>
              </p>

              {score >= 70 ? (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Phát âm rất tốt!</span>
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-600">
                  Gần đúng rồi! Hãy tiếp tục rèn luyện nhé.
                </p>
              )}

              {/* Auto-advance Countdown Banner */}
              {autoAdvanceCountdown !== null && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-blue-600 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
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
                    className="font-bold text-blue-700 hover:text-blue-800 underline text-xs"
                  >
                    Chuyển ngay →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
