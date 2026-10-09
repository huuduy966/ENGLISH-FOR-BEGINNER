import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Mic,
  MicOff,
  AlertCircle,
  Award,
} from 'lucide-react';
import { speakText, createSpeechRecognizer } from '../../utils/speech';

export default function PronunciationSection({ vocabularies = [], onStepComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedWordIds, setCompletedWordIds] = useState(new Set());
  const [allDone, setAllDone] = useState(false);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechScore, setSpeechScore] = useState(null);
  const [speechFeedback, setSpeechFeedback] = useState(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [micError, setMicError] = useState(null);

  const autoAdvanceTimerRef = useRef(null);
  const recognizerRef = useRef(null);

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
      if (recognizerRef.current && recognizerRef.current.stop) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  // Reset state when moving to a new word
  useEffect(() => {
    clearAutoAdvanceTimer();
    setIsRecording(false);
    setSpeechTranscript('');
    setSpeechScore(null);
    setSpeechFeedback(null);
    setMicError(null);
  }, [currentIndex]);

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có danh sách từ vựng cho bài học này.</p>
      </div>
    );
  }

  const currentWord = vocabularies[currentIndex] || vocabularies[0];
  // Ensure IPA string has format /.../
  const rawIpa = currentWord.pronunciation || `/${currentWord.word.toLowerCase()}/`;
  const formattedIpa = rawIpa.startsWith('/') && rawIpa.endsWith('/') ? rawIpa : `/${rawIpa}/`;

  // Advance to next word
  const handleNextWord = () => {
    clearAutoAdvanceTimer();
    const nextCompleted = new Set(completedWordIds);
    nextCompleted.add(currentWord.id);
    setCompletedWordIds(nextCompleted);

    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setAllDone(true);
      if (onStepComplete) onStepComplete(true);
    }
  };

  // Start speech recording
  const handleStartRecording = () => {
    clearAutoAdvanceTimer();
    setMicError(null);
    setSpeechTranscript('');
    setSpeechScore(null);
    setSpeechFeedback(null);
    setIsRecording(true);

    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setIsRecording(false);
        setSpeechTranscript(transcript);

        const target = currentWord.word.toLowerCase().trim();
        const spoken = transcript.toLowerCase().trim();

        // Calculate score
        let score = 50;
        if (spoken === target || spoken.includes(target) || target.includes(spoken)) {
          score = 95;
        } else {
          let matchChars = 0;
          for (let i = 0; i < Math.min(target.length, spoken.length); i++) {
            if (target[i] === spoken[i]) matchChars++;
          }
          score = Math.max(Math.round((matchChars / Math.max(target.length, spoken.length)) * 100), 40);
        }

        setSpeechScore(score);

        const nextCompleted = new Set(completedWordIds);
        nextCompleted.add(currentWord.id);
        setCompletedWordIds(nextCompleted);

        if (score >= 70) {
          setSpeechFeedback({
            isPass: true,
            title: score >= 85 ? '🎉 Xuất sắc! Phát âm rất chuẩn' : '👍 Rất tốt! Đạt yêu cầu',
            message: `Bạn phát âm từ "${currentWord.word}" đạt ${score}%.`,
          });

          // Auto-advance after 1.5s
          setIsAdvancing(true);
          autoAdvanceTimerRef.current = setTimeout(() => {
            setIsAdvancing(false);
            if (currentIndex < vocabularies.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              setAllDone(true);
              if (onStepComplete) onStepComplete(true);
            }
          }, 1500);
        } else {
          setSpeechFeedback({
            isPass: false,
            title: '💪 Cần thử lại!',
            message: `Bạn vừa nói: "${transcript}". Hãy nghe mẫu và thu âm lại để phát âm rõ hơn nhé.`,
          });
        }
      },
      onError: (err) => {
        setIsRecording(false);
        setMicError(
          typeof err === 'string'
            ? err
            : 'Không thể truy cập Microphone. Hãy kiểm tra quyền truy cập micro trên trình duyệt của bạn.'
        );
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  const handleStopRecording = () => {
    if (recognizerRef.current && recognizerRef.current.stop) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);
  };

  // Section Complete View
  if (allDone) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            Hoàn thành Bước 2: Thu âm từ vựng!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Bạn đã xuất sắc thu âm và luyện phát âm toàn bộ {vocabularies.length} từ vựng trong bài học.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAllDone(false);
              setCurrentIndex(0);
              setCompletedWordIds(new Set());
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Luyện tập lại từ đầu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* 1. Top Header Tracker */}
      <div className="bg-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black text-slate-800">
            Thu âm từ {currentIndex + 1} / {vocabularies.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
            {currentWord.category || 'Thu âm từ vựng'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">
            Đã đạt: <strong className="text-emerald-600">{completedWordIds.size}</strong> / {vocabularies.length}
          </span>
        </div>
      </div>

      {/* 2. Main Recording Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6">
        {/* Word Display & Explicit IPA Label */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {currentWord.word}
          </h2>

          {/* Explicit IPA label */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                Phiên âm IPA:
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-blue-900 tracking-wider">
                {formattedIpa}
              </span>
            </div>
            {currentWord.partOfSpeech && (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                {currentWord.partOfSpeech}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
            Nghĩa: <strong className="text-slate-800">{currentWord.meaning}</strong>
          </p>
        </div>

        {/* Listen Native Voice Model */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => speakText(currentWord.word)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 transition shadow-2xs active:scale-95"
            title="Bấm để nghe giọng phát âm bản xứ"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>Nghe mẫu phát âm</span>
          </button>
        </div>

        {/* Big Interactive Recording Button */}
        <div className="py-2 flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full font-bold shadow-lg transition-all flex flex-col items-center justify-center gap-1 active:scale-95 relative z-10 ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse ring-4 ring-rose-200'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30'
              }`}
            >
              <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          </div>

          <p className="text-xs font-extrabold text-slate-600">
            {isRecording ? (
              <span className="text-rose-600 animate-pulse">
                🔴 Đang lắng nghe... Hãy phát âm từ "{currentWord.word}"
              </span>
            ) : (
              'Bấm vào micro để thu âm từ vựng'
            )}
          </p>
        </div>

        {/* Microphone Error Alert */}
        {micError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 font-medium flex items-start gap-2.5 animate-fade-in max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* Recording Result Feedback Card */}
        {speechScore !== null && speechFeedback && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-left max-w-lg mx-auto animate-fade-in space-y-3 ${
              speechFeedback.isPass
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/90 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {speechFeedback.isPass ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm">{speechFeedback.title}</h4>
                  <p className="text-xs font-medium opacity-90">{speechFeedback.message}</p>
                </div>
              </div>

              <div className="shrink-0 px-3 py-1 rounded-xl bg-white border font-mono font-black text-xs shadow-2xs">
                {speechScore}%
              </div>
            </div>

            {speechTranscript && (
              <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-xs font-semibold text-slate-700">
                Nhận diện giọng bạn: <span className="text-blue-700 italic font-mono">"{speechTranscript}"</span>
              </div>
            )}

            {speechFeedback.isPass && (
              <p className="text-[11px] font-bold text-emerald-700">
                ⚡ Đạt chuẩn! Tự động chuyển từ tiếp theo sau 1,5 giây...
              </p>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isRecording}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Thu âm lại</span>
          </button>

          <button
            type="button"
            onClick={handleNextWord}
            disabled={isAdvancing}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <span>{currentIndex < vocabularies.length - 1 ? 'Từ tiếp theo' : 'Hoàn thành bước'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
