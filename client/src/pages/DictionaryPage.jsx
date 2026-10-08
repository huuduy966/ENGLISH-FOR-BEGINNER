import React, { useState } from 'react';
import {
  Search,
  Volume2,
  BookmarkPlus,
  BookOpen,
  Check,
  Globe,
  ExternalLink,
  Info,
  AlertCircle,
  Play,
} from 'lucide-react';
import { speakText } from '../utils/speech';
import api from '../services/api';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('beautiful');
  const [result, setResult] = useState({
    word: 'beautiful',
    phonetic: '/ˈbjuːtɪfəl/',
    audioUrl: null,
    vietnameseMeaning: 'Đẹp đẽ, xinh đẹp, tuyệt vời',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Pleasing the senses or mind aesthetically.',
            example: 'Beautiful poetry and music make life richer.',
            synonyms: ['pretty', 'attractive', 'gorgeous', 'lovely'],
          },
          {
            definition: 'Of a very high standard; excellent.',
            example: 'She did a beautiful job on the presentation.',
            synonyms: ['wonderful', 'splendid', 'flawless'],
          },
        ],
      },
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'That which is beautiful, or the beauty of things.',
            example: 'He appreciates the beauty in everyday things.',
            synonyms: [],
          },
        ],
      },
    ],
    source: 'Free Dictionary API',
  });

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const popularWords = [
    'hello',
    'apple',
    'student',
    'coffee',
    'family',
    'beautiful',
    'knowledge',
    'journey',
  ];

  const doSearch = async (wordToSearch) => {
    const term = wordToSearch.trim();
    if (!term) return;

    setLoading(true);
    setError('');
    setSavedSuccess(false);

    try {
      // Fetch through our enriched backend proxy that integrates Free Dictionary API
      const res = await api.get(`/vocabulary/lookup/${encodeURIComponent(term)}`);
      setResult(res.data);
    } catch (err) {
      console.warn('Backend lookup fallback to client-side Free Dictionary API:', err);
      // Fallback: direct browser fetch to Free Dictionary API
      try {
        const extRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term.toLowerCase())}`
        );
        if (extRes.ok) {
          const extData = await extRes.json();
          const entry = extData[0];

          let foundAudio = null;
          let phoneticText = entry.phonetic || '';
          if (entry.phonetics && Array.isArray(entry.phonetics)) {
            for (const p of entry.phonetics) {
              if (!phoneticText && p.text) phoneticText = p.text;
              if (p.audio && !foundAudio) foundAudio = p.audio;
            }
          }

          setResult({
            word: entry.word,
            phonetic: phoneticText,
            audioUrl: foundAudio,
            vietnameseMeaning: null,
            meanings: entry.meanings || [],
            source: 'Free Dictionary API',
          });
        } else {
          setError(`Không tìm thấy từ "${term}" trong từ điển Free Dictionary API. Bạn hãy kiểm tra lại chính tả nhé.`);
        }
      } catch (clientErr) {
        setError('Không thể kết nối đến Free Dictionary API. Vui lòng kiểm tra lại kết nối mạng.');
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
    if (result?.audioUrl) {
      try {
        setIsPlayingAudio(true);
        const audio = new Audio(result.audioUrl);
        audio.play();
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          setIsPlayingAudio(false);
          speakText(result.word);
        };
      } catch (err) {
        setIsPlayingAudio(false);
        speakText(result.word);
      }
    } else {
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
      console.error('Save custom vocab error:', err);
      // Visual feedback even if guest
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>Powered by Free Dictionary API</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Từ điển Anh - Anh chuẩn Quốc tế
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tra cứu phát âm bản xứ chuẩn IPA, file audio thực tế, các tầng nghĩa chi tiết và từ đồng nghĩa.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative shadow-md shadow-slate-200/50 rounded-3xl">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập từ tiếng Anh (ví dụ: hello, student, coffee, beautiful)..."
          className="w-full pl-12 pr-32 py-4 rounded-3xl border border-slate-200 text-base focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4.5" />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Tra cứu</span>
          )}
        </button>
      </form>

      {/* Popular Suggestions Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400">Gợi ý từ phổ biến:</span>
        {popularWords.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => {
              setSearchTerm(word);
              doSearch(word);
            }}
            className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 font-medium transition shadow-2xs"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-bold">Không tìm thấy kết quả</p>
            <p className="text-xs mt-1 text-rose-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Main Result Card */}
      {result && !error && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6 animate-fade-in">
          {/* Top Word Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
                  {result.word}
                </h2>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Free Dictionary API
                </span>
              </div>

              {result.phonetic && (
                <p className="text-lg font-mono text-blue-600 font-semibold mt-1">
                  {result.phonetic}
                </p>
              )}
            </div>

            {/* Audio Play & Save Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayAudio}
                className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-2 transition shadow-2xs active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>{result.audioUrl ? 'Nghe Audio bản xứ' : 'Phát âm'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToVocab}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
              >
                <BookmarkPlus className="w-4 h-4 text-slate-600" />
                <span className="flex items-center gap-1">
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                      <span className="text-emerald-700">Đã lưu vào sổ</span>
                    </>
                  ) : (
                    <span>Lưu vào Sổ từ</span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Vietnamese meaning highlight if exists */}
          {result.vietnameseMeaning && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
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

          {/* Detailed Meanings grouped by Part of Speech */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Định nghĩa theo từ loại (Parts of Speech)
            </h3>

            {result.meanings && result.meanings.map((meaning, mIdx) => (
              <div
                key={mIdx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4"
              >
                {/* Part of Speech Pill */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wide">
                    {meaning.partOfSpeech}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Definitions List */}
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
                        <p className="pl-5 text-slate-500 italic">
                          "{def.example}"
                        </p>
                      )}

                      {/* Synonyms for this definition */}
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
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 text-[11px] font-medium"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Shared Synonyms for this Part of Speech */}
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
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[11px] transition"
                      >
                        {syn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
