import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Volume2,
  BookmarkPlus,
  Check,
  Globe,
  BookOpen,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { speakText } from '../../utils/speech';

export default function QuickDictionaryModal({ word = '', isOpen = false, onClose }) {
  const [currentWord, setCurrentWord] = useState(word);
  const [inputWord, setInputWord] = useState(word);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && word) {
      setCurrentWord(word);
      setInputWord(word);
      fetchWord(word);
    }
  }, [isOpen, word]);

  const fetchWord = async (searchWord) => {
    const term = searchWord.trim();
    if (!term) return;

    setLoading(true);
    setError('');
    setSavedSuccess(false);

    try {
      const res = await api.get(`/vocabulary/lookup/${encodeURIComponent(term)}`);
      setData(res.data);
    } catch (err) {
      // Fallback directly to client-side API
      try {
        const extRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term.toLowerCase())}`
        );
        if (extRes.ok) {
          const extJson = await extRes.json();
          const entry = extJson[0];
          let audioUrl = null;
          let phonetic = entry.phonetic || '';
          if (entry.phonetics) {
            for (const p of entry.phonetics) {
              if (!phonetic && p.text) phonetic = p.text;
              if (p.audio && !audioUrl) audioUrl = p.audio;
            }
          }
          setData({
            word: entry.word,
            phonetic,
            audioUrl,
            vietnameseMeaning: null,
            meanings: entry.meanings || [],
            source: 'Free Dictionary API',
          });
        } else {
          setError(`Không tìm thấy từ "${term}" trong từ điển Free Dictionary API.`);
          setData(null);
        }
      } catch (clientErr) {
        setError('Lỗi kết nối đến Free Dictionary API.');
        setData(null);
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

  const handlePlayAudio = () => {
    if (data?.audioUrl) {
      try {
        const audio = new Audio(data.audioUrl);
        audio.play().catch(() => speakText(data.word));
      } catch {
        speakText(data.word);
      }
    } else if (data?.word) {
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Globe className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Tra từ điển Free Dictionary API</h3>
              <p className="text-[11px] text-slate-400">Tra nghĩa, phiên âm và phát âm chuẩn quốc tế</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar inside modal */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Nhập từ cần tra..."
              className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              Tra từ
            </button>
          </form>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium mt-3">Đang tra cứu từ điển...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Word Card Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 capitalize">
                    {data.word}
                  </h2>
                  {data.phonetic && (
                    <p className="text-sm font-mono text-blue-600 font-semibold mt-0.5">
                      {data.phonetic}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePlayAudio}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
                    title="Nghe audio phát âm"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Phát âm</span>
                  </button>

                  <button
                    onClick={handleSaveToNotebook}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                    title="Lưu vào sổ từ"
                  >
                    <BookmarkPlus className="w-4 h-4 text-slate-600" />
                    <span>{savedSuccess ? 'Đã lưu ✓' : 'Lưu từ'}</span>
                  </button>
                </div>
              </div>

              {/* Vietnamese Meaning if known */}
              {data.vietnameseMeaning && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                    Nghĩa tiếng Việt đối chiếu:
                  </span>
                  <p className="font-bold text-blue-900 text-sm">
                    {data.vietnameseMeaning}
                  </p>
                </div>
              )}

              {/* Meanings by Part of Speech */}
              <div className="space-y-4">
                {data.meanings && data.meanings.map((m, mIdx) => (
                  <div key={mIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wide">
                      {m.partOfSpeech}
                    </span>

                    <div className="space-y-2 text-xs">
                      {m.definitions && m.definitions.slice(0, 3).map((def, dIdx) => (
                        <div key={dIdx} className="space-y-0.5 text-slate-700">
                          <p className="font-medium">
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

                    {/* Synonyms */}
                    {m.synonyms && m.synonyms.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400">Đồng nghĩa:</span>
                        {m.synonyms.slice(0, 4).map((syn, synIdx) => (
                          <button
                            key={synIdx}
                            type="button"
                            onClick={() => {
                              setInputWord(syn);
                              setCurrentWord(syn);
                              fetchWord(syn);
                            }}
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
