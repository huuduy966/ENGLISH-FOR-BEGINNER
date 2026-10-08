import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Volume2,
  BookmarkPlus,
  BookOpen,
  Check,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  HelpCircle,
  ArrowLeftRight,
  GitFork,
} from 'lucide-react';
import { speakText } from '../utils/speech';
import api from '../services/api';

export default function DictionaryPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [didYouMean, setDidYouMean] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Client-side instant cache
  const clientCache = useRef(new Map());

  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('e4b_recent_lookups');
    return saved ? JSON.parse(saved) : [];
  });

  const topicSuggestions = [
    { topic: 'Chào hỏi & Giao tiếp', words: ['hello', 'welcome', 'friend', 'meet'] },
    { topic: 'Đời sống & Ẩm thực', words: ['coffee', 'bread', 'water', 'tea'] },
    { topic: 'Cảm xúc & Tính từ', words: ['happy', 'tired', 'ready', 'beautiful'] },
    { topic: 'Trường học & Nghề nghiệp', words: ['student', 'teacher', 'doctor'] },
  ];

  // Auto-search if query param present (e.g. /dictionary?q=apple)
  useEffect(() => {
    const queryWord = searchParams.get('q') || searchParams.get('word');
    if (queryWord) {
      setSearchTerm(queryWord);
      doSearch(queryWord);
    }
  }, [searchParams]);

  const doSearch = async (wordToSearch) => {
    const term = wordToSearch.trim();
    if (!term) return;

    const cleanTerm = term.toLowerCase();

    // 1. Check instant client cache (0ms)
    if (clientCache.current.has(cleanTerm)) {
      setResult(clientCache.current.get(cleanTerm));
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
      setResult(res.data);
      clientCache.current.set(cleanTerm, res.data);

      // Update recent searches
      setRecentSearches((prev) => {
        const filtered = prev.filter((w) => w.toLowerCase() !== cleanTerm);
        const updated = [cleanTerm, ...filtered].slice(0, 8);
        localStorage.setItem('e4b_recent_lookups', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.didYouMean || errData?.suggestions) {
        setResult(null);
        setError(errData.message || `Không tìm thấy từ "${term}".`);
        setDidYouMean(errData.didYouMean || null);
        setSuggestions(errData.suggestions || []);
      } else {
        // Fallback: Query suggestions from Datamuse directly if backend offline
        try {
          const sugRes = await fetch(
            `https://api.datamuse.com/words?sp=${encodeURIComponent(cleanTerm)}&max=6`
          );
          if (sugRes.ok) {
            const list = await sugRes.json();
            const words = list.map((i) => i.word).filter((w) => w.toLowerCase() !== cleanTerm);
            setResult(null);
            setError(`Không tìm thấy từ "${term}".`);
            setDidYouMean(words[0] || null);
            setSuggestions(words.slice(0, 5));
          } else {
            setResult(null);
            setError(`Không tìm thấy từ "${term}". Vui lòng kiểm tra lại chính tả.`);
          }
        } catch {
          setResult(null);
          setError(`Không tìm thấy từ "${term}". Vui lòng kiểm tra lại chính tả.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    doSearch(searchTerm);
  };

  const handlePlayAudio = () => {
    if (result?.word) {
      speakText(result.word);
    }
  };

  const handleAddToVocab = async () => {
    if (!result) return;
    try {
      const firstDef = result.meanings?.[0]?.definitions?.[0];
      const meaningText = result.vietnameseMeaning || firstDef?.definition || 'Từ vựng đã tra cứu';
      const exampleText = firstDef?.example || '';

      await api.post('/vocabulary/save-custom', {
        word: result.word,
        meaning: meaningText,
        pronunciation: result.phonetic || '',
        partOfSpeech: result.meanings?.[0]?.partOfSpeech || 'noun',
        example: exampleText,
        exampleMeaning: '',
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Tra cứu trực tuyến (Dictionary Hub)
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Từ điển Anh - Việt & Anh - Anh
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tra cứu nhanh phát âm chuẩn IPA, các tầng nghĩa chi tiết, câu ví dụ thực tế và gợi ý từ thông minh khi viết sai chính tả.
        </p>
      </div>

      {/* 2. Search Box Card Container */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập từ tiếng Anh cần tra (ví dụ: hello, student, coffee, extension)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50/50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Tra từ</span>
            )}
          </button>
        </form>

        {/* Popular chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="font-semibold text-slate-400 mr-1">Gợi ý nhanh:</span>
          {['hello', 'apple', 'student', 'coffee', 'extension', 'beautiful'].map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => {
                setSearchTerm(word);
                doSearch(word);
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 font-medium transition text-xs"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Spelling Suggestions Card (When Misspelled) */}
      {error && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
              <HelpCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">
                Không tìm thấy từ "{searchTerm}"
              </p>
              {didYouMean ? (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Có thể bạn đã viết nhầm chính tả. Hệ thống phát hiện từ đúng phù hợp nhất dưới đây:
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Vui lòng kiểm tra lại chính tả hoặc thử các từ viết gần giống.
                </p>
              )}
            </div>
          </div>

          {/* Primary "Did You Mean?" High Priority Banner */}
          {didYouMean && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                  Có phải bạn muốn tìm:
                </span>
                <span className="text-xl font-black text-blue-950 capitalize">
                  {didYouMean}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm(didYouMean);
                  doSearch(didYouMean);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <span>Xem từ "{didYouMean}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Alternative Similar Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Các từ tương tự khác:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchTerm(s);
                      doSearch(s);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-semibold text-xs transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Two-Column Study Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Word Details or Initial Ready State (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Initial Welcome / Ready State when no search done yet */}
          {!result && !loading && !error && (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-sm text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Sẵn sàng tra cứu từ vựng
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Nhập từ tiếng Anh bạn muốn tra cứu vào ô tìm kiếm ở trên để xem phát âm chuẩn IPA, các tầng nghĩa chi tiết và câu ví dụ minh họa.
              </p>
              <div className="pt-3 flex flex-wrap justify-center items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Gợi ý thử:</span>
                {['hello', 'coffee', 'student', 'family', 'extension'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setSearchTerm(w);
                      doSearch(w);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-medium transition"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && !error && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
              {/* Word Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
                      {result.word}
                    </h2>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Chuẩn IPA
                    </span>
                  </div>

                  {result.phonetic && (
                    <p className="text-base font-mono text-blue-600 font-bold mt-1">
                      {result.phonetic}
                    </p>
                  )}
                </div>

                {/* Actions: Speak & Save */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-sm"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>Phát âm</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToVocab}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition shadow-sm"
                  >
                    <BookmarkPlus className="w-4 h-4 text-slate-600" />
                    <span className="flex items-center gap-1">
                      {savedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span className="text-emerald-700">Đã lưu</span>
                        </>
                      ) : (
                        <span>Lưu vào sổ</span>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Vietnamese Meaning if available */}
              {result.vietnameseMeaning && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    Nghĩa tiếng Việt đối chiếu:
                  </span>
                  <p className="text-lg font-extrabold text-blue-950">
                    {result.vietnameseMeaning}
                  </p>
                  {result.localExample && (
                    <p className="text-xs text-blue-800 mt-1 italic">
                      "{result.localExample}"
                    </p>
                  )}
                </div>
              )}

              {/* Meanings by Part of Speech */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Định nghĩa theo từ loại (Parts of Speech)
                </h3>

                {result.meanings && result.meanings.map((meaning, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5"
                  >
                    {/* Part of Speech Tag */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wide">
                        {meaning.partOfSpeech}
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Definitions */}
                    <div className="space-y-3">
                      {meaning.definitions && meaning.definitions.map((def, dIdx) => (
                        <div key={dIdx} className="text-xs text-slate-700 space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-blue-600 shrink-0">
                              {dIdx + 1}.
                            </span>
                            <p className="font-semibold text-slate-900 leading-relaxed text-sm">
                              {def.definition}
                            </p>
                          </div>

                          {def.example && (
                            <p className="pl-5 text-slate-500 italic text-[11px]">
                              "{def.example}"
                            </p>
                          )}

                          {/* Specific synonyms */}
                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="pl-5 pt-1 flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-400">Từ đồng nghĩa:</span>
                              {def.synonyms.slice(0, 4).map((s, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => {
                                    setSearchTerm(s);
                                    doSearch(s);
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 text-[11px] font-medium"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Shared Synonyms */}
                    {meaning.synonyms && meaning.synonyms.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-bold text-slate-500">Đồng nghĩa:</span>
                        {meaning.synonyms.slice(0, 6).map((syn, synIdx) => (
                          <button
                            key={synIdx}
                            type="button"
                            onClick={() => {
                              setSearchTerm(syn);
                              doSearch(syn);
                            }}
                            className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[11px] transition"
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Princeton WordNet Lexical Semantic Network */}
              {result.wordnet && (
                (result.wordnet.antonyms && result.wordnet.antonyms.length > 0) ||
                (result.wordnet.synonyms && result.wordnet.synonyms.length > 0) ||
                (result.wordnet.hypernyms && result.wordnet.hypernyms.length > 0) ||
                (result.wordnet.hyponyms && result.wordnet.hyponyms.length > 0)
              ) && (
                <div className="pt-5 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mạng lưới ngữ nghĩa WordNet (Lexical Network)</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Princeton WordNet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 1. Antonyms (Từ trái nghĩa) */}
                    {result.wordnet.antonyms && result.wordnet.antonyms.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>Từ trái nghĩa (Antonyms):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.wordnet.antonyms.map((ant, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => {
                                setSearchTerm(ant);
                                doSearch(ant);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold transition text-xs shadow-2xs"
                            >
                              {ant}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Synonyms (Từ đồng nghĩa) */}
                    {result.wordnet.synonyms && result.wordnet.synonyms.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Đồng nghĩa (Synsets):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.wordnet.synonyms.slice(0, 5).map((syn, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                setSearchTerm(syn);
                                doSearch(syn);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold transition text-xs shadow-2xs"
                            >
                              {syn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Hypernyms (Thuộc nhóm / Cấp trên) */}
                    {result.wordnet.hypernyms && result.wordnet.hypernyms.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-purple-700 text-xs">
                          <span>Thuộc nhóm (Hypernyms):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.wordnet.hypernyms.map((hyp, hIdx) => (
                            <button
                              key={hIdx}
                              type="button"
                              onClick={() => {
                                setSearchTerm(hyp);
                                doSearch(hyp);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 font-medium transition text-xs shadow-2xs"
                            >
                              {hyp}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Hyponyms (Cụ thể hơn / Cấp dưới) */}
                    {result.wordnet.hyponyms && result.wordnet.hyponyms.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                          <span>Cụ thể hơn (Hyponyms):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.wordnet.hyponyms.map((spc, spIdx) => (
                            <button
                              key={spIdx}
                              type="button"
                              onClick={() => {
                                setSearchTerm(spc);
                                doSearch(spc);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-medium transition text-xs shadow-2xs"
                            >
                              {spc}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Sidebar & Context Helpers (1 Col) */}
        <div className="space-y-6">
          {/* Recent Lookups Card */}
          {recentSearches.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Lịch sử vừa tra
                </h3>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('e4b_recent_lookups');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-medium transition"
                >
                  Xóa
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchTerm(w);
                      doSearch(w);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      result?.word?.toLowerCase() === w.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Topics Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Từ vựng theo chủ đề
            </h3>

            <div className="space-y-3">
              {topicSuggestions.map((group, gIdx) => (
                <div key={gIdx} className="text-xs">
                  <span className="font-bold text-slate-400 text-[11px] block mb-1">
                    {group.topic}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.words.map((w, wIdx) => (
                      <button
                        key={wIdx}
                        type="button"
                        onClick={() => {
                          setSearchTerm(w);
                          doSearch(w);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80 transition"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sổ tay từ vựng Shortcut */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>Sổ tay từ vựng của bạn</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Các từ bạn đã lưu sẽ tự động xuất hiện trong Sổ tay cá nhân để ôn tập bằng Flashcard 3D.
            </p>
            <Link
              to="/vocabulary"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
            >
              <span>Xem Sổ tay từ vựng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
