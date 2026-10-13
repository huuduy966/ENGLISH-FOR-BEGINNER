import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import DailyPracticeModal from './DailyPracticeModal';
import {
  getVietnamDateString,
  formatVietnamDisplayDate,
  getMsUntilNextMidnightVN,
} from '../../utils/vietnamTime';

export default function TodaysLearningCard({ onScoreUpdated }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetPart, setModalTargetPart] = useState(1);
  const [modalTargetIndex, setModalTargetIndex] = useState(0);
  const [resetNotice, setResetNotice] = useState(null);

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

  // --- AUTOMATIC MIDNIGHT RESET HANDLER (00:00 Asia/Ho_Chi_Minh) ---
  const handleMidnightTransition = () => {
    // If modal is open, close it safely and alert the user
    if (modalOpen) {
      setModalOpen(false);
      alert('Bộ câu hỏi luyện tập 60 câu hôm nay đã được làm mới.');
    } else {
      setResetNotice('Bộ câu hỏi hôm nay đã được tạo mới.');
      setTimeout(() => setResetNotice(null), 6000);
    }

    // Refresh today's session and parent dashboard metrics
    fetchDailySession();
    if (onScoreUpdated) {
      onScoreUpdated();
    }
  };

  // 1. Precise Timer scheduled to fire at 00:00:00 Vietnam Time
  useEffect(() => {
    let timerId = null;

    const armMidnightTimer = () => {
      const ms = getMsUntilNextMidnightVN();
      timerId = setTimeout(() => {
        handleMidnightTransition();
        armMidnightTimer();
      }, ms);
    };

    armMidnightTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [session?.date, modalOpen]);

  // 2. Check on Tab Visibility / Window Focus (e.g. computer woke up from sleep past 00:00)
  useEffect(() => {
    const verifyDateFreshness = () => {
      const currentVnDate = getVietnamDateString();
      if (session && session.date && session.date !== currentVnDate) {
        handleMidnightTransition();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifyDateFreshness();
      }
    };

    window.addEventListener('focus', verifyDateFreshness);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', verifyDateFreshness);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.date, modalOpen]);

  const handleStartPractice = (partNum = null, qIndex = null) => {
    if (!session) return;
    const targetPart = partNum !== null ? partNum : (session.activePartNumber || session.currentPart || 1);
    const targetQ = qIndex !== null ? qIndex : (session.activeQuestionIndex !== undefined ? session.activeQuestionIndex : (session.currentQuestionIndex || 0));

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

  const completedCount = session?.completedCount || 0;
  const totalCount = session?.totalQuestions || 60;
  const remainingCount = session?.remainingCount || 60;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isDayCompleted = session?.completed || (completedCount >= totalCount && completedCount > 0);

  return (
    <>
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm p-4 sm:p-7 space-y-4 sm:space-y-6">
        {/* Reset Notification Banner if auto-reset happened */}
        {resetNotice && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between animate-fade-in shadow-2xs">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{resetNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setResetNotice(null)}
              className="text-blue-500 hover:text-blue-700 text-xs font-black"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                Hôm nay học gì?
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>• {formatVietnamDisplayDate(session?.date ? new Date() : new Date())}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold text-[10px] sm:text-[11px] uppercase">
                Cấp độ {session?.level || 'A1'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Mục Tiêu Luyện Tập 60 Câu Hôm Nay
            </h2>
          </div>

          {/* Quick Score and Start Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Điểm hôm nay
              </p>
              <p className="text-lg sm:text-xl font-black text-blue-600">
                +{session?.score || 0} điểm
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleStartPractice()}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 text-center ${
                isDayCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              {isDayCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>XEM KẾT QUẢ (60/60)</span>
                </>
              ) : completedCount > 0 ? (
                <>
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  <span>TIẾP TỤC LÀM BÀI</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  <span>BẮT ĐẦU NGAY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="space-y-1.5 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
          <div className="flex flex-wrap justify-between items-center gap-1 text-xs font-bold text-slate-600">
            <span className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span>Đã hoàn thành: <strong>{completedCount} / {totalCount}</strong> câu</span>
              <span className="text-slate-300 hidden xs:inline">•</span>
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
