import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  MessageSquare,
  Search,
  Headphones,
  FileText,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  Trophy,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import DailyPracticeModal from './DailyPracticeModal';

export default function TodaysLearningCard({ onScoreUpdated }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetPart, setModalTargetPart] = useState(1);
  const [modalTargetIndex, setModalTargetIndex] = useState(0);

  const fetchDailySession = () => {
    api.get('/daily-practice/today')
      .then((res) => {
        setSession(res.data.session);
      })
      .catch((err) => {
        console.error('Fetch daily practice session error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDailySession();
  }, []);

  const handleStartPractice = (partNum = null, qIndex = 0) => {
    if (!session) return;
    const targetPart = partNum !== null ? partNum : (session.activePartNumber || 1);
    const targetQ = partNum !== null ? qIndex : (session.activeQuestionIndex || 0);

    setModalTargetPart(targetPart);
    setModalTargetIndex(targetQ);
    setModalOpen(true);
  };

  const handleSessionUpdated = (updatedSession) => {
    setSession(updatedSession);
    if (onScoreUpdated) {
      onScoreUpdated();
    }
  };

  // Format today's date in Vietnamese: e.g. "Hôm nay, 09/10/2026"
  const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `Hôm nay, ${day}/${month}/${year}`;
  };

  const completedCount = session?.completedCount || 0;
  const totalCount = session?.totalQuestions || 60;
  const remainingCount = session?.remainingCount || 60;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Metadata for the 5 mission cards
  const MISSION_CARDS = [
    {
      partNumber: 1,
      title: 'Từ vựng',
      subtitle: '20 câu',
      desc: 'Nghĩa từ, ngữ cảnh và hoàn thành câu',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
      activeBorder: 'border-blue-400 hover:border-blue-500',
    },
    {
      partNumber: 2,
      title: 'Luyện nói',
      subtitle: '10 câu',
      desc: 'Tình huống giao tiếp và đối đáp tự nhiên',
      icon: MessageSquare,
      color: 'text-rose-500 bg-rose-50 border-rose-100',
      activeBorder: 'border-rose-300 hover:border-rose-400',
    },
    {
      partNumber: 3,
      title: 'Tìm & sửa lỗi sai',
      subtitle: '2 bài, 10 câu',
      desc: 'Nhận diện và sửa lỗi ngữ pháp, dùng từ',
      icon: Search,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
      activeBorder: 'border-amber-300 hover:border-amber-400',
    },
    {
      partNumber: 4,
      title: 'Luyện nghe',
      subtitle: '2 bài, 10 câu',
      desc: 'Nghe hiểu 2 bài audio bản ngữ chuẩn US',
      icon: Headphones,
      color: 'text-purple-500 bg-purple-50 border-purple-100',
      activeBorder: 'border-purple-300 hover:border-purple-400',
    },
    {
      partNumber: 5,
      title: 'Luyện đọc',
      subtitle: '2 bài, 10 câu',
      desc: 'Đọc hiểu 2 đoạn văn tiếng Anh chuyên đề',
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      activeBorder: 'border-emerald-300 hover:border-emerald-400',
    },
  ];

  return (
    <>
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider">
                Hôm nay học gì?
              </span>
              <span className="text-xs font-semibold text-slate-500">
                • {getFormattedDate()}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold text-[11px] uppercase">
                Cấp độ {session?.level || 'A1'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mục Tiêu Luyện Tập 60 Câu Hôm Nay
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bộ câu hỏi chọn lọc độc quyền theo trình độ <strong className="text-blue-600">{session?.level || 'A1'}</strong>. Trả lời đúng +4 điểm, sai -2 điểm.
            </p>
          </div>

          {/* Quick Score and Start Button */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Điểm hôm nay
              </p>
              <p className="text-xl font-black text-blue-600">
                +{session?.score || 0} điểm
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleStartPractice()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{completedCount > 0 && !session?.completed ? 'TIẾP TỤC LÀM BÀI' : 'BẮT ĐẦU NGAY (60 CÂU)'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-2">
              <span>Đã hoàn thành: <strong>{completedCount} / {totalCount}</strong> câu</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 font-medium">Còn lại: {remainingCount} câu</span>
            </span>
            <span className="text-blue-600 font-black">{progressPercent}%</span>
          </div>

          <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-2xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 5 Mission Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          {MISSION_CARDS.map((card) => {
            const Icon = card.icon;
            const partData = session?.partsSummary?.find((p) => p.partNumber === card.partNumber);
            const partDone = partData?.isCompleted || false;
            const partProgress = partData?.completedCount || 0;
            const partTarget = partData?.targetCount || (card.partNumber === 1 ? 20 : 10);
            const isCurrentActive = session?.activePartNumber === card.partNumber && !session?.completed;

            return (
              <div
                key={card.partNumber}
                onClick={() => handleStartPractice(card.partNumber, 0)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                  partDone
                    ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                    : isCurrentActive
                    ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-500/15 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {partDone ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã xong</span>
                      </span>
                    ) : isCurrentActive ? (
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md animate-pulse">
                        Đang làm
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        Phần {card.partNumber}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      {card.title}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                      {card.subtitle}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Progress bar inside card */}
                <div className="pt-2 border-t border-slate-100/80 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Tiến độ</span>
                    <span>{partProgress} / {partTarget}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        partDone ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.round((partProgress / partTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Practice Runner Modal */}
      {modalOpen && (
        <DailyPracticeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialPartNumber={modalTargetPart}
          initialQuestionIndex={modalTargetIndex}
          sessionData={session}
          onSessionUpdated={handleSessionUpdated}
        />
      )}
    </>
  );
}
