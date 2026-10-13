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
  ArrowRight,
  HelpCircle,
  ArrowLeftRight,
  GitFork,
  X,
  RotateCcw,
  Sparkles,
  Info,
  Copy,
  Languages,
  FileText,
  CornerDownLeft,
  ShieldCheck,
  CheckCircle2,
  Clipboard,
} from 'lucide-react';
import { speakText } from '../utils/speech';
import api from '../services/api';

export default function DictionaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'DICT' (Tra từ điển) | 'TRANSLATE' (Dịch văn bản)
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'translate' ? 'TRANSLATE' : 'DICT';
  });

  // Search input state for Dictionary Lookup
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [didYouMean, setDidYouMean] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Text Translation Mode state
  const [translateInput, setTranslateInput] = useState('');
  const [translateResult, setTranslateResult] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const [savedTranslateWord, setSavedTranslateWord] = useState(false);

  // Autocomplete suggestions while typing in Dictionary Mode
  const [typeSuggestions, setTypeSuggestions] = useState([]);
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const translateInputRef = useRef(null);
  const suggestDebounceRef = useRef(null);
  const suggestContainerRef = useRef(null);

  // Client-side cache for sub-millisecond response
  const clientCache = useRef(new Map());
  const translationCache = useRef(new Map());

  // Recent lookups from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('e4b_recent_lookups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Topics from Database
  const [topics, setTopics] = useState([]);

  // Fetch dynamic topics on mount
  useEffect(() => {
    api.get('/vocabulary/topics')
      .then((res) => {
        if (res.data?.topics && Array.isArray(res.data.topics)) {
          setTopics(res.data.topics);
        }
      })
      .catch((err) => {
        console.warn('Fetch topics error:', err.message);
      });
  }, []);

  // Close type suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestContainerRef.current && !suggestContainerRef.current.contains(e.target)) {
        setShowTypeSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-search / Auto-translate if query param present (e.g. /dictionary?q=hello)
  useEffect(() => {
    const queryWord = searchParams.get('q') || searchParams.get('word');
    if (queryWord) {
      const words = queryWord.trim().split(/\s+/).filter(Boolean);
      // Auto-detect sentences/paragraphs with multiple words or punctuation
      if (words.length >= 4 || /[.!?\n]/.test(queryWord)) {
        setActiveTab('TRANSLATE');
        setTranslateInput(queryWord);
        doTranslate(queryWord);
      } else {
        setSearchTerm(queryWord);
        doSearch(queryWord);
      }
    }
  }, [searchParams]);

  // Handle typing in dictionary mode with 250ms debounce for autocomplete suggestions
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (suggestDebounceRef.current) {
      clearTimeout(suggestDebounceRef.current);
    }

    const trimmed = val.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed.includes('\n')) {
      setTypeSuggestions([]);
      setShowTypeSuggestions(false);
      return;
    }

    suggestDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/vocabulary/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.data?.suggestions && Array.isArray(res.data.suggestions)) {
          setTypeSuggestions(res.data.suggestions);
          setShowTypeSuggestions(res.data.suggestions.length > 0);
        }
      } catch {
        setTypeSuggestions([]);
      }
    }, 250);
  };

  // Helper: Detect whether text is a multi-word sentence / paragraph
  const isSentenceOrParagraph = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return false;
    const words = trimmed.split(/\s+/).filter(Boolean);
    return words.length >= 4 || /[.!?\n]/.test(trimmed);
  };

  // Perform Dictionary Lookup
  const doSearch = async (wordToSearch) => {
    const term = (wordToSearch || '').trim();
    if (!term) return;

    setShowTypeSuggestions(false);

    // If user enters a full sentence or paragraph in dictionary mode, automatically route to translation
    if (isSentenceOrParagraph(term)) {
      setActiveTab('TRANSLATE');
      setTranslateInput(term);
      doTranslate(term);
      return;
    }

    const cleanTerm = term.toLowerCase().replace(/\s+/g, ' ');

    // 1. Check instant client cache (0ms)
    if (clientCache.current.has(cleanTerm)) {
      setResult(clientCache.current.get(cleanTerm));
      setError('');
      setIsNetworkError(false);
      setDidYouMean(null);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setIsNetworkError(false);
    setDidYouMean(null);
    setSuggestions([]);
    setSavedSuccess(false);

    try {
      const res = await api.get(`/vocabulary/lookup/${encodeURIComponent(cleanTerm)}`);
      setResult(res.data);
      clientCache.current.set(cleanTerm, res.data);

      // Update recent searches in state & localStorage
      setRecentSearches((prev) => {
        const filtered = prev.filter((w) => w.toLowerCase() !== cleanTerm);
        const updated = [res.data.word || cleanTerm, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('e4b_recent_lookups', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err) {
      const errData = err.response?.data;
      setResult(null);

      if (err.response?.status === 404 && errData) {
        setError(errData.message || 'Không tìm thấy định nghĩa phù hợp cho từ này.');
        setDidYouMean(errData.didYouMean || null);
        setSuggestions(errData.suggestions || []);
      } else {
        setIsNetworkError(true);
        setError('Không thể kết nối đến máy chủ từ điển. Vui lòng kiểm tra lại kết nối mạng.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Perform Text / Sentence / Paragraph Translation via LibreTranslate
  const doTranslate = async (textToTranslate) => {
    const text = (textToTranslate !== undefined ? textToTranslate : translateInput).trim();
    if (!text) return;

    if (text.length > 5000) {
      setTranslateError('Văn bản vượt quá giới hạn 5.000 ký tự. Vui lòng rút gọn nội dung.');
      return;
    }

    const cacheKey = text.toLowerCase();
    if (translationCache.current.has(cacheKey)) {
      setTranslateResult(translationCache.current.get(cacheKey));
      setTranslateError('');
      setTranslating(false);
      return;
    }

    setTranslating(true);
    setTranslateError('');

    try {
      const res = await api.post('/vocabulary/translate', {
        text,
        source: 'en',
        target: 'vi',
      });

      setTranslateResult(res.data);
      translationCache.current.set(cacheKey, res.data);

      // Also record phrase/word lookups in history if short
      const words = text.split(/\s+/).filter(Boolean);
      if (words.length <= 4) {
        setRecentSearches((prev) => {
          const filtered = prev.filter((w) => w.toLowerCase() !== text.toLowerCase());
          const updated = [text, ...filtered].slice(0, 10);
          try {
            localStorage.setItem('e4b_recent_lookups', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Translation error:', err);
      const msg = err.response?.data?.message || 'Không thể kết nối với dịch vụ dịch thuật LibreTranslate. Vui lòng thử lại sau.';
      setTranslateError(msg);
      // Retain translateResult if already present or clear if new query
    } finally {
      setTranslating(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    doSearch(searchTerm);
  };

  const handleTranslateSubmit = (e) => {
    if (e) e.preventDefault();
    doTranslate(translateInput);
  };

  // Support Ctrl + Enter shortcut in textarea
  const handleTranslateKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      doTranslate(translateInput);
    }
  };

  const handleClearInput = () => {
    setSearchTerm('');
    setTypeSuggestions([]);
    setShowTypeSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleClearTranslate = () => {
    setTranslateInput('');
    setTranslateResult(null);
    setTranslateError('');
    translateInputRef.current?.focus();
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setTranslateInput(text);
          translateInputRef.current?.focus();
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Copy text to clipboard with fallback
  const copyToClipboard = async (text, type = 'translated') => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (type === 'original') {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedTranslated(true);
        setTimeout(() => setCopiedTranslated(false), 2000);
      }
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handlePlayAudio = () => {
    if (!result?.word) return;

    if (result.audioUrl) {
      setIsPlayingAudio(true);
      const audio = new Audio(result.audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        speakText(result.word);
      };
      audio.play().catch(() => {
        setIsPlayingAudio(false);
        speakText(result.word);
      });
    } else {
      speakText(result.word);
    }
  };

  const handleAddToVocab = async () => {
    if (!result) return;
    try {
      const firstDef = result.meanings?.[0]?.definitions?.[0];
      const meaningText = result.vietnameseMeaning || firstDef?.definition || 'Từ vựng đã tra cứu';
      const exampleText = result.localExample || firstDef?.example || '';
      const exampleMeaningText = result.localExampleMeaning || '';

      await api.post('/vocabulary/save-custom', {
        word: result.word,
        meaning: meaningText,
        pronunciation: result.phonetic || '',
        partOfSpeech: result.meanings?.[0]?.partOfSpeech || 'noun',
        example: exampleText,
        exampleMeaning: exampleMeaningText,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSaveTranslatedToNotebook = async () => {
    if (!translateResult) return;
    try {
      await api.post('/vocabulary/save-custom', {
        word: translateResult.originalText,
        meaning: translateResult.translatedText,
        pronunciation: '',
        partOfSpeech: translateResult.detectedType || 'phrase',
        example: '',
        exampleMeaning: '',
      });
      setSavedTranslateWord(true);
      setTimeout(() => setSavedTranslateWord(false), 3000);
    } catch {
      setSavedTranslateWord(true);
      setTimeout(() => setSavedTranslateWord(false), 3000);
    }
  };

  // Color badges for Part of Speech
  const getPosBadgeStyle = (pos = '') => {
    const p = pos.toLowerCase();
    if (p.includes('noun')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (p.includes('verb')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (p.includes('adj')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (p.includes('adv')) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>Tra cứu & Dịch thuật Anh–Việt</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Từ điển & Dịch văn bản
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra từ điển hoặc dịch cụm từ, câu và đoạn văn Anh–Việt.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 sm:p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200/90 shrink-0 w-full sm:w-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('DICT');
              setError('');
            }}
            className={`flex-1 sm:flex-initial justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'DICT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Tra từ điển</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('TRANSLATE');
              setTranslateError('');
            }}
            className={`flex-1 sm:flex-initial justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'TRANSLATE'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Languages className="w-4 h-4 shrink-0" />
            <span>Dịch văn bản</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: DICTIONARY LOOKUP BOX */}
      {/* ========================================================================= */}
      {activeTab === 'DICT' && (
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative z-30 animate-fade-in">
          <div ref={suggestContainerRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (typeSuggestions.length > 0) setShowTypeSuggestions(true);
                  }}
                  placeholder="Nhập từ hoặc cụm từ tiếng Anh (ví dụ: beautiful, take care of)..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-slate-50/50 focus:bg-white"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                    title="Xóa nội dung"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
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

            {/* Autocomplete Suggestions Dropdown */}
            {showTypeSuggestions && typeSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fade-in">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 px-3">
                  <span>Gợi ý tìm kiếm nhanh</span>
                  <span>Bấm để tra cứu</span>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                  {typeSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchTerm(sug);
                        setShowTypeSuggestions(false);
                        doSearch(sug);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sug}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popular chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="font-semibold text-slate-400 mr-1">Gợi ý nhanh:</span>
            {['hello', 'student', 'take care of', 'book', 'went', 'beautiful', 'light', 'right'].map((word) => (
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
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TEXT TRANSLATION BOX */}
      {/* ========================================================================= */}
      {activeTab === 'TRANSLATE' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white text-blue-700 font-bold text-xs flex items-center gap-2 border border-blue-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Tiếng Anh (EN)</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-2 border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Tiếng Việt (VI)</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className={`font-mono text-xs font-semibold ${translateInput.length > 4500 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {translateInput.length.toLocaleString('vi-VN')} / 5.000 ký tự
              </span>
              <span className="hidden sm:inline font-medium text-slate-200">|</span>
              <span className="hidden sm:inline text-slate-400 text-[11px] items-center gap-1">
                <CornerDownLeft className="w-3 h-3 text-slate-400 inline mr-0.5" />
                <span>Nhấn <strong>Ctrl + Enter</strong> để dịch</span>
              </span>
            </div>
          </div>

          {/* Textarea Area */}
          <div className="p-5 sm:p-6">
            <textarea
              ref={translateInputRef}
              rows={5}
              value={translateInput}
              onChange={(e) => setTranslateInput(e.target.value)}
              onKeyDown={handleTranslateKeyDown}
              maxLength={5000}
              placeholder="Nhập hoặc dán từ, cụm từ, câu hoàn chỉnh hoặc đoạn văn tiếng Anh vào đây..."
              className="w-full bg-transparent border-0 outline-none text-base sm:text-lg text-slate-900 placeholder:text-slate-400/90 leading-relaxed font-normal resize-none min-h-[140px] sm:min-h-[160px]"
            />
          </div>

          {/* Integrated Bottom Toolbar */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition border border-slate-200/80 flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Dán từ clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Dán văn bản</span>
              </button>

              {translateInput && (
                <>
                  <button
                    type="button"
                    onClick={() => speakText(translateInput)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-semibold transition border border-slate-200/80 flex items-center gap-1.5 shadow-2xs active:scale-95"
                    title="Nghe phát âm tiếng Anh"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Phát âm</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearTranslate}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition border border-slate-200/80 flex items-center gap-1.5 shadow-2xs active:scale-95"
                    title="Xóa nội dung"
                  >
                    <X className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xóa</span>
                  </button>
                </>
              )}
            </div>

            {/* Translate Submit Button */}
            <button
              type="button"
              disabled={translating || !translateInput.trim()}
              onClick={() => doTranslate(translateInput)}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {translating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang dịch...</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>Dịch văn bản</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Translation Error Alert */}
      {activeTab === 'TRANSLATE' && translateError && !translating && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950">Lỗi dịch văn bản</p>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{translateError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => doTranslate(translateInput)}
            className="px-4 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold text-xs transition shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Translation Results Card */}
      {activeTab === 'TRANSLATE' && translateResult && !translating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {/* Card 1: Original English Text */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Văn bản gốc (English)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {translateResult.wordCount} từ • {translateResult.charCount} ký tự
                </span>
              </div>

              <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium whitespace-pre-line min-h-[90px]">
                {translateResult.originalText}
              </div>
            </div>

            {/* Action Buttons for Original Text */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => speakText(translateResult.originalText)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs transition flex items-center gap-1.5 border border-slate-200/60"
              >
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Phát âm</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(translateResult.originalText, 'original')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 border border-slate-200/60"
              >
                {copiedOriginal ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Sao chép gốc</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Vietnamese Translated Text */}
          <div className={`rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4 flex flex-col justify-between transition-all ${
            translateResult.isVerified
              ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-emerald-200/90'
              : 'bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 border-blue-200/90'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  translateResult.isVerified ? 'text-emerald-800' : 'text-blue-700'
                }`}>
                  {translateResult.isVerified ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Bản dịch đã xác nhận</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Bản dịch tự động</span>
                    </>
                  )}
                </span>

                {translateResult.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Chuẩn ngữ cảnh</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200/80 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Theo ngữ cảnh</span>
                  </span>
                )}
              </div>

              {translateResult.isUnavailable ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm leading-relaxed">
                  Chưa thể dịch nội dung này lúc này. Vui lòng thử lại sau.
                </div>
              ) : (
                <div className="text-base sm:text-lg text-slate-900 leading-relaxed font-semibold whitespace-pre-line min-h-[90px]">
                  {translateResult.translatedText}
                </div>
              )}
            </div>

            {/* Action Buttons for Translated Text */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSaveTranslatedToNotebook}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs hover:border-blue-300"
              >
                <BookmarkPlus className="w-4 h-4 text-blue-600" />
                <span>{savedTranslateWord ? 'Đã lưu sổ tay' : 'Lưu vào sổ'}</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(translateResult.translatedText, 'translated')}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95 text-white ${
                  translateResult.isVerified
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copiedTranslated ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Sao chép bản dịch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Spelling Suggestions / Not Found Card in Dictionary Mode */}
      {activeTab === 'DICT' && error && !loading && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isNetworkError ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
              {isNetworkError ? <AlertCircle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">
                {error}
              </p>
              {isNetworkError ? (
                <p className="text-xs text-slate-500 mt-1">
                  Máy chủ tra cứu tạm thời không phản hồi. Bạn vui lòng thử lại sau giây lát.
                </p>
              ) : didYouMean ? (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Hệ thống không tìm thấy mục từ chính xác cho chuỗi này. Có thể bạn đã viết nhầm chính tả.
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Vui lòng kiểm tra lại chính tả hoặc thử chuyển sang tab <strong>Dịch văn bản</strong> nếu bạn muốn dịch câu hoặc đoạn văn.
                </p>
              )}
            </div>
          </div>

          {/* Quick Switch to Text Translation Banner if user entered a phrase/sentence */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
              <Languages className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Bạn đang muốn dịch cả câu hoặc đoạn văn tiếng Anh này sang tiếng Việt?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('TRANSLATE');
                setTranslateInput(searchTerm);
                doTranslate(searchTerm);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Dịch qua LibreTranslate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary "Did You Mean?" High Priority Banner */}
          {!isNetworkError && didYouMean && (
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
                <span>Tra từ "{didYouMean}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Alternative Similar Suggestions */}
          {!isNetworkError && suggestions && suggestions.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Các từ gợi ý có thể bạn muốn tra:
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

      {/* 4. Two-Column Study Layout for Dictionary Mode */}
      {activeTab === 'DICT' && (
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
                  Sẵn sàng tra cứu từ điển
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Nhập từ vựng tiếng Anh để xem phiên âm IPA chuẩn Cambridge, nghe phát âm và đối chiếu mạng lưới ngữ nghĩa WordNet.
                </p>
                <div className="pt-3 flex flex-wrap justify-center items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Gợi ý thử:</span>
                  {['hello', 'coffee', 'student', 'family', 'travel', 'take care of'].map((w) => (
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

            {/* Loading State Spinner */}
            {loading && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center space-y-3 animate-fade-in">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-600 font-bold text-sm">Đang tra cứu từ điển Anh - Việt & Anh - Anh...</p>
                <p className="text-xs text-slate-400">Đang truy vấn dữ liệu từ điển và mạng lưới ngữ nghĩa</p>
              </div>
            )}

            {/* Results Display */}
            {result && !loading && !error && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
                {/* Word Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
                      {result.word}
                    </h2>

                    {result.phonetic ? (
                      <p className="text-base font-mono text-blue-600 font-bold mt-1">
                        {result.phonetic}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        {result.isSentence ? 'Bản dịch ngữ nghĩa hoàn chỉnh' : 'Chưa có dữ liệu phiên âm IPA'}
                      </p>
                    )}

                    {result.source && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Nguồn: <span className="font-semibold text-slate-500">{result.source}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions: Speak & Save */}
                  <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-sm ${
                        isPlayingAudio
                          ? 'bg-amber-500 text-white shadow-amber-500/25 animate-pulse'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 fill-white text-white" />
                      <span>{isPlayingAudio ? 'Đang phát...' : 'Phát âm'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddToVocab}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition shadow-xs active:scale-95"
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

                {/* Vietnamese Meaning Box (Separated and Prominently Displayed) */}
                {result.vietnameseMeaning ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 border border-blue-200/80 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md inline-block">
                        Nghĩa tiếng Việt
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Bản dịch song ngữ</span>
                    </div>

                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                      {result.vietnameseMeaning}
                    </p>

                    {result.localExample && (
                      <div className="pt-2 border-t border-blue-200/50 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 italic">
                            "{result.localExample}"
                          </p>
                          <button
                            type="button"
                            onClick={() => speakText(result.localExample)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {result.localExampleMeaning && (
                          <p className="text-xs text-blue-800 font-medium">
                            → Dịch: "{result.localExampleMeaning}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">Chưa có bản dịch tiếng Việt</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Đang hiển thị toàn bộ định nghĩa Anh - Anh chi tiết từ nguồn từ điển quốc tế bên dưới.
                      </p>
                    </div>
                  </div>
                )}

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
                            {result.wordnet.antonyms.map((ant, aIdx) => {
                              const antWord = typeof ant === 'object' ? ant.word : ant;
                              const antMeaning = typeof ant === 'object' ? ant.meaningVi : '';
                              return (
                                <button
                                  key={aIdx}
                                  type="button"
                                  onClick={() => {
                                    setSearchTerm(antWord);
                                    doSearch(antWord);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold transition text-xs shadow-2xs"
                                >
                                  <span>{antWord}</span>
                                  {antMeaning && (
                                    <span className="text-[10px] font-normal text-rose-600 ml-1">({antMeaning})</span>
                                  )}
                                </button>
                              );
                            })}
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
                            {result.wordnet.synonyms.slice(0, 6).map((syn, sIdx) => {
                              const synWord = typeof syn === 'object' ? syn.word : syn;
                              const synMeaning = typeof syn === 'object' ? syn.meaningVi : '';
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => {
                                    setSearchTerm(synWord);
                                    doSearch(synWord);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold transition text-xs shadow-2xs"
                                >
                                  <span>{synWord}</span>
                                  {synMeaning && (
                                    <span className="text-[10px] font-normal text-blue-600 ml-1">({synMeaning})</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 3. Hypernyms (Thuộc nhóm / Cấp trên) */}
                      {result.wordnet.hypernyms && result.wordnet.hypernyms.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-purple-700 text-xs">
                            <span>Thuộc nhóm / Cấp trên (Hypernyms):</span>
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
                            <span>Cụ thể hơn / Cấp dưới (Hyponyms):</span>
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

                {/* Detailed Definitions by Part of Speech */}
                {result.meanings && result.meanings.length > 0 && (
                  <div className="space-y-5 pt-5 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Chi tiết định nghĩa theo từng từ loại (Part of Speech)
                    </h3>

                    {result.meanings.map((m, idx) => (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${getPosBadgeStyle(m.partOfSpeech)}`}>
                            {m.posLabel || m.partOfSpeech}
                          </span>
                        </div>

                        <div className="space-y-3 pl-1">
                          {m.definitions?.map((def, dIdx) => (
                            <div key={dIdx} className="space-y-1 border-l-2 border-blue-400 pl-3">
                              {/* Vietnamese Definition */}
                              {def.definitionVi && (
                                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                  {def.definitionVi}
                                </p>
                              )}

                              {/* English Original Definition */}
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                {def.definition}
                              </p>

                              {/* Example in Context */}
                              {def.example && (
                                <div className="pt-1 space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-blue-700 italic font-medium">
                                      Ví dụ: "{def.example}"
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => speakText(def.example)}
                                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                                      title="Nghe phát âm ví dụ"
                                    >
                                      <Volume2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {def.exampleVi && (
                                    <p className="text-xs text-slate-500 italic pl-1">
                                      → "{def.exampleVi}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      try {
                        localStorage.removeItem('e4b_recent_lookups');
                      } catch {}
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-500 font-medium transition"
                  >
                    Xóa lịch sử
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

            {/* Grouped Topics Card (Dynamically loaded from Database) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Từ vựng theo chủ đề (Database)
              </h3>

              <div className="space-y-3.5">
                {topics.map((group, gIdx) => (
                  <div key={gIdx} className="text-xs">
                    <span className="font-bold text-slate-400 text-[11px] block mb-1">
                      {group.topic}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.words.map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            setSearchTerm(w);
                            doSearch(w);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                            result?.word?.toLowerCase() === w.toLowerCase()
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
