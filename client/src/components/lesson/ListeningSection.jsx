import React, { useState } from 'react';
import { Headphones, Play, Pause, RotateCcw, Eye, EyeOff, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function ListeningSection({ listenings = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  if (!listenings || listenings.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có bài luyện nghe cho bài học này.</p>
      </div>
    );
  }

  const current = listenings[0];

  const handlePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(current.transcript);
      // reset state when speech finishes
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, (current.transcript.length / 10) * 1000);
    }
  };

  const handleAnswer = (qIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Audio Player Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
          <Headphones className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          Listening Practice
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-2">{current.title}</h3>

        {/* Audio controller bar */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-4">
          <button
            onClick={handlePlayAudio}
            className={`p-4 rounded-full font-bold shadow-md transition active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-amber-500/25'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <div className="text-left">
            <p className="text-xs font-semibold text-slate-700">
              {isPlaying ? 'Đang phát âm giọng bản xứ...' : 'Bấm Play để nghe đoạn audio'}
            </p>
            <p className="text-[11px] text-slate-400">Giọng chuẩn tiếng Anh Mỹ (US Accent)</p>
          </div>
        </div>

        {/* Transcript toggle */}
        <div className="mt-5">
          <button
            onClick={() => setShowTranscript((prev) => !prev)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1.5 transition"
          >
            {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showTranscript ? 'Ẩn bản phụ đề (Hide Transcript)' : 'Xem bản phụ đề (Show Transcript)'}</span>
          </button>

          {showTranscript && (
            <div className="mt-3 p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-left text-sm text-slate-800 font-medium leading-relaxed animate-fade-in">
              {current.transcript}
            </div>
          )}
        </div>
      </div>

      {/* Comprehension Questions */}
      {current.questions && current.questions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h4 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Câu hỏi kiểm tra khả năng nghe:
          </h4>

          {current.questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-3">
              <p className="text-sm font-bold text-slate-800">
                {qIdx + 1}. {q.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = answers[qIdx] === opt;
                  const isCorrect = opt === q.correctAnswer;
                  let btnStyle = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                  if (checked) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-purple-600 bg-purple-50 text-purple-900 font-bold';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleAnswer(qIdx, opt)}
                      className={`p-3 rounded-xl border text-xs text-left transition ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {checked && q.explanation && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 inline" />
                  <span>{q.explanation}</span>
                </p>
              )}
            </div>
          ))}

          <button
            onClick={() => setChecked(true)}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 transition"
          >
            Kiểm tra đáp án nghe
          </button>
        </div>
      )}
    </div>
  );
}
