import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Volume2,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  Layers,
  Send,
  RotateCcw,
  XCircle,
  HelpCircle,
  PenTool,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.,!?;:"'()]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Validate subjective grammar exercise answer
 * Accepts model sentence, any example sentence, or sentences matching the grammar formula pattern
 */
function validateGrammarAnswer(userAns, gp, modelEx) {
  const normUser = normalizeText(userAns);
  if (!normUser || normUser.length < 3) return { isValid: false, reason: 'Vui lòng nhập câu hoàn chỉnh.' };

  // 1. Direct match with primary model example
  if (modelEx && modelEx.en) {
    const normModel = normalizeText(modelEx.en);
    if (normUser === normModel || (normUser.length >= 6 && normModel.includes(normUser))) {
      return { isValid: true, matchedModel: modelEx.en };
    }
  }

  // 2. Match with any example in this grammar point
  let examplesList = [];
  if (gp.examples) {
    try {
      const parsed = typeof gp.examples === 'string' ? JSON.parse(gp.examples) : gp.examples;
      if (Array.isArray(parsed)) examplesList = parsed;
      else if (parsed?.list) examplesList = parsed.list;
    } catch {}
  }

  for (const ex of examplesList) {
    if (ex.en) {
      const normEx = normalizeText(ex.en);
      if (normUser === normEx || (normUser.length >= 6 && (normEx.includes(normUser) || normUser.includes(normEx)))) {
        return { isValid: true, matchedModel: ex.en };
      }
    }
  }

  // 3. Formula structural validation
  const formula = (gp.formula || '').toLowerCase();
  const words = normUser.split(' ');

  // For "My name is" / "I am"
  if (formula.includes('my name is') || formula.includes('i am')) {
    if ((normUser.includes('my name is') || normUser.includes('i am') || normUser.includes("i'm")) && words.length >= 3) {
      return { isValid: true, matchedModel: userAns.trim() };
    }
  }

  // For negative / questions "do not" / "does not" / "don't" / "doesn't"
  if (formula.includes('do/does') || formula.includes('not') || formula.includes('do not')) {
    if (
      (normUser.includes('do not') ||
        normUser.includes('does not') ||
        normUser.includes("don't") ||
        normUser.includes("doesn't") ||
        normUser.startsWith('do ') ||
        normUser.startsWith('does ')) &&
      words.length >= 3
    ) {
      return { isValid: true, matchedModel: userAns.trim() };
    }
  }

  // For To Be (am/is/are)
  if (formula.includes('to be') || formula.includes('am/is/are')) {
    if (words.some((w) => ['is', 'are', 'am', "i'm", "she's", "he's", "it's", "they're", "we're"].includes(w)) && words.length >= 3) {
      return { isValid: true, matchedModel: userAns.trim() };
    }
  }

  // If user wrote a plausible English sentence of at least 4 words
  if (words.length >= 4 && /^[a-zA-Z\s.,!?'"-]+$/.test(userAns.trim())) {
    return { isValid: true, matchedModel: userAns.trim() };
  }

  return {
    isValid: false,
    reason: `Câu chưa đúng cấu trúc. Hãy áp dụng công thức: "${gp.formula || gp.title}"`,
  };
}

export default function GrammarSection({ grammarPoints = [], onStepComplete }) {
  const [expandedIndices, setExpandedIndices] = useState(() => new Set([0]));
  const [activeTab, setActiveTab] = useState('THEORY'); // 'THEORY' | 'PRACTICE'

  // Subjective practice answers per grammar point index
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [hintsVisible, setHintsVisible] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!grammarPoints || grammarPoints.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài giảng ngữ pháp cho bài học này.</p>
      </div>
    );
  }

  // Toggle single accordion card in theory view
  const toggleCard = (index) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const allExpanded = expandedIndices.size === grammarPoints.length;
  const handleToggleAll = () => {
    if (allExpanded) setExpandedIndices(new Set());
    else setExpandedIndices(new Set(grammarPoints.map((_, i) => i)));
  };

  // Submit subjective answer for a grammar point
  const handleCheckGrammarExercise = (idx, gp, modelEx) => {
    const userAns = (answers[idx] || '').trim();
    if (!userAns) return;

    const result = validateGrammarAnswer(userAns, gp, modelEx);
    if (result.isValid) {
      const updatedFeedbacks = {
        ...feedbacks,
        [idx]: {
          isCorrect: true,
          explanation: gp.explanation,
          modelSentence: result.matchedModel || modelEx?.en || userAns,
        },
      };
      setFeedbacks(updatedFeedbacks);

      // Check if all grammar points have been solved
      const solvedCount = Object.values(updatedFeedbacks).filter((f) => f.isCorrect).length;
      if (solvedCount >= grammarPoints.length) {
        setIsCompleted(true);
        if (onStepComplete) onStepComplete(true);
      }
    } else {
      setFeedbacks((prev) => ({
        ...prev,
        [idx]: {
          isCorrect: false,
          reason: result.reason,
        },
      }));
    }
  };

  const handleRetryExercise = (idx) => {
    setFeedbacks((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const solvedCount = Object.values(feedbacks).filter((f) => f.isCorrect).length;

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* 1. Header Toolbar with Mode Switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Bước 3 • Ngữ pháp & Tự luận
              </span>
              <span className="text-xs text-slate-400 font-bold">
                • {grammarPoints.length} điểm ngữ pháp
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              Quy tắc & Bài tập Tự luận Ngữ pháp
            </h3>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('THEORY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'THEORY'
                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lý thuyết</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PRACTICE')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'PRACTICE'
                ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Tự luận ({solvedCount}/{grammarPoints.length})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: THEORY ACCORDION CARDS */}
      {/* ===================================================================== */}
      {activeTab === 'THEORY' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-slate-400 font-semibold">Đọc kỹ công thức trước khi làm </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
            </button>
          </div>

          {grammarPoints.map((gp, idx) => {
            const isExpanded = expandedIndices.has(idx);

            let examplesList = [];
            if (gp.examples) {
              try {
                const parsed = typeof gp.examples === 'string' ? JSON.parse(gp.examples) : gp.examples;
                if (Array.isArray(parsed)) examplesList = parsed;
                else if (parsed?.list) examplesList = parsed.list;
              } catch {}
            }

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isExpanded ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleCard(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left bg-white hover:bg-slate-50/60 transition select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {gp.title}
                      </h4>
                      {gp.formula && (
                        <p className="font-mono text-xs text-blue-700 font-bold mt-0.5 line-clamp-1">
                          {gp.formula}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-slate-100 space-y-4 animate-fade-in">
                    {/* Formula */}
                    {gp.formula && (
                      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-blue-50/80 border border-blue-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-800 uppercase tracking-wider">
                          <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cấu trúc / Công thức:</span>
                        </div>
                        <p className="font-mono text-sm sm:text-base font-black text-blue-950 tracking-wide">
                          {gp.formula}
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    {gp.explanation && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Cách dùng & Giải thích:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 font-medium">
                          {gp.explanation}
                        </p>
                      </div>
                    )}

                    {/* Bilingual Examples with Audio */}
                    {examplesList.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ví dụ minh họa thực tế:</span>
                        </div>

                        <div className="grid gap-2">
                          {examplesList.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="p-3 rounded-xl bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition"
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-bold text-blue-900">{ex.en}</p>
                                <p className="text-xs text-slate-600 font-medium">{ex.vi}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => speakText(ex.en)}
                                className="self-start sm:self-auto px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold shrink-0"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Phát âm</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Jump to Practice button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('PRACTICE')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 mx-auto"
            >
              <PenTool className="w-4 h-4" />
              <span>Chuyển sang làm Bài tập tự luận ngữ pháp</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SUBJECTIVE GRAMMAR PRACTICE EXERCISES */}
      {/* ===================================================================== */}
      {activeTab === 'PRACTICE' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs text-blue-950 font-medium">
            <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-blue-900">Yêu cầu bài tập tự luận ngữ pháp:</p>
              <p className="leading-relaxed">
                Áp dụng công thức và kiến thức ngữ pháp của từng mục để tự viết hoặc hoàn thành câu tiếng Anh vào ô trống. Hoàn thành toàn bộ câu tự luận để mở khóa bước tiếp theo.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {grammarPoints.map((gp, idx) => {
              let examplesList = [];
              if (gp.examples) {
                try {
                  const parsed = typeof gp.examples === 'string' ? JSON.parse(gp.examples) : gp.examples;
                  if (Array.isArray(parsed)) examplesList = parsed;
                  else if (parsed?.list) examplesList = parsed.list;
                } catch {}
              }

              const primaryExample = examplesList[0] || null;
              const feedback = feedbacks[idx];
              const isCorrect = feedback?.isCorrect;
              const isHintOpen = hintsVisible[idx];

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs space-y-3.5 ${
                    isCorrect
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                      : feedback?.isCorrect === false
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                          {gp.title}
                        </h4>
                        {gp.formula && (
                          <span className="text-[11px] font-mono font-bold text-blue-600 block mt-0.5">
                            Công thức: {gp.formula}
                          </span>
                        )}
                      </div>
                    </div>

                    {isCorrect && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Đã làm đúng</span>
                      </span>
                    )}
                  </div>

                  {/* Prompt Text */}
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                      {primaryExample?.vi ? (
                        <>
                          Hãy viết câu tiếng Anh áp dụng cấu trúc trên cho nghĩa: <span className="text-blue-700 italic font-bold">"{primaryExample.vi}"</span>
                        </>
                      ) : (
                        <>
                          Hãy viết một câu tiếng Anh hoàn chỉnh áp dụng cấu trúc: <span className="font-mono text-blue-700">{gp.formula}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Subjective Input Form */}
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={answers[idx] || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCheckGrammarExercise(idx, gp, primaryExample);
                          }
                        }}
                        disabled={isCorrect}
                        placeholder="Nhập câu tiếng Anh của bạn vào đây..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold outline-none transition ${
                          isCorrect
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                            : feedback?.isCorrect === false
                            ? 'bg-rose-50/60 border-rose-300 text-rose-950 focus:ring-4 focus:ring-rose-500/10'
                            : 'bg-slate-50 focus:bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Action Buttons for this item */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setHintsVisible((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>{isHintOpen ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {feedback?.isCorrect === false && (
                          <button
                            type="button"
                            onClick={() => handleRetryExercise(idx)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Làm lại</span>
                          </button>
                        )}

                        {!isCorrect ? (
                          <button
                            type="button"
                            onClick={() => handleCheckGrammarExercise(idx, gp, primaryExample)}
                            disabled={!answers[idx]?.trim()}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kiểm tra câu</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Chính xác!</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hint Box */}
                    {isHintOpen && primaryExample && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1 animate-fade-in font-medium">
                        <p className="font-bold text-[11px] text-amber-950 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-600" />
                          <span>Gợi ý mẫu câu:</span>
                        </p>
                        <p className="font-bold text-blue-900">{primaryExample.en}</p>
                      </div>
                    )}

                    {/* Feedback: Success Banner */}
                    {isCorrect && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 animate-fade-in text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Chuẩn ngữ pháp! Bạn đã áp dụng đúng quy tắc.</span>
                        </div>
                        {feedback.modelSentence && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between gap-2">
                            <p className="font-bold text-emerald-950 text-xs">
                              Câu mẫu: "{feedback.modelSentence}"
                            </p>
                            <button
                              type="button"
                              onClick={() => speakText(feedback.modelSentence)}
                              className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback: Error Banner */}
                    {feedback?.isCorrect === false && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-900 animate-shake">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-950">Chưa đúng ngữ pháp!</p>
                          <p className="text-[11px] text-rose-800">{feedback.reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Bottom Step Completion Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="space-y-0.5">
          <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Tiến độ phần Ngữ pháp tự luận ({solvedCount}/{grammarPoints.length} câu)</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {isCompleted
              ? '✅ Xuất sắc! Bạn đã hoàn thành toàn bộ bài tập tự luận Ngữ pháp. Hãy chuyển sang Bước 4 (Luyện nghe).'
              : 'Hãy hoàn thành các câu tự luận ở trên để mở khóa bước tiếp theo.'}
          </p>
        </div>

        {isCompleted && (
          <span className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Đã hoàn thành Bước 3</span>
          </span>
        )}
      </div>
    </div>
  );
}
