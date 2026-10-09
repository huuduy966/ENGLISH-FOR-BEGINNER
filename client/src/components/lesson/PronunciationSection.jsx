import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Check,
  Mic,
} from 'lucide-react';
import { speakText, createSpeechRecognizer } from '../../utils/speech';

export default function PronunciationSection({ vocabularies = [], onStepComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, explanation: string }
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [completedWordIds, setCompletedWordIds] = useState(new Set());
  const [allDone, setAllDone] = useState(false);

  // Speech Recognition optional support
  const [isRecording, setIsRecording] = useState(false);
  const [speechScore, setSpeechScore] = useState(null);
  const [speechText, setSpeechText] = useState('');

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

  // Reset question state when index changes
  useEffect(() => {
    clearAutoAdvanceTimer();
    setSelectedOption(null);
    setFeedback(null);
    setSpeechScore(null);
    setSpeechText('');
  }, [currentIndex]);

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài luyện phát âm cho bài học này.</p>
      </div>
    );
  }

  const currentWord = vocabularies[currentIndex] || vocabularies[0];

  // Generate Vietnamese phonetic guide
  const getPhoneticGuide = (word, ipa) => {
    return `Khi phát âm "${word}" (${ipa}), chú ý mở khẩu hình tự nhiên, bật hơi rõ âm đầu và nhấn đúng trọng âm vào âm tiết chính.`;
  };

  // Generate 4 phonetic options for recognition exercise
  const generatePhoneticOptions = () => {
    const correctIPA = currentWord.pronunciation || `/${currentWord.word.toLowerCase()}/`;
    const otherWords = vocabularies.filter((v) => v.id !== currentWord.id);
    const distractor1 = otherWords[0]?.pronunciation || '/ˈwɜːrd/';
    const distractor2 = otherWords[1]?.pronunciation || '/ˈspensɪv/';
    const distractor3 = otherWords[2]?.pronunciation || '/ˈlɪsən/';

    const options = [correctIPA, distractor1, distractor2, distractor3].filter(
      (v, i, a) => a.indexOf(v) === i
    );
    while (options.length < 4) {
      options.push(`/${currentWord.word.toLowerCase()}_alt${options.length}/`);
    }
    return options.sort(() => 0.5 - Math.random());
  };

  const [phoneticOptions, setPhoneticOptions] = useState(() => generatePhoneticOptions());

  useEffect(() => {
    setPhoneticOptions(generatePhoneticOptions());
  }, [currentIndex, currentWord]);

  // Handle Option Select with strict 1.5s Auto-Advance
  const handleSelectPhoneticOption = (opt) => {
    if (isAdvancing || feedback?.isCorrect) return;

    setSelectedOption(opt);
    const correctIPA = currentWord.pronunciation;
    const isMatch = opt.trim().toLowerCase() === correctIPA.trim().toLowerCase();

    if (isMatch) {
      setFeedback({
        isCorrect: true,
        explanation: `Tuyệt vời! Phiên âm chuẩn IPA của "${currentWord.word}" là ${correctIPA}.`,
      });

      const nextCompleted = new Set(completedWordIds);
      nextCompleted.add(currentWord.id);
      setCompletedWordIds(nextCompleted);

      // Trigger 1.5s Auto-advance
      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentIndex < vocabularies.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Last word finished!
          setAllDone(true);
          if (onStepComplete) onStepComplete(true);
        }
      }, 1500);
    } else {
      // Wrong answer: DO NOT auto-advance. Allow retry!
      setFeedback({
        isCorrect: false,
        explanation: `Chưa chính xác. Hãy nghe lại phát âm mẫu và quan sát kỹ các ký tự phiên âm IPA.`,
      });
    }
  };

  // Speech recognition practice
  const handleMicPractice = () => {
    clearAutoAdvanceTimer();
    setSpeechText('');
    setSpeechScore(null);
    setIsRecording(true);

    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setSpeechText(transcript);
        setIsRecording(false);
        const target = currentWord.word.toLowerCase().trim();
        const spoken = transcript.toLowerCase().trim();

        let calculatedScore = 50;
        if (spoken.includes(target) || target.includes(spoken)) {
          calculatedScore = 95;
        } else {
          let matchChars = 0;
          for (let i = 0; i < Math.min(target.length, spoken.length); i++) {
            if (target[i] === spoken[i]) matchChars++;
          }
          calculatedScore = Math.max(Math.round((matchChars / target.length) * 100), 50);
        }
        setSpeechScore(calculatedScore);
      },
      onError: () => setIsRecording(false),
      onEnd: () => setIsRecording(false),
    });

    recognizer.start();
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
            Hoàn thành Bước 2: Phát âm!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Bạn đã nhận diện và luyện phát âm xuất sắc toàn bộ {vocabularies.length} từ vựng trong bài.
          </p>
        </div>
        <div className="pt-2">
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
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black text-slate-800">
            Từ phát âm {currentIndex + 1} / {vocabularies.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {currentWord.category || 'Pronunciation'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">
            Đã đạt: <strong className="text-emerald-600">{completedWordIds.size}</strong> / {vocabularies.length} từ
          </span>
        </div>
      </div>

      {/* Main Pronunciation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Word Display & Model Audio */}
        <div className="text-center space-y-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Từ vựng trọng tâm:
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {currentWord.word}
          </h2>
          <p className="text-xl sm:text-2xl font-mono text-blue-600 font-bold tracking-wider">
            {currentWord.pronunciation}
          </p>

          {/* Model Audio Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => speakText(currentWord.word)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-95"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nghe phát âm mẫu bản xứ</span>
            </button>
          </div>
        </div>

        {/* Vietnamese Mouth-Shape & Difficult Sound Guide */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Hướng dẫn mở khẩu hình & âm khó:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {getPhoneticGuide(currentWord.word, currentWord.pronunciation)}
          </p>
        </div>

        {/* Interactive Phonetic Recognition Exercise */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-sm text-slate-800">
              Bài tập nhận diện âm: Chọn ký hiệu phiên âm IPA chuẩn của từ trên:
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {phoneticOptions.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              let style = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

              if (feedback) {
                if (opt.trim().toLowerCase() === currentWord.pronunciation.trim().toLowerCase()) {
                  style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  style = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPhoneticOption(opt)}
                  disabled={isAdvancing || feedback?.isCorrect}
                  className={`p-4 rounded-xl border text-sm font-mono font-bold transition flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {feedback && opt.trim().toLowerCase() === currentWord.pronunciation.trim().toLowerCase() && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {feedback && isSelected && !feedback.isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-Advance & Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fade-in flex items-start gap-3 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-extrabold text-sm">
                {feedback.isCorrect ? '🎉 Chính xác! Đang tự động chuyển từ tiếp theo sau 1,5 giây...' : 'Chưa chính xác!'}
              </p>
              <p className="text-xs text-slate-600">
                {feedback.explanation}
              </p>
              {!feedback.isCorrect && (
                <p className="text-[11px] font-bold text-rose-700 pt-1">
                  👉 Bạn hãy nghe lại phát âm mẫu và bấm chọn lại đáp án đúng.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Optional Microphone Self-Check */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleMicPractice}
            disabled={isRecording}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isRecording ? 'Đang lắng nghe giọng bạn...' : 'Thu âm thử giọng'}</span>
          </button>

          {speechScore !== null && (
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Độ chuẩn: {speechScore}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
