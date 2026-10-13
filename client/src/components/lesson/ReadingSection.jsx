import React, { useState, useEffect, useRef } from 'react';
import {
  BookMarked,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Languages,
  RotateCcw,
  Lightbulb,
  Check,
  Send,
  HelpCircle,
  FileText,
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
    .replace(/\b20\b/g, 'twenty')
    .replace(/\b30\b/g, 'thirty')
    .replace(/\b10\b/g, 'ten')
    .replace(/\b15\b/g, 'fifteen')
    .replace(/\s+/g, ' ');
}

function checkSubjectiveMatch(userAns, question) {
  const normUser = normalizeText(userAns);
  if (!normUser) return false;

  const normCorrect = normalizeText(question.correctAnswer);
  if (normUser === normCorrect) return true;

  // Inclusion match
  if (normUser.length >= 4 && (normCorrect.includes(normUser) || normUser.includes(normCorrect))) {
    return true;
  }

  // Check matching option text
  if (Array.isArray(question.options)) {
    for (const opt of question.options) {
      const normOpt = normalizeText(opt);
      if (
        normOpt === normCorrect &&
        (normOpt === normUser || (normUser.length >= 5 && (normOpt.includes(normUser) || normUser.includes(normOpt))))
      ) {
        return true;
      }
    }
  }

  // Keywords matching: if at least 70% of significant keywords matched
  const correctKeywords = normCorrect.split(' ').filter((w) => w.length >= 4);
  if (correctKeywords.length > 0) {
    const userWords = new Set(normUser.split(' '));
    const matched = correctKeywords.filter((w) => userWords.has(w));
    if (matched.length / correctKeywords.length >= 0.7) {
      return true;
    }
  }

  return false;
}

export default function ReadingSection({ readings = [], onStepComplete }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [allQuestionsDone, setAllQuestionsDone] = useState(false);

  const inputRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsAdvancing(false);
  };

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, []);

  if (!readings || readings.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài đọc hiểu cho bài học này.</p>
      </div>
    );
  }

  const currentReading = readings[0];
  const questionsList = currentReading.questions || [];
  const currentQ = questionsList[currentQuestionIndex];

  // Sync input when question index changes
  useEffect(() => {
    clearAutoAdvanceTimer();
    setShowHint(false);
    const existing = userAnswers[currentQuestionIndex] || '';
    setCurrentInput(existing);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [currentQuestionIndex]);

  const handleCheckAnswer = () => {
    if (!currentInput.trim() || isAdvancing || showFeedback[currentQuestionIndex]?.isCorrect) return;

    const isMatch = checkSubjectiveMatch(currentInput, currentQ);
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: currentInput.trim() }));

    if (isMatch) {
      setShowFeedback((prev) => ({
        ...prev,
        [currentQuestionIndex]: { isCorrect: true, explanation: currentQ?.explanation },
      }));

      // Check if all questions are finished
      const updatedAnswers = { ...userAnswers, [currentQuestionIndex]: currentInput.trim() };
      const solvedCount = Object.keys(showFeedback).filter((k) => showFeedback[k]?.isCorrect).length + 1;

      if (currentQuestionIndex < questionsList.length - 1) {
        setIsAdvancing(true);
        autoAdvanceTimerRef.current = setTimeout(() => {
          setIsAdvancing(false);
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 1800);
      } else if (solvedCount >= questionsList.length) {
        setAllQuestionsDone(true);
        if (onStepComplete) onStepComplete(true);
      }
    } else {
      setShowFeedback((prev) => ({
        ...prev,
        [currentQuestionIndex]: { isCorrect: false },
      }));
    }
  };

  const handleNextQuestion = () => {
    clearAutoAdvanceTimer();
    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setAllQuestionsDone(true);
      if (onStepComplete) onStepComplete(true);
    }
  };

  const handleRetry = () => {
    setShowFeedback((prev) => {
      const next = { ...prev };
      delete next[currentQuestionIndex];
      return next;
    });
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const passageParagraphs = (currentReading.passage || '').split('\n\n');
  const translationParagraphs = (currentReading.translation || '').split('\n\n');
  const solvedCount = Object.values(showFeedback).filter((f) => f.isCorrect).length;

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* Top Header Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0 border border-teal-100">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                Bước 5 • Đọc hiểu tự luận
              </span>
              <span className="text-xs text-slate-400 font-bold">
                • {questionsList.length} câu hỏi tự luận
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {currentReading.title || 'Reading Comprehension (Tự luận)'}
            </h3>
          </div>
        </div>

        {/* Translation Toggle Button */}
        <button
          type="button"
          onClick={() => setShowTranslation((prev) => !prev)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto ${
            showTranslation
              ? 'bg-teal-600 text-white shadow-teal-500/20'
              : 'bg-white hover:bg-teal-50 text-teal-700 border border-teal-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Xem bản dịch tiếng Việt'}</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout: Left (Passage) & Right (Subjective Questions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (Passage Card) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Đoạn văn tiếng Anh</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Đọc và tìm thông tin trả lời
            </span>
          </div>

          {/* English Passage Text */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal max-h-[260px] sm:max-h-[460px] overflow-y-auto pr-1">
            {passageParagraphs.map((para, pIdx) => (
              <p key={pIdx} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                {para}
              </p>
            ))}
          </div>

          {/* Vietnamese Translation (Collapsible) */}
          {showTranslation && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2 text-xs text-teal-950 leading-relaxed font-medium animate-fade-in max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-1.5 font-bold text-teal-800 text-[11px] uppercase tracking-wide">
                <Languages className="w-3.5 h-3.5 text-teal-600" />
                <span>Bản dịch tiếng Việt tham khảo:</span>
              </div>
              <div className="space-y-2">
                {translationParagraphs.map((tPara, tIdx) => (
                  <p key={tIdx}>{tPara}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Subjective Free-response Card) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Câu hỏi tự luận ({currentQuestionIndex + 1}/{questionsList.length})
                </h4>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600">
              Đạt: <strong className="text-teal-600">{solvedCount}</strong> / {questionsList.length} câu
            </div>
          </div>

          {allQuestionsDone ? (
            <div className="p-8 text-center bg-teal-50/80 rounded-2xl border border-teal-200 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
              <h4 className="text-lg sm:text-xl font-black text-teal-950">
                Xuất sắc! Bạn đã trả lời đúng toàn bộ câu hỏi.
              </h4>
              <p className="text-xs text-teal-800 font-medium">
                Bạn đã hoàn thành Bước 5 và sẵn sàng sang Bước 6 (Bài tập tương tác).
              </p>
            </div>
          ) : currentQ && (
            <div className="space-y-4">
              {/* Question Prompt */}
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {currentQ.question}
                </p>
              </div>

              {/* Subjective Input Form */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Câu trả lời của bạn:
                  </label>
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      rows={3}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCheckAnswer();
                        }
                      }}
                      disabled={isAdvancing || showFeedback[currentQuestionIndex]?.isCorrect}
                      placeholder="Gõ câu trả lời bằng tiếng Anh dựa trên nội dung bài đọc..."
                      className={`w-full p-3.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition resize-none leading-relaxed ${
                        showFeedback[currentQuestionIndex]?.isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                          : showFeedback[currentQuestionIndex]?.isCorrect === false
                          ? 'bg-rose-50/60 border-rose-300 text-rose-950 focus:ring-4 focus:ring-rose-500/10'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {showFeedback[currentQuestionIndex]?.isCorrect === false && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Làm lại</span>
                      </button>
                    )}

                    {!showFeedback[currentQuestionIndex]?.isCorrect ? (
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        disabled={!currentInput.trim() || isAdvancing}
                        className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kiểm tra đáp án</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Câu tiếp theo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hint Box (Collapsible) */}
                {showHint && currentQ && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1 animate-fade-in font-medium">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gợi ý trả lời:</span>
                    </p>
                    <p className="leading-relaxed text-[11px]">
                      Hãy tìm từ khóa trong bài đọc liên quan đến: "<strong>{currentQ.question}</strong>".
                    </p>
                  </div>
                )}

                {/* Feedback: Success Banner */}
                {showFeedback[currentQuestionIndex]?.isCorrect && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fade-in text-xs">
                    <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Chính xác! Xuất sắc lắm!</span>
                    </div>
                    <div className="text-emerald-950 space-y-1 font-medium bg-white/70 p-3 rounded-lg border border-emerald-100">
                      <p>
                        <strong className="text-emerald-800">Đáp án chuẩn: </strong>
                        {currentQ.correctAnswer}
                      </p>
                      {currentQ.explanation && (
                        <p className="text-slate-600 pt-1 border-t border-emerald-100 text-[11px]">
                          <strong>Giải thích: </strong>
                          {currentQ.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Feedback: Wrong Alert */}
                {showFeedback[currentQuestionIndex]?.isCorrect === false && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900 animate-shake">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-rose-950">Câu trả lời chưa chính xác!</p>
                      <p className="text-rose-800 text-[11px]">
                        Hãy đọc kỹ lại thông tin trong đoạn văn tiếng Anh bên trái.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
