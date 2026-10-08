import React, { useState } from 'react';
import { MessageSquare, Volume2, UserCheck, Play } from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function ConversationSection({ conversations = [] }) {
  const [activeRole, setActiveRole] = useState('ALL'); // ALL | SpeakerA | SpeakerB

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có bài hội thoại cho bài học này.</p>
      </div>
    );
  }

  const current = conversations[0];
  const dialogueList = current.dialogue || [];

  // Extract unique speaker names
  const speakers = Array.from(new Set(dialogueList.map((d) => d.speaker)));

  const handlePlayLine = (text) => {
    speakText(text);
  };

  const handlePlayAll = () => {
    let delay = 0;
    dialogueList.forEach((line) => {
      setTimeout(() => {
        speakText(line.text);
      }, delay);
      delay += (line.text.length / 8) * 1000 + 800;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Hội thoại giao tiếp
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">{current.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{current.context}</p>
          </div>

          <button
            onClick={handlePlayAll}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition shadow-sm"
          >
            <Play className="w-4 h-4 fill-rose-600" />
            <span>Nghe toàn bộ hội thoại</span>
          </button>
        </div>

        {/* Role Selection for Practice Mode */}
        {speakers.length >= 2 && (
          <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Chọn vai để luyện đọc:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveRole('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeRole === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cả hai
              </button>
              {speakers.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setActiveRole(sp)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    activeRole === sp
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Vai {sp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dialogue Stream */}
        <div className="mt-6 space-y-4">
          {dialogueList.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const isMyRole = activeRole === 'ALL' || activeRole === item.speaker;

            return (
              <div
                key={idx}
                className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-bold text-slate-600">{item.speaker}</span>
                  {activeRole === item.speaker && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.2 rounded-full">
                      Vai của bạn
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-md p-4 rounded-2xl shadow-sm border transition ${
                    isLeft
                      ? 'bg-white border-slate-200 text-slate-900 rounded-tl-sm'
                      : 'bg-blue-50 border-blue-200 text-blue-950 rounded-tr-sm'
                  } ${!isMyRole ? 'opacity-60' : 'ring-1 ring-blue-500/10'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-relaxed">
                      {item.text}
                    </p>
                    <button
                      onClick={() => handlePlayLine(item.text)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white/80 transition shrink-0"
                      title="Nghe câu này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.meaning && (
                    <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 italic">
                      → {item.meaning}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
