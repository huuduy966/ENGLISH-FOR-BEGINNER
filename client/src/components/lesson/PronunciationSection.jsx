import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { speakText, createSpeechRecognizer } from '../../utils/speech';

export default function PronunciationSection({ vocabularies = [] }) {
  const [selectedWord, setSelectedWord] = useState(vocabularies[0] || null);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có dữ liệu phát âm cho bài học này.</p>
      </div>
    );
  }

  const handleStartRecording = () => {
    setError('');
    setSpokenText('');
    setScore(null);

    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setSpokenText(transcript);
        setIsRecording(false);

        // Simple fuzzy match comparison
        const target = selectedWord.word.toLowerCase().trim();
        const spoken = transcript.toLowerCase().trim();

        if (spoken.includes(target) || target.includes(spoken)) {
          setScore(95);
        } else {
          // Compare edit distance roughly
          let matchChars = 0;
          for (let i = 0; i < Math.min(target.length, spoken.length); i++) {
            if (target[i] === spoken[i]) matchChars++;
          }
          const calculatedScore = Math.max(Math.round((matchChars / target.length) * 100), 40);
          setScore(calculatedScore);
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Word Picker Pill list */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {vocabularies.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setSelectedWord(v);
              setScore(null);
              setSpokenText('');
              setError('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedWord?.id === v.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {v.word}
          </button>
        ))}
      </div>

      {/* Pronunciation Card */}
      {selectedWord && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Luyện phát âm chuẩn
          </span>

          <h2 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">
            {selectedWord.word}
          </h2>
          <p className="text-lg font-mono text-blue-600 font-semibold mt-1">
            {selectedWord.pronunciation}
          </p>
          <p className="text-sm text-slate-500 mt-1">({selectedWord.meaning})</p>

          {/* Audio listen button */}
          <div className="mt-6">
            <button
              onClick={() => speakText(selectedWord.word)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Nghe giọng đọc mẫu</span>
            </button>
          </div>

          {/* Record button */}
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

          {/* Result Feedback */}
          {score !== null && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 animate-fade-in text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Độ chính xác nhận diện:</span>
                <span className={`text-sm font-extrabold ${score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {score}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">
                Bạn đã phát âm là: <strong className="text-slate-900">"{spokenText || selectedWord.word}"</strong>
              </p>
              {score >= 70 ? (
                <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Phát âm rất tốt! Hãy tiếp tục duy trì nhé 👍
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-600 mt-2">
                  Gần đúng rồi! Hãy nghe lại phát âm mẫu và thử lại nhé.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
