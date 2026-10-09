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
  Layers,
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

  const handleSelectWordIndex = (idx) => {
    setIsFlipped(false);
    setCurrentIndex(idx);
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
    <div className="w-full space-y-5 animate-fade-in">
      {/* Top Header Card Info Bar */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black text-slate-800">
            Từ vựng {currentIndex + 1} / {vocabs.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {current.category || 'General'}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            viewedIndices.size >= vocabs.length
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600'
          }`}>
            Đã xem {viewedIndices.size} / {vocabs.length} từ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Dùng phím mũi tên ← → để chuyển từ, Space để lật thẻ
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[440px] sm:min-h-[480px] cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`relative w-full min-h-[440px] sm:min-h-[480px] duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col justify-between backface-hidden">
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getPosBadge(
                    current.partOfSpeech
                  )}`}
                >
                  {current.partOfSpeech || 'từ vựng'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100">
                  Mặt trước (Khám phá)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDictModalOpen(true);
                  }}
                  className="p-2 sm:p-2.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition shadow-2xs"
                  title="Tra cứu từ điển chuyên sâu"
                >
                  <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`p-2 sm:p-2.5 rounded-xl transition shadow-2xs ${
                    current.isFavorite
                      ? 'bg-rose-50 text-rose-500 border border-rose-200'
                      : 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title="Thêm vào danh sách Yêu thích"
                >
                  <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${current.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`p-2 sm:p-2.5 rounded-xl transition shadow-2xs ${
                    current.status === 'NEED_REVIEW'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title="Đánh dấu cần ôn tập kỹ"
                >
                  <Bookmark className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${current.status === 'NEED_REVIEW' ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Central Rich Content Area */}
            <div className="my-auto py-4 text-center space-y-4">
              {/* Word & IPA */}
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                  {current.word}
                </h2>
                <p className="mt-2 text-xl sm:text-2xl font-mono text-blue-600 font-bold tracking-wider">
                  {current.pronunciation}
                </p>
              </div>

              {/* Pronunciation Audio Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => handleSpeak(e, current.word)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-95"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Nghe phát âm chuẩn</span>
                </button>
              </div>

              {/* Meaning and Example Preview Box */}
              <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/70 border border-blue-100/80 text-left space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Nghĩa tiếng Việt:
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {current.meaning}
                  </span>
                </div>

                {current.example && (
                  <div className="pt-2 border-t border-blue-200/50 space-y-0.5">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 italic">
                      "{current.example}"
                    </p>
                    {current.exampleMeaning && (
                      <p className="text-[11px] sm:text-xs text-slate-500">
                        → {current.exampleMeaning}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Flip hint at bottom */}
            <div className="text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2 pt-2">
              <RotateCw className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
              <span>Chạm hoặc bấm vào thẻ để lật xem giải thích chi tiết & ngữ cảnh mở rộng</span>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/90 border-2 border-blue-300 shadow-xl p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180">
            {/* Top Bar on Flipped Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-3 py-1 rounded-lg border border-blue-200">
                  Mặt sau (Chi tiết & Ngữ cảnh)
                </span>
                <span className="text-xs font-bold text-slate-600 px-2.5 py-0.5 rounded-md bg-white border border-slate-200">
                  {current.partOfSpeech || 'từ vựng'}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleSpeak(e, current.word)}
                className="p-2 rounded-xl text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold"
                title="Nghe lại phát âm"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Phát âm</span>
              </button>
            </div>

            {/* Center Meaning & Deep Examples */}
            <div className="my-auto py-2 text-center space-y-4 sm:space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Định nghĩa tiếng Việt chính xác
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-950">
                  {current.meaning}
                </h3>
              </div>

              {/* Context & Example Box with listen button */}
              {current.example && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-blue-200/80 text-left shadow-sm max-w-2xl mx-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      Câu ví dụ trong đời sống:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(e, current.example)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      title="Nghe phát âm cả câu ví dụ"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe câu</span>
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                    "{current.example}"
                  </p>
                  {current.exampleMeaning && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium pt-1 border-t border-slate-100">
                      → {current.exampleMeaning}
                    </p>
                  )}
                </div>
              )}

              {/* Usage Hints & Collocations note */}
              <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  Chủ đề: <strong className="text-blue-600">{current.category}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  Cấp độ: <strong className="text-blue-600">{current.level || 'A1'}</strong>
                </span>
              </div>
            </div>

            {/* Back flip hint */}
            <div className="text-center text-xs text-blue-700 font-bold flex items-center justify-center gap-2 pt-2">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm để quay lại mặt trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons (Prev / Next) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Từ trước (←)</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === vocabs.length - 1}
          className="flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Từ tiếp theo (→)</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Quick Word Selector Carousel (Băng chuyền chọn nhanh từ vựng) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Danh mục {vocabs.length} từ trong bài (Bấm để nhảy nhanh):</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {currentIndex + 1} / {vocabs.length}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
          {vocabs.map((v, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={v.id || idx}
                type="button"
                onClick={() => handleSelectWordIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-102'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span className={`text-[10px] ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                  {idx + 1}.
                </span>
                <span>{v.word}</span>
                {v.isFavorite && (
                  <Heart className={`w-3 h-3 ${isCurrent ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                )}
              </button>
            );
          })}
        </div>
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
