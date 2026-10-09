import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function ListeningSection({ listenings = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});

  useEffect(() => {
    // Stop audio when component unmounts
    return () => {
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
      // Auto reset play icon after approximate duration
      const duration = Math.max(3000, (current.transcript.length / 8) * 1000);
      setTimeout(() => {
        setIsPlaying(false);
      }, duration);
    }
  };

  const handleSelectOption = (qIdx, option) => {
    if (showFeedback[qIdx]) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleCheckAnswer = (qIdx, correctAnswer) => {
    const selected = userAnswers[qIdx];
    if (!selected) return;

    const isMatch = selected.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setShowFeedback((prev) => ({
      ...prev,
      [qIdx]: { isCorrect: isMatch },
    }));
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Audio Player Main Card */}
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
            Lắng nghe cẩn thận đoạn văn bản bằng giọng bản ngữ chuẩn US để trả lời các câu hỏi bên dưới.
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
        <div className="pt-2">
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

      {/* Listening Comprehension Questions */}
      {questionsList.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-lg text-slate-900">
                  Câu hỏi nghe hiểu ({questionsList.length} câu)
                </h4>
                <p className="text-xs text-slate-500">
                  Kiểm tra độ nắm bắt thông điệp và từ khóa từ đoạn audio
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {questionsList.map((q, qIndex) => {
              const selected = userAnswers[qIndex];
              const feedback = showFeedback[qIndex];
              const isChecked = !!feedback;
              const isCorrect = feedback?.isCorrect;

              return (
                <div
                  key={qIndex}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {qIndex + 1}
                    </span>
                    <p className="font-bold text-sm text-slate-800 leading-snug">
                      {q.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options && q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === opt;
                      let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

                      if (isChecked) {
                        if (opt.toLowerCase() === q.correctAnswer.toLowerCase()) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                        } else if (isOptionSelected) {
                          btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20';
                        }
                      } else if (isOptionSelected) {
                        btnStyle = 'bg-purple-50 border-purple-600 text-purple-900 font-bold ring-2 ring-purple-500/20';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIndex, opt)}
                          disabled={isChecked}
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isChecked && opt.toLowerCase() === q.correctAnswer.toLowerCase() && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isChecked && isOptionSelected && opt.toLowerCase() !== q.correctAnswer.toLowerCase() && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action check button */}
                  {!isChecked && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleCheckAnswer(qIndex, q.correctAnswer)}
                        disabled={!selected}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition disabled:opacity-40 shadow-xs"
                      >
                        Kiểm tra đáp án
                      </button>
                    </div>
                  )}

                  {/* Explanation feedback */}
                  {isChecked && (
                    <div
                      className={`p-4 rounded-xl border text-xs animate-fade-in space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <p className="font-bold flex items-center gap-1.5">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Chính xác!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span>Chưa chính xác. Đáp án đúng: "{q.correctAnswer}".</span>
                          </>
                        )}
                      </p>
                      {q.explanation && (
                        <p className="text-slate-600 pt-0.5 leading-relaxed">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
