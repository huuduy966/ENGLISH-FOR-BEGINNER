import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
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
  const isDayCompleted = session?.completed || (completedCount >= totalCount && completedCount > 0);

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
              className={`px-6 py-3 rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95 ${
                isDayCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              {isDayCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XEM KẾT QUẢ (60/60)</span>
                </>
              ) : completedCount > 0 ? (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>TIẾP TỤC LÀM BÀI</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>BẮT ĐẦU NGAY (60 CÂU)</span>
                </>
              )}
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
