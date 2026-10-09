import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Volume2,
  UserCheck,
  Play,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { speakText } from '../../utils/speech';
import QuickDictionaryModal from '../common/QuickDictionaryModal';

export default function ConversationSection({ conversations = [] }) {
  const [activeRole, setActiveRole] = useState('ALL'); // ALL | SpeakerA | SpeakerB
  const [showTranslations, setShowTranslations] = useState(true);
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [lookupWord, setLookupWord] = useState('');

  // Interactive Situational Response Challenge state
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [responseFeedback, setResponseFeedback] = useState(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài hội thoại cho bài học này.</p>
      </div>
    );
  }

  const current = conversations[0];
  const dialogueList = current.dialogue || [];
  const speakers = Array.from(new Set(dialogueList.map((d) => d.speaker)));

  const handlePlayLine = (text) => {
    speakText(text);
  };

  const handlePlayAll = () => {
    window.speechSynthesis?.cancel();
    let delay = 0;
    dialogueList.forEach((line) => {
      setTimeout(() => {
        speakText(line.text);
      }, delay);
      delay += Math.max(2500, (line.text.length / 8) * 1000 + 800);
    });
  };

  // Situational question options derived from dialogue context
  const situationOptions = [
    { text: 'Sounds like a great idea! I would love to practice together.', isCorrect: true, exp: 'Câu đáp lại tích cực, lịch thiệp và tự nhiên nhất trong giao tiếp đời thường.' },
    { text: 'No, I have no time for this.', isCorrect: false, exp: 'Câu trả lời quá cụt lủn và thiếu nhã nhặn trong ngữ cảnh bạn bè / đồng nghiệp.' },
    { text: 'I don’t know what you are talking about.', isCorrect: false, exp: 'Thể hiện thái độ xa cách, không đóng góp vào dòng chảy hội thoại.' },
    { text: 'Maybe next month, please leave me alone.', isCorrect: false, exp: 'Cách nói thô lỗ, không phù hợp với chuẩn mực giao tiếp tiếng Anh.' },
  ];

  const handleCheckResponse = () => {
    if (!selectedResponse) return;
    setResponseFeedback({
      isCorrect: selectedResponse.isCorrect,
      explanation: selectedResponse.exp,
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
              Hội thoại giao tiếp thực tế (Dialogue Roleplay)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {current.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              {current.context}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePlayAll}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-rose-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Nghe toàn bộ hội thoại</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTranslations((prev) => !prev)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition"
              title="Ẩn / hiện bản dịch tiếng Việt"
            >
              {showTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTranslations ? 'Ẩn dịch' : 'Hiện dịch'}</span>
            </button>
          </div>
        </div>

        {/* Roleplay Selector */}
        {speakers.length >= 2 && (
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Chế độ đóng vai luyện phản xạ (Roleplay):</span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveRole('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeRole === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Cả hai vai
              </button>
              {speakers.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setActiveRole(sp)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    activeRole === sp
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Đóng vai: {sp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dialogue Turns List */}
        <div className="space-y-4 pt-2">
          {dialogueList.map((turn, tIdx) => {
            const isMyRole = activeRole !== 'ALL' && activeRole === turn.speaker;
            const isSpeakerA = turn.speaker === speakers[0];

            return (
              <div
                key={tIdx}
                className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                  isMyRole
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                    : isSpeakerA
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                {/* Speaker Avatar */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-xs ${
                    isSpeakerA
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {turn.speaker.charAt(0)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800">
                      {turn.speaker}
                      {isMyRole && (
                        <span className="ml-2 text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md uppercase font-extrabold">
                          Lượt bạn nói
                        </span>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePlayLine(turn.text)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Nghe câu này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed font-mono">
                    "{turn.text}"
                  </p>

                  {showTranslations && turn.meaning && (
                    <p className="text-xs text-slate-500 font-medium pt-0.5">
                      → {turn.meaning}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Situational Response Challenge */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-rose-50/70 via-slate-50 to-orange-50/70 border-2 border-rose-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Thực hành phản xạ tình huống (Situational Response Challenge):
            </h4>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            Dựa trên bối cảnh hội thoại trên, bạn hãy chọn câu đối đáp lịch sự và tự nhiên nhất để tiếp nối câu chuyện:
          </p>

          <div className="space-y-2.5">
            {situationOptions.map((opt, oIdx) => {
              const isSelected = selectedResponse === opt;
              let style = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

              if (responseFeedback) {
                if (opt.isCorrect) {
                  style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  style = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20';
                }
              } else if (isSelected) {
                style = 'bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/20';
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => !responseFeedback && setSelectedResponse(opt)}
                  disabled={!!responseFeedback}
                  className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${style}`}
                >
                  <span>{opt.text}</span>
                  {responseFeedback && opt.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {responseFeedback && isSelected && !opt.isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {!responseFeedback ? (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCheckResponse}
                disabled={!selectedResponse}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition disabled:opacity-40"
              >
                Xác nhận câu trả lời
              </button>
            </div>
          ) : (
            <div
              className={`p-4 rounded-xl border text-xs animate-fade-in space-y-1 ${
                responseFeedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {responseFeedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Lựa chọn xuất sắc!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Chưa phù hợp. Hãy đọc giải thích bên dưới:</span>
                  </>
                )}
              </p>
              <p className="text-slate-600 pt-0.5 leading-relaxed">
                💡 {responseFeedback.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      <QuickDictionaryModal
        word={lookupWord}
        isOpen={dictModalOpen}
        onClose={() => setDictModalOpen(false)}
      />
    </div>
  );
}
