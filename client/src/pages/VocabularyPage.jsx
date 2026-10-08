import React, { useState, useEffect } from 'react';
import { Search, Volume2, Heart, Bookmark, Filter, BookOpen } from 'lucide-react';
import api from '../services/api';
import { speakText } from '../utils/speech';

export default function VocabularyPage() {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, favorites, need_review

  const fetchVocabulary = () => {
    setLoading(true);
    let url = `/vocabulary?`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
    if (activeFilter === 'favorites') url += `filter=favorites&`;
    if (activeFilter === 'need_review') url += `filter=need_review&`;

    api.get(url)
      .then((res) => setVocabList(res.data.vocabulary || []))
      .catch((err) => console.error('Fetch vocab error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVocabulary();
  }, [activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVocabulary();
  };

  const handleToggleFavorite = async (vId, currentFav) => {
    try {
      await api.post(`/vocabulary/${vId}/status`, { isFavorite: !currentFav });
      setVocabList((prev) =>
        prev.map((v) => (v.id === vId ? { ...v, isFavorite: !currentFav } : v))
      );
    } catch (err) {
      console.error('Update favorite error:', err);
    }
  };

  const handleToggleReview = async (vId, currentStatus) => {
    const nextStatus = currentStatus === 'NEED_REVIEW' ? 'LEARNING' : 'NEED_REVIEW';
    try {
      await api.post(`/vocabulary/${vId}/status`, { status: nextStatus });
      setVocabList((prev) =>
        prev.map((v) => (v.id === vId ? { ...v, status: nextStatus } : v))
      );
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Sổ tay từ vựng (Vocabulary Hub)
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Kho từ vựng & Flashcards
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý toàn bộ từ vựng đã học, ôn tập các từ cần ghi nhớ và lưu trữ từ yêu thích.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </form>

        {/* Filter Pills */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả từ ({vocabList.length})
          </button>

          <button
            onClick={() => setActiveFilter('favorites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'favorites'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Yêu thích</span>
          </button>

          <button
            onClick={() => setActiveFilter('need_review')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'need_review'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Cần ôn tập</span>
          </button>
        </div>
      </div>

      {/* Vocabulary Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vocabList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy từ vựng nào</h3>
          <p className="text-xs text-slate-400 mt-1">Hãy thử tìm từ khác hoặc bỏ bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabList.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {v.category || 'General'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(v.id, v.isFavorite)}
                      className={`p-1.5 rounded-lg transition ${
                        v.isFavorite
                          ? 'text-rose-500 bg-rose-50'
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Yêu thích"
                    >
                      <Heart className={`w-4 h-4 ${v.isFavorite ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleToggleReview(v.id, v.status)}
                      className={`p-1.5 rounded-lg transition ${
                        v.status === 'NEED_REVIEW'
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Đánh dấu cần ôn"
                    >
                      <Bookmark className={`w-4 h-4 ${v.status === 'NEED_REVIEW' ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-xl font-black text-slate-900">{v.word}</h3>
                  <span className="text-xs font-mono text-slate-400 font-medium">{v.pronunciation}</span>
                </div>

                <p className="text-sm font-bold text-blue-900 mt-1.5">{v.meaning}</p>

                {v.example && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-medium text-slate-700">"{v.example}"</p>
                    {v.exampleMeaning && (
                      <p className="text-slate-400 mt-0.5">→ {v.exampleMeaning}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 italic">
                  ({v.partOfSpeech || 'từ vựng'})
                </span>

                <button
                  onClick={() => speakText(v.word)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Phát âm</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
