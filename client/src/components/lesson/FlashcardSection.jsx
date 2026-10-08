import React, { useState } from 'react';
import { Volume2, Heart, Bookmark, RotateCw, ChevronLeft, ChevronRight, Check, Globe, BookOpen } from 'lucide-react';
import { speakText } from '../../utils/speech';
import api from '../../services/api';
import QuickDictionaryModal from '../common/QuickDictionaryModal';

export default function FlashcardSection({ vocabularies = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [vocabs, setVocabs] = useState(vocabularies);
  const [dictModalOpen, setDictModalOpen] = useState(false);

  if (!vocabs || vocabs.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Bài học này chưa có từ vựng.</p>
      </div>
    );
  }

  const current = vocabs[currentIndex];

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

  const handleSpeak = (e) => {
    e.stopPropagation();
    speakText(current.word);
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      {/* Top Counter & Quick Controls */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-4 px-2">
        <span>Từ vựng {currentIndex + 1} / {vocabs.length}</span>
        <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
          {current.category || 'General'}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full h-80 sm:h-96 cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border-2 border-slate-200/90 shadow-xl p-8 flex flex-col justify-between backface-hidden">
            {/* Top row actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mặt trước (English)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDictModalOpen(true);
                  }}
                  className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                  title="Tra cứu từ điển chi tiết"
                >
                  <BookOpen className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-xl transition ${
                    current.isFavorite
                      ? 'bg-rose-50 text-rose-500'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Yêu thích"
                >
                  <Heart className={`w-5 h-5 ${current.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`p-2 rounded-xl transition ${
                    current.status === 'NEED_REVIEW'
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Cần ôn tập"
                >
                  <Bookmark className={`w-5 h-5 ${current.status === 'NEED_REVIEW' ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Word Center */}
            <div className="text-center py-4 my-auto">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {current.word}
              </h2>
              <p className="mt-3 text-lg font-mono text-blue-600 font-semibold tracking-wide">
                {current.pronunciation}
              </p>

              <button
                type="button"
                onClick={handleSpeak}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm shadow-sm transition active:scale-95"
              >
                <Volume2 className="w-5 h-5 text-blue-600" />
                <span>Nghe phát âm</span>
              </button>
            </div>

            {/* Flip hint */}
            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm hoặc bấm vào thẻ để lật xem nghĩa</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl p-8 flex flex-col justify-between backface-hidden rotate-y-180">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Nghĩa tiếng Việt & Ví dụ
              </span>
              <span className="text-xs text-slate-500 italic capitalize">
                ({current.partOfSpeech || 'từ vựng'})
              </span>
            </div>

            {/* Center Meaning */}
            <div className="my-auto text-center space-y-4">
              <h3 className="text-3xl font-extrabold text-blue-950">
                {current.meaning}
              </h3>

              {current.example && (
                <div className="p-4 rounded-2xl bg-white/90 border border-blue-100 text-left shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">
                    "{current.example}"
                  </p>
                  {current.exampleMeaning && (
                    <p className="text-xs text-slate-500 mt-1">
                      → {current.exampleMeaning}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-center text-xs text-blue-600/80 font-medium">
              Chạm để quay lại mặt trước
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Từ trước</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === vocabs.length - 1}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <span>Từ tiếp theo</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Dictionary Modal */}
      <QuickDictionaryModal
        word={current.word}
        isOpen={dictModalOpen}
        onClose={() => setDictModalOpen(false)}
      />
    </div>
  );
}
