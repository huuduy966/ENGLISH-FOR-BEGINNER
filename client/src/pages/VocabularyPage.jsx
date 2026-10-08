import React, { useState, useEffect } from 'react';
import { Search, Volume2, Heart, Bookmark, Filter, BookOpen, Globe, Check } from 'lucide-react';
import api from '../services/api';
import { speakText } from '../utils/speech';
import QuickDictionaryModal from '../components/common/QuickDictionaryModal';

export default function VocabularyPage() {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, favorites, need_review
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [selectedLookupWord, setSelectedLookupWord] = useState('');

  const categories = [
    'All',
    'Greetings',
    'Family',
    'Numbers',
    'Food',
    'Drinks',
    'Colors',
    'Clothes',
    'Jobs',
    'Home',
    'Furniture',
    'Shopping',
    'Weather',
    'Transportation',
    'Travel',
    'Health',
    'Hobbies',
  ];

  const fetchVocabulary = () => {
    setLoading(true);
    let url = `/vocabulary?`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
    if (activeFilter === 'favorites') url += `filter=favorites&`;
    if (activeFilter === 'need_review') url += `filter=need_review&`;
    if (selectedCategory && selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;

    api.get(url)
      .then((res) => setVocabList(res.data.vocabulary || []))
      .catch((err) => console.error('Fetch vocab error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVocabulary();
  }, [activeFilter, selectedCategory]);

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
          Sổ tay từ vựng ({vocabList.length} từ)
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Kho từ vựng & Flashcards
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hệ thống gồm 15 chủ đề đời sống, đồng bộ định nghĩa & phát âm trực tiếp với Datamuse.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50/50 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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

        {/* Category Horizontal Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
          <span className="font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Chủ đề:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl font-medium shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'All' ? 'Tất cả chủ đề' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vocabList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy từ vựng trong chủ đề này</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? `Từ "${searchTerm}" chưa có trong danh sách. Bạn muốn tra cứu trong từ điển Datamuse?` : 'Hãy thử chọn chủ đề khác hoặc bỏ bộ lọc hiện tại.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSelectedLookupWord(searchTerm);
                setDictModalOpen(true);
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
            >
              <Globe className="w-4 h-4" />
              <span>Tra cứu "{searchTerm}" với Datamuse</span>
            </button>
          )}
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
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
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

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedLookupWord(v.word);
                      setDictModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    title="Tra cứu từ điển Datamuse"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chi tiết</span>
                  </button>

                  <button
                    onClick={() => speakText(v.word)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition active:scale-95 shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Phát âm</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Dictionary Modal */}
      <QuickDictionaryModal
        word={selectedLookupWord}
        isOpen={dictModalOpen}
        onClose={() => setDictModalOpen(false)}
      />
    </div>
  );
}
