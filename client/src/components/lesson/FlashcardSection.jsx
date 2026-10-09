import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Heart,
  Bookmark,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { speakText } from '../../utils/speech';
import api from '../../services/api';
import QuickDictionaryModal from '../common/QuickDictionaryModal';

export default function FlashcardSection({ vocabularies = [], onStepComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [vocabs, setVocabs] = useState(vocabularies);
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [viewedIndices, setViewedIndices] = useState(new Set([0]));

  useEffect(() => {
    setVocabs(vocabularies);
  }, [vocabularies]);

  // Track viewed words to gate step completion
  useEffect(() => {
    setViewedIndices((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      if (next.size >= vocabs.length && onStepComplete) {
        onStepComplete(true);
      }
      return next;
    });
  }, [currentIndex, vocabs.length, onStepComplete]);

  // Keyboard navigation support (ArrowLeft, ArrowRight, Space to flip)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, vocabs.length]);

  if (!vocabs || vocabs.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Bài học này chưa có từ vựng.</p>
      </div>
    );
  }

  const current = vocabs[currentIndex] || vocabs[0];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    const newStatus = !current.isFavorite;
    try {
      await api.post(`/vocabulary/${current.id}/status`, { isFavorite: newStatus });
      setVocabs((prev) =>
        prev.map((v, i) => (i === currentIndex ? { ...v, isFavorite: newStatus } : v))
      );
    } catch (err) {
      console.error('Update favorite error:', err);
    }
  };

  const handleToggleReview = async (e) => {
    e.stopPropagation();
    const nextStatus = current.status === 'NEED_REVIEW' ? 'LEARNING' : 'NEED_REVIEW';
    try {
      await api.post(`/vocabulary/${current.id}/status`, { status: nextStatus });
      setVocabs((prev) =>
        prev.map((v, i) => (i === currentIndex ? { ...v, status: nextStatus } : v))
      );
    } catch (err) {
      console.error('Update review status error:', err);
    }
  };

  const handleSpeak = (e, text = current.word) => {
    if (e) e.stopPropagation();
    speakText(text);
  };

  // Get color badges for part of speech
  const getPosBadge = (pos = '') => {
    const p = pos.toLowerCase();
    if (p.includes('noun')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (p.includes('verb')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (p.includes('adj')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (p.includes('adv')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (p.includes('phrase') || p.includes('idiom')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full space-y-3 animate-fade-in">
      {/* Top Header Card Info Bar */}
      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800">
            Từ {currentIndex + 1} / {vocabs.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            {current.category || 'General'}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            viewedIndices.size >= vocabs.length
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600'
          }`}>
            Đã xem {viewedIndices.size} / {vocabs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            ← → Chuyển từ • Space lật thẻ
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container - Compact & Sleek */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[260px] sm:min-h-[280px] cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`relative w-full min-h-[260px] sm:min-h-[280px] duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col justify-between backface-hidden">
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPosBadge(
                    current.partOfSpeech
                  )}`}
                >
                  {current.partOfSpeech || 'từ vựng'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Mặt trước
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDictModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition shadow-2xs"
                  title="Tra cứu từ điển chuyên sâu"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`p-1.5 rounded-lg transition shadow-2xs ${
                    current.isFavorite
                      ? 'bg-rose-50 text-rose-500 border border-rose-200'
                      : 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title="Thêm vào danh sách Yêu thích"
                >
                  <Heart className={`w-3.5 h-3.5 ${current.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`p-1.5 rounded-lg transition shadow-2xs ${
                    current.status === 'NEED_REVIEW'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title="Đánh dấu cần ôn tập kỹ"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${current.status === 'NEED_REVIEW' ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Central Rich Content Area */}
            <div className="my-auto py-1 text-center space-y-2">
              {/* Word & IPA */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {current.word}
                </h2>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-base sm:text-lg font-mono text-blue-600 font-bold">
                    {current.pronunciation}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(e, current.word)}
                    className="p-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Meaning and Example Preview Box */}
              <div className="max-w-lg mx-auto p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700">Nghĩa tiếng Việt:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {current.meaning}
                  </span>
                </div>

                {current.example && (
                  <p className="text-xs text-slate-600 italic truncate">
                    "{current.example}"
                  </p>
                )}
              </div>
            </div>

            {/* Flip hint at bottom */}
            <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5 pt-1">
              <RotateCw className="w-3 h-3 text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
              <span>Bấm vào thẻ để lật xem ví dụ chi tiết</span>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/90 border border-blue-200 shadow-md p-4 sm:p-5 flex flex-col justify-between backface-hidden rotate-y-180">
            {/* Top Bar on Flipped Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                  Mặt sau
                </span>
                <span className="text-[10px] text-slate-500">
                  {current.partOfSpeech || 'từ vựng'}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleSpeak(e, current.word)}
                className="p-1.5 rounded-lg text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 transition shadow-2xs flex items-center gap-1 text-[11px] font-bold"
                title="Nghe lại phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Phát âm</span>
              </button>
            </div>

            {/* Center Meaning & Deep Examples */}
            <div className="my-auto py-1 text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-blue-950">
                {current.meaning}
              </h3>

              {current.example && (
                <div className="p-3 rounded-xl bg-white border border-blue-100 text-left shadow-2xs max-w-lg mx-auto space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Ví dụ thực tế:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(e, current.example)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Nghe câu</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                    "{current.example}"
                  </p>
                  {current.exampleMeaning && (
                    <p className="text-[11px] text-slate-500 pt-0.5 border-t border-slate-50">
                      → {current.exampleMeaning}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Flip hint at bottom */}
            <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <RotateCw className="w-3 h-3 text-blue-500" />
              <span>Bấm để lật lại mặt trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons (Prev / Next) - Compact */}
      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-2 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Từ trước</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === vocabs.length - 1}
          className="flex-1 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <span>Từ tiếp theo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Global Quick Dictionary Modal */}
      <QuickDictionaryModal
        word={current.word}
        isOpen={dictModalOpen}
        onClose={() => setDictModalOpen(false)}
      />
    </div>
  );
}
