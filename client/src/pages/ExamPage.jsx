import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Volume2,
  Pause,
  Play,
  Award,
  BookOpen,
  Search,
  Headphones,
  FileText,
  ListOrdered,
  Save,
  Check,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { speakText } from '../utils/speech';

function renderFormattedPrompt(text) {
  if (!text || typeof text !== 'string') return text;
  if (!text.includes('<u>')) return text;

  const parts = text.split(/(<\/?u>)/g);
  let isUnderline = false;
  return parts.map((part, idx) => {
    if (part === '<u>') {
      isUnderline = true;
      return null;
    }
    if (part === '</u>') {
      isUnderline = false;
      return null;
    }
    if (isUnderline) {
      return (
        <span
          key={idx}
          className="underline underline-offset-4 decoration-1 decoration-black font-semibold text-slate-900 inline-block px-0.5"
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function ExamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const setLockLayout = outletCtx?.setLockLayout;

  // Mode: 'INTRO' | 'TAKING' | 'RESULT'
  const [viewMode, setViewMode] = useState('INTRO');
  const [loading, setLoading] = useState(true);
  const [introData, setIntroData] = useState(null);

  // Lock layout (hide both Header and Sidebar, expand to full screen) during exam taking mode
  useEffect(() => {
    const isLocked = viewMode === 'TAKING';
    if (setLockLayout) {
      setLockLayout(isLocked);
    }
    return () => {
      if (setLockLayout) {
        setLockLayout(false);
      }
    };
  }, [viewMode, setLockLayout]);

  // Taking Exam State
  const [attemptId, setAttemptId] = useState(null);
  const [examParts, setExamParts] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Audio state for Listening section
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Result state
  const [resultData, setResultData] = useState(null);
  const [resultFilter, setResultFilter] = useState('ALL'); // 'ALL' | 'WRONG' | 'CORRECT'

  // Debounced auto-save timer
  const autoSaveTimerRef = useRef(null);

  // 1. Load Intro / Check for active attempt on mount
  const fetchIntroAndActive = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exam/intro');
      setIntroData(res.data);

      // If active attempt is still running, check with /exam/current
      if (res.data?.activeAttempt?.attemptId) {
        try {
          const currentRes = await api.get('/exam/current');
          if (currentRes.data?.parts && !currentRes.data?.isCompleted) {
            setAttemptId(currentRes.data.attemptId);
            setExamParts(currentRes.data.parts);
            setExamTitle(currentRes.data.examTitle);
            setCurrentPage(currentRes.data.currentPage || 1);
            setAnswers(currentRes.data.answers || {});
            setRemainingSeconds(currentRes.data.remainingSeconds || 3600);
            setViewMode('TAKING');
            setLoading(false);
            return;
          }
        } catch {}
      }
    } catch (err) {
      console.error('Fetch exam intro error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntroAndActive();
  }, []);

  // 2. Countdown Timer when in TAKING mode
  useEffect(() => {
    if (viewMode !== 'TAKING') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, attemptId, answers]);

  // 3. Browser beforeunload listener to warn on leaving page
  useEffect(() => {
    if (viewMode !== 'TAKING') return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Bài thi đang diễn ra! Bạn không thể thoát ra ngoài khi chưa nộp bài.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [viewMode]);

  // 4. Trap browser back navigation and prevent escaping during exam
  useEffect(() => {
    if (viewMode !== 'TAKING') return;

    // Push dummy history entry to trap back button
    window.history.pushState({ examLocked: true }, '', window.location.href);

    const handlePopState = () => {
      // Re-push state immediately to block back navigation
      window.history.pushState({ examLocked: true }, '', window.location.href);
      alert('Bài thi đang diễn ra! Bạn không thể thoát ra ngoài hoặc quay lại trang trước khi chưa nộp bài.');
    };

    const handleKeyDown = (e) => {
      // Prevent Alt + Left Arrow (browser back shortcut)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode]);

  // Lock body scroll when either modal is open
  useEffect(() => {
    if (confirmStartOpen || confirmSubmitOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [confirmStartOpen, confirmSubmitOpen]);

  // Safe Escape key handler to cancel/close modals without unintended action
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (confirmStartOpen) setConfirmStartOpen(false);
        if (confirmSubmitOpen) setConfirmSubmitOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmStartOpen, confirmSubmitOpen]);

  // Debounced auto-save function
  const triggerAutoSave = (newAnswers, pageToSave = currentPage) => {
    if (!attemptId || viewMode !== 'TAKING') return;
    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await api.post('/exam/save-progress', {
          attemptId,
          answers: newAnswers,
          currentPage: pageToSave,
        });
        setSaveStatus('saved');
      } catch (err) {
        console.warn('Auto-save error:', err.message);
        setSaveStatus('error');
      }
    }, 1000);
  };

  // Handle Input Change for any question
  const handleAnswerChange = (questionId, value) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    triggerAutoSave(updated, currentPage);
  };

  // Start new exam
  const handleStartExam = async () => {
    setConfirmStartOpen(false);
    setLoading(true);
    try {
      const res = await api.post('/exam/start');
      setAttemptId(res.data.attemptId);
      setExamParts(res.data.parts);
      setExamTitle(res.data.examTitle);
      setCurrentPage(res.data.currentPage || 1);
      setAnswers(res.data.answers || {});
      setRemainingSeconds(res.data.remainingSeconds || 3600);
      setViewMode('TAKING');
    } catch (err) {
      alert('Không thể khởi tạo bài thi. Vui lòng thử lại.');
      console.error('Start exam error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit on time expiry
  const handleAutoSubmitOnTimeout = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post('/exam/submit', {
        attemptId,
        answers,
      });
      setResultData(res.data);
      setViewMode('RESULT');
      alert('Hết giờ làm bài! Hệ thống đã tự động khóa và nộp bài thi của bạn.');
    } catch (err) {
      console.error('Auto submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Manual submit by student
  const handleManualSubmit = async () => {
    setConfirmSubmitOpen(false);
    setSubmitting(true);
    try {
      const res = await api.post('/exam/submit', {
        attemptId,
        answers,
      });
      setResultData(res.data);
      setViewMode('RESULT');
    } catch (err) {
      alert('Có lỗi khi nộp bài thi. Vui lòng kiểm tra kết nối mạng và thử lại.');
      console.error('Manual submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Switch page in TAKING mode
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > 6) return;
    setCurrentPage(newPage);
    triggerAutoSave(answers, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate formatted time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate total answered questions
  const totalQuestions = 40;
  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Audio Playback Handler for Listening section
  const handlePlayAudio = (text) => {
    if (!text) return;
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(text);
      const estDuration = Math.max(4000, (text.split(/\s+/).length / 2.3) * 1000);
      setTimeout(() => setIsPlayingAudio(false), estDuration);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Đang chuẩn bị đề thi năng lực chuyên sâu...</p>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 1: INTRO SCREEN
  // =========================================================================
  if (viewMode === 'INTRO') {
    const hasActive = !!introData?.activeAttempt?.attemptId;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          {/* Subtle decorative glow circles */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-cyan-300/15 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-2xs">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Kỳ Thi Đánh Giá Năng Lực Chuẩn CEFR</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {(introData?.examTitle || 'Bài Kiểm Tra Năng Lực Tiếng Anh Chuyên Sâu').replace(/\s*\([^)]*Enhanced[^)]*\)/gi, '').trim()}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center gap-1.5 text-white">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Thời gian: <strong>60 phút</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center gap-1.5 text-white">
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Quy mô: <strong>40 câu tự luận</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center gap-1.5 text-white">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Thang điểm: <strong>10.0 điểm</strong> (0.25đ / câu)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Active Attempt Resume Alert */}
        {hasActive && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Bạn đang có một bài thi chưa nộp!</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Thời gian làm bài vẫn đang được tính: còn lại{' '}
                  <strong className="text-rose-600">{formatTime(introData.activeAttempt.remainingSeconds)}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition shrink-0"
            >
              Tiếp tục bài thi đang làm
            </button>
          </div>
        )}

        {/* 5 Parts Structure Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cấu trúc đề thi</h3>
              <p className="text-xs text-slate-400">100% câu hỏi tự luận</p>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Thang 10 điểm
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {introData?.partsOverview?.map((p) => (
              <div
                key={p.partNumber}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 text-sm">Phần {p.partNumber}: {p.name}</span>
                    <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                      {p.questionsCount} câu • {p.maxScore}đ
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1 leading-relaxed">{p.format}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Regulations & Guidelines */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5">
            <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Quy chế & Lưu ý quan trọng khi làm bài:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Thời gian <strong>60 phút</strong> đếm ngược liên tục ngay khi bấm bắt đầu. Tải lại trang không làm mất thời gian.</li>
              <li>Hệ thống <strong>tự động lưu bài làm</strong> sau mỗi thay đổi và tự động nộp bài khi đồng hồ điểm 00:00.</li>
              <li>Sau khi nộp bài, hệ thống sẽ chấm điểm chi tiết trên thang 10 và mở khóa toàn bộ đáp án giải thích.</li>
            </ul>
          </div>

          {/* Action Start Button */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmStartOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition flex items-center gap-2 active:scale-95"
            >
              <span>BẮT ĐẦU LÀM BÀI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal 1: Confirm Start (Remade from scratch) */}
        {confirmStartOpen && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 w-screen h-screen h-[100dvh] bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, zIndex: 100 }}
            onClick={() => setConfirmStartOpen(false)}
          >
            <div
              className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 sm:p-7 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Close Button */}
              <button
                type="button"
                onClick={() => setConfirmStartOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Centered Icon Badge */}
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-inner mt-1">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Bắt đầu làm bài thi?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Đề thi chuẩn CEFR cấp độ <strong className="text-blue-600 font-bold">{introData?.level || 'A1'}</strong>. Đồng hồ đếm ngược 60 phút sẽ bắt đầu tính ngay sau khi bạn xác nhận.
                </p>
              </div>

              {/* 3 Metric Stats Pill Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Thời gian</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">60 phút</span>
                </div>
                <div className="text-center border-x border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Quy mô</span>
                  <span className="text-sm sm:text-base font-black text-blue-600">40 câu</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Thang điểm</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600">10.0 đ</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmStartOpen(false)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: EXAM TAKING SCREEN (6 PAGES)
  // =========================================================================
  if (viewMode === 'TAKING') {
    const currentPart = examParts.find((p) => p.pageNumber === currentPage) || examParts[0];

    // Determine timer color state
    let timerStyle = 'text-slate-800 bg-slate-100 border-slate-200';
    if (remainingSeconds <= 60) {
      timerStyle = 'text-rose-800 bg-rose-100 border-rose-300 animate-pulse font-black';
    } else if (remainingSeconds <= 300) {
      timerStyle = 'text-orange-800 bg-orange-100 border-orange-300 font-extrabold';
    } else if (remainingSeconds <= 900) {
      timerStyle = 'text-amber-800 bg-amber-100 border-amber-300 font-bold';
    }

    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-20 animate-fade-in select-none">
        {/* Top Floating Exam Sticky Bar */}
        <div className="sticky top-2 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Title & Page Badge */}
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              P{currentPage}
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                {currentPart?.shortTitle || 'Bài kiểm tra'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Đã làm: <strong className="text-blue-600 font-bold">{answeredCount}</strong> / 40 câu</span>
                <span>•</span>
                {saveStatus === 'saving' ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Đang lưu...
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Đã tự lưu
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Countdown Timer & Submit Button */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono text-sm ${timerStyle}`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
            >
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* 6-Page Quick Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs">
          {examParts.map((p) => {
            const pagePartQs = p.questions || [];
            const pageDoneCount = pagePartQs.filter((q) => answers[q.id] && answers[q.id].trim().length > 0).length;
            const isCurrent = p.pageNumber === currentPage;
            const isComplete = pageDoneCount === pagePartQs.length;

            return (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => handlePageChange(p.pageNumber)}
                className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-between gap-1 text-[11px] ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isComplete
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span className="truncate">T{p.pageNumber}. {p.shortTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isCurrent ? 'bg-white/20 text-white' : 'bg-white text-slate-600'}`}>
                  {pageDoneCount}/{pagePartQs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* =============================================================== */}
        {/* PAGE CONTENT CONTAINER */}
        {/* =============================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          {/* Header of Section */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                Trang {currentPage} / 6
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentPart?.shortTitle}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {currentPart?.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentPart?.instructions}
            </p>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PAGE 1: VOCABULARY FILL-IN (10 QUESTIONS) */}
          {/* ------------------------------------------------------------- */}
          {currentPage === 1 && (
            <div className="divide-y divide-slate-100">
              {currentPart.questions.map((q) => {
                const isAnswered = !!answers[q.id]?.trim();
                return (
                  <div key={q.id} className="py-6 first:pt-2 last:pb-2 space-y-3">
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                        <span className="font-bold text-blue-600 text-lg mr-2 select-none">
                          Câu {q.orderNumber}.
                        </span>
                        {q.prompt}
                      </p>
                    </div>

                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
                          Điền từ:
                        </span>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder=""
                            className={`w-full bg-transparent border-0 border-b-2 px-1 py-1.5 text-base sm:text-[17px] font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-0 transition-colors ${
                              isAnswered ? 'border-blue-500' : 'border-slate-300 focus:border-blue-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* PAGE 2: ERROR CORRECTION (10 QUESTIONS) */}
          {/* ------------------------------------------------------------- */}
          {currentPage === 2 && (
            <div className="divide-y divide-slate-100">
              {currentPart.questions.map((q) => {
                const isAnswered = !!answers[q.id]?.trim();
                return (
                  <div key={q.id} className="py-6 first:pt-2 last:pb-2 space-y-3">
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                        <span className="font-bold text-blue-600 text-lg mr-2 select-none">
                          Câu {q.orderNumber}.
                        </span>
                        {renderFormattedPrompt(q.prompt)}
                      </p>
                    </div>

                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
                          Sửa lỗi:
                        </span>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder=""
                            className={`w-full bg-transparent border-0 border-b-2 px-1 py-1.5 text-base sm:text-[17px] font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-0 transition-colors ${
                              isAnswered ? 'border-blue-500' : 'border-slate-300 focus:border-blue-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* PAGE 3: LISTENING COMPREHENSION (1 PASSAGE, 5 QUESTIONS) */}
          {/* ------------------------------------------------------------- */}
          {currentPage === 3 && (
            <div className="space-y-6">
              {/* Flat Audio Controller Bar */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-base text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                    <Headphones className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>{currentPart.audioTitle}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Lắng nghe thông tin chi tiết và điền câu trả lời cho 5 câu hỏi bên dưới.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentPart.audioText)}
                    className={`h-10 px-5 font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition active:scale-95 ${
                      isPlayingAudio
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Tạm dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Phát Audio</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.speechSynthesis?.cancel();
                      setIsPlayingAudio(false);
                      setTimeout(() => handlePlayAudio(currentPart.audioText), 150);
                    }}
                    className="h-10 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-semibold"
                    title="Nghe lại từ đầu"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Nghe lại</span>
                  </button>
                </div>
              </div>

              {/* 5 Subjective Listening Detail Questions */}
              <div className="divide-y divide-slate-100">
                {currentPart.questions.map((q) => {
                  const isAnswered = !!answers[q.id]?.trim();
                  return (
                    <div key={q.id} className="py-6 first:pt-4 last:pb-2 space-y-3">
                      <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                        <span className="font-bold text-blue-600 text-lg mr-2 select-none">
                          Câu {q.orderNumber}.
                        </span>
                        {q.prompt}
                      </p>

                      <div className="pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
                            Trả lời:
                          </span>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder=""
                              className={`w-full bg-transparent border-0 border-b-2 px-1 py-1.5 text-base sm:text-[17px] font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-0 transition-colors ${
                                isAnswered ? 'border-blue-500' : 'border-slate-300 focus:border-blue-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* PAGE 4 & 5: READING COMPREHENSION PASSAGES 1 & 2 */}
          {/* ------------------------------------------------------------- */}
          {(currentPage === 4 || currentPage === 5) && (
            <div className="space-y-6">
              {/* Reading Passage Paper Container */}
              <div className="p-6 bg-slate-50/70 border-l-4 border-l-blue-600 border border-slate-200 space-y-3">
                <div className="text-slate-900 font-bold text-base border-b border-slate-200 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{currentPart.readingTitle}</span>
                </div>
                <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal max-h-80 overflow-y-auto pr-2">
                  {currentPart.readingText}
                </div>
              </div>

              {/* 5 Subjective Questions */}
              <div className="divide-y divide-slate-100">
                {currentPart.questions.map((q) => {
                  const isAnswered = !!answers[q.id]?.trim();
                  return (
                    <div key={q.id} className="py-6 first:pt-4 last:pb-2 space-y-3">
                      <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                        <span className="font-bold text-blue-600 text-lg mr-2 select-none">
                          Câu {q.orderNumber}.
                        </span>
                        {q.prompt}
                      </p>

                      <div className="pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
                            Trả lời:
                          </span>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder=""
                              className={`w-full bg-transparent border-0 border-b-2 px-1 py-1.5 text-base sm:text-[17px] font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-0 transition-colors ${
                                isAnswered ? 'border-blue-500' : 'border-slate-300 focus:border-blue-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* PAGE 6: SENTENCE REORDERING (5 QUESTIONS) */}
          {/* ------------------------------------------------------------- */}
          {currentPage === 6 && (
            <div className="divide-y divide-slate-100">
              {currentPart.questions.map((q) => {
                const isAnswered = !!answers[q.id]?.trim();
                const jumbledDisplay = q.jumbledWords ? q.jumbledWords.join(' / ') : (q.prompt || '');
                return (
                  <div key={q.id} className="py-6 first:pt-2 last:pb-2 space-y-3">
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                        <span className="font-bold text-blue-600 text-lg mr-2 select-none">
                          Câu {q.orderNumber}.
                        </span>
                        <span className="font-semibold text-slate-900">
                          {jumbledDisplay}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 italic pl-1 font-normal">
                        Sắp xếp các từ trên thành một câu tiếng Anh hoàn chỉnh, đúng trật tự từ và ngữ pháp.
                      </p>
                    </div>

                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
                          Câu trả lời:
                        </span>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder=""
                            className={`w-full bg-transparent border-0 border-b-2 px-1 py-1.5 text-base sm:text-[17px] font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-0 transition-colors ${
                              isAnswered ? 'border-blue-500' : 'border-slate-300 focus:border-blue-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination & Action Buttons */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-40 flex items-center gap-1.5 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trang trước</span>
            </button>

            <div className="text-xs font-bold text-slate-400">
              Trang {currentPage} / 6
            </div>

            {currentPage < 6 ? (
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-95"
              >
                <span>Trang tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md shadow-emerald-500/25 flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>NỘP BÀI THI</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal 2: Confirm Submit (Remade from scratch) */}
        {confirmSubmitOpen && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 w-screen h-screen h-[100dvh] bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, zIndex: 100 }}
            onClick={() => setConfirmSubmitOpen(false)}
          >
            <div
              className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 sm:p-7 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Close Button */}
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Centered Icon Badge */}
              <div
                className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-inner mt-1 ${
                  unansweredCount > 0
                    ? 'bg-amber-50 border border-amber-200 text-amber-600'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                }`}
              >
                {unansweredCount > 0 ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                )}
              </div>

              {/* Title & Time remaining */}
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Xác nhận nộp bài thi?
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian còn lại: <strong className="font-mono text-slate-900">{formatTime(remainingSeconds)}</strong></span>
                </div>
              </div>

              {/* Progress Summary Card */}
              {unansweredCount > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-1 text-xs">
                  <p className="font-bold text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Đã làm {answeredCount}/40 câu (Còn {unansweredCount} câu chưa điền)</span>
                  </p>
                  <p className="text-amber-800 leading-relaxed pl-3.5">
                    Các câu chưa trả lời sẽ nhận 0 điểm. Bạn vẫn có thể quay lại làm tiếp trước khi hết giờ.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-1 text-xs">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã hoàn thành toàn bộ 40/40 câu hỏi</span>
                  </p>
                  <p className="text-emerald-800 leading-relaxed pl-5.5">
                    Hệ thống sẽ kết thúc lượt thi, chấm điểm thang 10 và hiển thị kết quả chi tiết ngay lập tức.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Làm tiếp</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleManualSubmit}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang nộp...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Nộp bài ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 3: RESULT SCREEN
  // =========================================================================
  if (viewMode === 'RESULT' && resultData) {
    const evalData = resultData.evaluation || {};
    const finalScore = resultData.score !== undefined ? resultData.score : (evalData.score || 0);
    const reviews = evalData.reviews || [];

    const filteredReviews = reviews.filter((r) => {
      if (resultFilter === 'CORRECT') return r.isCorrect;
      if (resultFilter === 'WRONG') return !r.isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
        {/* Score Summary Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className={`px-3 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wide inline-block mb-2 ${evalData.badgeColor || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              Xếp loại: {evalData.gradeTier || 'Hoàn thành'}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {finalScore.toFixed(2)} <span className="text-slate-400 text-2xl font-bold">/ 10.0</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
              {evalData.recommendation}
            </p>
          </div>

          {/* 3 Metric Pills */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-md mx-auto shadow-2xs text-center">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Số câu đúng</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5 truncate">
                {evalData.correctCount || 0} <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">/ 40</span>
              </p>
            </div>
            <div className="min-w-0 border-x border-slate-200 px-1 sm:px-2">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Số câu sai</p>
              <p className="text-lg sm:text-2xl font-black text-rose-500 mt-0.5 truncate">
                {evalData.wrongCount || 0}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Chưa trả lời</p>
              <p className="text-lg sm:text-2xl font-black text-slate-500 mt-0.5 truncate">
                {evalData.unansweredCount || 0}
              </p>
            </div>
          </div>

          {/* 5 Parts Score Breakdown Grid */}
          {evalData.partScores && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-left">
              {Object.entries(evalData.partScores).map(([k, p], idx) => (
                <div key={k} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phần {idx + 1}</p>
                  <p className="font-extrabold text-xs text-slate-800 truncate">{p.name}</p>
                  <p className="text-sm font-black text-blue-600">
                    {p.score.toFixed(2)} <span className="text-[10px] text-slate-400 font-semibold">/{p.maxScore}đ</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Weak Areas Recommendation Box */}
          {evalData.weakAreas && evalData.weakAreas.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2 text-xs">
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Nhóm kiến thức cần củng cố và ôn tập:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-amber-900">
                {evalData.weakAreas.map((area, aIdx) => (
                  <li key={aIdx}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Restart & Back */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setViewMode('INTRO');
                fetchIntroAndActive();
              }}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm bài kiểm tra mới</span>
            </button>

            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition shadow-2xs"
            >
              Về Trang chủ Dashboard
            </Link>
          </div>
        </div>

        {/* Detailed 40-Question Review Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chi tiết bài làm & Lời giải thích (40 câu)</h3>
              <p className="text-xs text-slate-400">Xem lại từng câu trả lời, đáp án chuẩn hóa và giải thích ngữ pháp chi tiết</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setResultFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${resultFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              >
                Tất cả (40)
              </button>
              <button
                type="button"
                onClick={() => setResultFilter('WRONG')}
                className={`px-3 py-1 rounded-lg transition ${resultFilter === 'WRONG' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Câu sai / Bỏ trống
              </button>
              <button
                type="button"
                onClick={() => setResultFilter('CORRECT')}
                className={`px-3 py-1 rounded-lg transition ${resultFilter === 'CORRECT' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Câu đúng
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2.5 transition ${
                  r.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : r.isUnanswered
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 text-white ${
                        r.isCorrect ? 'bg-emerald-600' : r.isUnanswered ? 'bg-slate-400' : 'bg-rose-500'
                      }`}
                    >
                      {r.orderNumber}
                    </span>
                    <p className="font-bold text-slate-900 text-sm leading-relaxed">
                      {renderFormattedPrompt(r.prompt)}
                    </p>
                  </div>

                  <span className="shrink-0 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md">
                    {r.isCorrect ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> +0.25đ
                      </span>
                    ) : r.isUnanswered ? (
                      <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                        Bỏ trống (0đ)
                      </span>
                    ) : (
                      <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Sai (0đ)
                      </span>
                    )}
                  </span>
                </div>

                <div className="pl-8 space-y-1.5 border-t border-slate-200/50 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500 font-semibold">Câu trả lời của bạn:</span>
                    <span className={`font-mono font-bold ${r.isCorrect ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {r.userAnswer || '(Bỏ trống)'}
                    </span>
                  </div>

                  {!r.isCorrect && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 font-semibold">Đáp án chuẩn xác:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {r.correctAnswer}
                      </span>
                    </div>
                  )}

                  {r.explanation && (
                    <p className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100 mt-1">
                      💡 <strong>Giải thích:</strong> {r.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
