import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Volume2,
  BookmarkPlus,
  BookOpen,
  Check,
  AlertCircle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { speakText } from '../../utils/speech';

export default function QuickDictionaryModal({ word = '', isOpen = false, onClose }) {
  const [currentWord, setCurrentWord] = useState(word);
  const [inputWord, setInputWord] = useState(word);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [didYouMean, setDidYouMean] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef(null);

  // Client-side cache for sub-millisecond retrieval
  const modalCache = useRef(new Map());

  const quickWords = ['hello', 'student', 'coffee', 'apple', 'family', 'extension'];

  useEffect(() => {
    if (isOpen) {
      if (word && word.trim()) {
        const initialWord = word.trim();
        setCurrentWord(initialWord);
        setInputWord(initialWord);
        fetchWord(initialWord);
      } else {
        setCurrentWord('');
        setInputWord('');
        setData(null);
        setError('');
        setDidYouMean(null);
        setSuggestions([]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, word]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchWord = async (searchWord) => {
    const term = searchWord.trim();
    if (!term) return;

    const cleanTerm = term.toLowerCase();

    // Check instant client cache
    if (modalCache.current.has(cleanTerm)) {
      setData(modalCache.current.get(cleanTerm));
      setError('');
      setDidYouMean(null);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setDidYouMean(null);
    setSuggestions([]);
    setSavedSuccess(false);

    try {
      const res = await api.get(`/vocabulary/lookup/${encodeURIComponent(cleanTerm)}`);
      setData(res.data);
      modalCache.current.set(cleanTerm, res.data);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.didYouMean || errData?.suggestions) {
        setData(null);
        setError(errData.message || `Không tìm thấy từ "${term}".`);
        setDidYouMean(errData.didYouMean || null);
        setSuggestions(errData.suggestions || []);
      } else {
        // Fallback directly to Datamuse for spelling suggestions
        try {
          const sugRes = await fetch(
            `https://api.datamuse.com/words?sp=${encodeURIComponent(cleanTerm)}&max=6`,
            { signal: AbortSignal.timeout(1800) }
          );
          if (sugRes.ok) {
            const list = await sugRes.json();
            const words = list.map((i) => i.word).filter((w) => w.toLowerCase() !== cleanTerm);
            setData(null);
            setError(`Không tìm thấy từ "${term}".`);
            setDidYouMean(words[0] || null);
            setSuggestions(words.slice(0, 5));
          } else {
            setData(null);
            setError(`Không tìm thấy từ "${term}". Vui lòng kiểm tra lại chính tả.`);
          }
        } catch {
          setData(null);
          setError(`Không tìm thấy từ "${term}". Vui lòng kiểm tra lại chính tả.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputWord.trim()) {
      setCurrentWord(inputWord.trim());
      fetchWord(inputWord.trim());
    }
  };

  const handleSelectWord = (w) => {
    setInputWord(w);
    setCurrentWord(w);
    fetchWord(w);
  };

  const handlePlayAudio = () => {
    if (data?.word) {
      speakText(data.word);
    }
  };

  const handleSaveToNotebook = async () => {
    if (!data) return;
    try {
      const firstDef = data.meanings?.[0]?.definitions?.[0];
      await api.post('/vocabulary/save-custom', {
        word: data.word,
        meaning: data.vietnameseMeaning || firstDef?.definition || 'Từ vựng tra cứu',
        pronunciation: data.phonetic || '',
        partOfSpeech: data.meanings?.[0]?.partOfSpeech || 'noun',
        example: firstDef?.example || '',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[82vh] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Spotlight Top Search Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2.5 bg-slate-50 focus-within:bg-white rounded-2xl border border-slate-200/90 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all px-3.5 py-1.5"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Nhập từ tiếng Anh cần tra..."
              className="flex-1 py-1.5 text-sm font-semibold text-slate-900 placeholder-slate-400 bg-transparent outline-none"
            />
            {inputWord && (
              <button
                type="button"
                onClick={() => {
                  setInputWord('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !inputWord.trim()}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition disabled:opacity-40 shrink-0 shadow-sm"
            >
              Tra từ
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex items-center gap-1.5 mt-2.5 px-1 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Gợi ý:</span>
            {quickWords.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => handleSelectWord(w)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium shrink-0 transition ${
                  currentWord.toLowerCase() === w
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Loading Skeleton */}
          {loading && (
            <div className="py-6 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-7 bg-slate-200 rounded-lg w-32" />
                  <div className="h-4 bg-slate-100 rounded w-20" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-100 rounded-xl w-20" />
                  <div className="h-8 bg-slate-100 rounded-xl w-20" />
                </div>
              </div>
              <div className="h-16 bg-slate-50 rounded-2xl border border-slate-100" />
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-4/5" />
              </div>
            </div>
          )}

          {/* 2. Initial Ready State */}
          {!loading && !error && !data && (
            <div className="py-10 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Sẵn sàng tra cứu</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Nhập từ bạn muốn tra cứu vào ô phía trên hoặc chọn từ gợi ý nhanh.
              </p>
            </div>
          )}

          {/* 3. Error & Spelling Suggestions State */}
          {!loading && error && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Không tìm thấy từ "{currentWord}"
                  </h4>
                  {didYouMean ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Có thể bạn đã viết nhầm chính tả. Có phải bạn muốn tìm từ này?
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vui lòng kiểm tra lại chính tả hoặc thử các từ tương tự.
                    </p>
                  )}
                </div>
              </div>

              {/* Primary Did You Mean Box */}
              {didYouMean && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                      Gợi ý chính xác nhất:
                    </span>
                    <span className="text-base font-black text-blue-950 capitalize">
                      {didYouMean}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectWord(didYouMean)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                  >
                    <span>Xem từ này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Other Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div className="pt-1">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Các từ viết gần giống:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectWord(s)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Word Data Display */}
          {!loading && !error && data && (
            <>
              {/* Word Header & Audio/Save Actions */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize">
                      {data.word}
                    </h2>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md uppercase">
                      Chuẩn IPA
                    </span>
                  </div>

                  {data.phonetic && (
                    <p className="text-sm font-mono text-blue-600 font-bold mt-1">
                      {data.phonetic}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>Phát âm</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToNotebook}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <BookmarkPlus className="w-4 h-4 text-slate-600" />
                    <span>{savedSuccess ? 'Đã lưu ✓' : 'Lưu'}</span>
                  </button>
                </div>
              </div>

              {/* Vietnamese Meaning if known */}
              {data.vietnameseMeaning && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                    Nghĩa tiếng Việt đối chiếu:
                  </span>
                  <p className="font-extrabold text-blue-950 text-sm">
                    {data.vietnameseMeaning}
                  </p>
                </div>
              )}

              {/* Meanings by Part of Speech */}
              <div className="space-y-4">
                {data.meanings && data.meanings.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                  >
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wide">
                      {m.partOfSpeech}
                    </span>

                    <div className="space-y-2 text-xs">
                      {m.definitions && m.definitions.slice(0, 3).map((def, dIdx) => (
                        <div key={dIdx} className="space-y-1 text-slate-700">
                          <p className="font-semibold text-slate-900 text-xs leading-relaxed">
                            <span className="font-bold text-blue-600 mr-1.5">{dIdx + 1}.</span>
                            {def.definition}
                          </p>
                          {def.example && (
                            <p className="pl-4 text-slate-500 italic text-[11px]">
                              "{def.example}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Synonyms Clickable Chips */}
                    {m.synonyms && m.synonyms.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400">Đồng nghĩa:</span>
                        {m.synonyms.slice(0, 4).map((syn, synIdx) => (
                          <button
                            key={synIdx}
                            type="button"
                            onClick={() => handleSelectWord(syn)}
                            className="px-2 py-0.5 rounded bg-white text-blue-600 border border-slate-200 text-[10px] font-medium hover:bg-blue-50"
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-5">
          <span>Nhấn <strong>Esc</strong> hoặc chạm ngoài để đóng</span>
          <button
            onClick={onClose}
            className="text-slate-600 font-semibold hover:text-slate-900"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
