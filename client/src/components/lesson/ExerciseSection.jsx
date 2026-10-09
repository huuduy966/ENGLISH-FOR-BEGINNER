import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  Lightbulb,
  Award,
  Sparkles,
  HelpCircle,
  Check,
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function ExerciseSection({ exercises = [], onStepComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [arrangedWords, setArrangedWords] = useState([]);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [allExercisesDone, setAllExercisesDone] = useState(false);

  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [wrongPairAnimation, setWrongPairAnimation] = useState(false);

  // Score counter
  const [correctCount, setCorrectCount] = useState(0);

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

  useEffect(() => {
    // Reset state on step / exercises change
    clearAutoAdvanceTimer();
    setCurrentIndex(0);
    setUserAnswers({});
    setShowFeedback({});
    setArrangedWords([]);
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setCorrectCount(0);
    setAllExercisesDone(false);
  }, [exercises]);

  const current = exercises[currentIndex];

  // Setup matching game data when current exercise is MATCHING
  useEffect(() => {
    if (!current || current.type !== 'MATCHING') return;

    let pairsData = [];
    if (current.options) {
      if (typeof current.options === 'string') {
        try {
          const parsed = JSON.parse(current.options);
          pairsData = parsed.pairs || [];
        } catch {
          pairsData = [];
        }
      } else if (current.options.pairs) {
        pairsData = current.options.pairs;
      }
    }

    if (pairsData.length === 0 && current.correctAnswer) {
      // Fallback parse "en:vi|en:vi"
      pairsData = current.correctAnswer.split('|').map((part) => {
        const [en, vi] = part.split(':');
        return { en: en || 'Word', vi: vi || 'Nghĩa' };
      });
    }

    // Scramble right side
    const scrambledRight = [...pairsData.map((p) => p.vi)].sort(() => 0.5 - Math.random());
    setMatchingPairs({
      leftItems: pairsData.map((p) => p.en),
      rightItems: scrambledRight,
      correctMap: Object.fromEntries(pairsData.map((p) => [p.en, p.vi])),
    });
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [currentIndex, current]);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-medium">Chưa có bài tập cho bài học này.</p>
      </div>
    );
  }

  if (allExercisesDone) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            Hoàn thành toàn bộ Bài tập!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Bạn đã vượt qua tất cả các bài tập tương tác ({exercises.length} câu) với {correctCount} câu trả lời đúng.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAllExercisesDone(false);
              setCurrentIndex(0);
              setUserAnswers({});
              setShowFeedback({});
              setCorrectCount(0);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại phần bài tập</span>
          </button>
        </div>
      </div>
    );
  }

  const isChecked = !!showFeedback[currentIndex];
  const isCorrect = showFeedback[currentIndex]?.isCorrect;

  // 1. Multiple Choice / Fill Blank Selection
  const handleSelectOption = (opt) => {
    if (isChecked) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  // 2. Word Order Logic: Click to add or click to remove
  const handleWordOrderBankClick = (word, indexInOptions) => {
    if (isChecked) return;
    setArrangedWords((prev) => {
      const next = [...prev, { text: word, origIdx: indexInOptions }];
      setUserAnswers((u) => ({ ...u, [currentIndex]: next.map((w) => w.text).join(' ') }));
      return next;
    });
  };

  const handleWordOrderRemoveWord = (clickedIdx) => {
    if (isChecked) return;
    setArrangedWords((prev) => {
      const next = prev.filter((_, i) => i !== clickedIdx);
      setUserAnswers((u) => ({ ...u, [currentIndex]: next.map((w) => w.text).join(' ') }));
      return next;
    });
  };

  const handleWordOrderReset = () => {
    if (isChecked) return;
    setArrangedWords([]);
    setUserAnswers((u) => ({ ...u, [currentIndex]: '' }));
  };

  // 3. Matching Game click handlers
  const handleMatchingLeftClick = (item) => {
    if (matchedPairs.has(item)) return;
    setSelectedLeft(item);

    if (selectedRight) {
      checkMatching(item, selectedRight);
    }
  };

  const handleMatchingRightClick = (item) => {
    if (Array.from(matchedPairs).some((p) => matchingPairs.correctMap[p] === item)) return;
    setSelectedRight(item);

    if (selectedLeft) {
      checkMatching(selectedLeft, item);
    }
  };

  const checkMatching = (left, right) => {
    if (matchingPairs.correctMap[left] === right) {
      const nextSet = new Set(matchedPairs);
      nextSet.add(left);
      setMatchedPairs(nextSet);
      setSelectedLeft(null);
      setSelectedRight(null);

      // If all matched!
      if (nextSet.size === matchingPairs.leftItems.length) {
        setCorrectCount((c) => c + 1);
        setShowFeedback((prev) => ({
          ...prev,
          [currentIndex]: {
            isCorrect: true,
            explanation: current.explanation || 'Xuất sắc! Bạn đã nối chính xác tất cả các cặp từ.',
          },
        }));

        // 1.5s Auto-advance
        setIsAdvancing(true);
        autoAdvanceTimerRef.current = setTimeout(() => {
          setIsAdvancing(false);
          if (currentIndex < exercises.length - 1) {
            handleNext();
          } else {
            setAllExercisesDone(true);
            if (onStepComplete) onStepComplete(true);
          }
        }, 1500);
      }
    } else {
      // Wrong match animation
      setWrongPairAnimation(true);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPairAnimation(false);
      }, 700);
    }
  };

  // Check Answer for non-matching questions
  const handleCheckAnswer = () => {
    if (isAdvancing) return;
    const ans = (userAnswers[currentIndex] || '').trim().toLowerCase();
    const correct = current.correctAnswer.trim().toLowerCase();

    const isMatch = ans === correct || correct.split('|').map((s) => s.trim().toLowerCase()).includes(ans);
    if (isMatch) {
      setCorrectCount((c) => c + 1);
    }

    setShowFeedback((prev) => ({
      ...prev,
      [currentIndex]: {
        isCorrect: isMatch,
        explanation: current.explanation || `Đáp án chính xác là: "${current.correctAnswer}".`,
      },
    }));

    if (isMatch) {
      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentIndex < exercises.length - 1) {
          handleNext();
        } else {
          setAllExercisesDone(true);
          if (onStepComplete) onStepComplete(true);
        }
      }, 1500);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setArrangedWords([]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setArrangedWords([]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  // Parse options safely
  let parsedOptions = [];
  if (current.options) {
    if (Array.isArray(current.options)) {
      parsedOptions = current.options;
    } else if (typeof current.options === 'string') {
      try {
        const p = JSON.parse(current.options);
        parsedOptions = Array.isArray(p) ? p : (p.pairs ? [] : []);
      } catch {
        parsedOptions = [];
      }
    }
  }

  // Type label formatter
  const getTypeBadge = (type = '') => {
    switch (type) {
      case 'MATCHING':
        return { label: 'Trò chơi nối từ', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'WORD_ORDER':
        return { label: 'Sắp xếp câu', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'FILL_BLANK':
        return { label: 'Chọn từ điền khuyết', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'LISTEN_CHOOSE':
        return { label: 'Nghe và chọn', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'ERROR_CORRECTION':
        return { label: 'Tìm và sửa lỗi sai', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'TRANSLATION':
        return { label: 'Dịch câu', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: 'Trắc nghiệm', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const typeInfo = getTypeBadge(current.type);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Header Tracker */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black text-slate-800">
            Bài tập {currentIndex + 1} / {exercises.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.bg}`}>
            {typeInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">
            Điểm: <strong className="text-emerald-600">{correctCount}</strong> / {exercises.length}
          </span>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Question Prompt */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
            {current.question}
          </h3>
        </div>

        {/* 1. LISTEN AND CHOOSE AUDIO TRIGGER */}
        {current.type === 'LISTEN_CHOOSE' && (
          <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col items-center justify-center gap-3 text-center">
            <button
              type="button"
              onClick={() => speakText(current.correctAnswer)}
              className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <div>
              <p className="text-xs font-bold text-purple-900">Bấm loa để nghe phát âm</p>
              <p className="text-[11px] text-purple-600">Lắng nghe cẩn thận và chọn từ chính xác bên dưới</p>
            </div>
          </div>
        )}

        {/* 2. MATCHING PAIRS INTERACTIVE GAME */}
        {current.type === 'MATCHING' && matchingPairs.leftItems && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Left Column (English words) */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Cột A: Từ tiếng Anh
                </span>
                {matchingPairs.leftItems.map((item, idx) => {
                  const isMatched = matchedPairs.has(item);
                  const isSelected = selectedLeft === item;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMatchingLeftClick(item)}
                      disabled={isMatched || isChecked}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl text-left font-bold text-xs sm:text-sm border transition-all flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-90 shadow-2xs'
                          : isSelected
                          ? wrongPairAnimation
                            ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-400/20'
                            : 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 translate-x-1'
                          : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Vietnamese meanings) */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Cột B: Nghĩa tiếng Việt
                </span>
                {matchingPairs.rightItems.map((item, idx) => {
                  const isMatched = Array.from(matchedPairs).some(
                    (p) => matchingPairs.correctMap[p] === item
                  );
                  const isSelected = selectedRight === item;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMatchingRightClick(item)}
                      disabled={isMatched || isChecked}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl text-left font-bold text-xs sm:text-sm border transition-all flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-90 shadow-2xs'
                          : isSelected
                          ? wrongPairAnimation
                            ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-400/20'
                            : 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 -translate-x-1'
                          : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {matchedPairs.size === matchingPairs.leftItems.length && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Bạn đã ghép nối thành công toàn bộ các cặp từ vựng!</span>
              </div>
            )}
          </div>
        )}

        {/* 3. WORD ORDER INTERACTIVE DRAG/CLICK */}
        {current.type === 'WORD_ORDER' && (
          <div className="space-y-4">
            {/* Sentence construction box */}
            <div className="min-h-18 p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center">
              {arrangedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Chạm vào các từ bên dưới theo đúng trật tự để tạo thành câu hoàn chỉnh...
                </span>
              ) : (
                arrangedWords.map((w, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    onClick={() => handleWordOrderRemoveWord(wIdx)}
                    disabled={isChecked}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center gap-1.5"
                    title="Bấm để đưa từ này về lại danh sách"
                  >
                    <span>{w.text}</span>
                    <span className="text-[10px] text-blue-200">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Word Bank options */}
            <div className="flex flex-wrap gap-2 pt-1">
              {parsedOptions.map((word, wIdx) => {
                const isUsed = arrangedWords.some((w) => w.origIdx === wIdx);
                return (
                  <button
                    key={wIdx}
                    type="button"
                    onClick={() => handleWordOrderBankClick(word, wIdx)}
                    disabled={isUsed || isChecked}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                      isUsed
                        ? 'opacity-25 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-blue-400 text-slate-700 hover:bg-blue-50 shadow-2xs active:scale-95'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleWordOrderReset}
                disabled={isChecked || arrangedWords.length === 0}
                className="font-bold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa làm lại câu</span>
              </button>
              <span className="text-slate-400 text-[11px]">Bấm vào từ đã ghép để hoàn tác</span>
            </div>
          </div>
        )}

        {/* 4. MULTIPLE CHOICE, FILL BLANK, ERROR CORRECTION, TRANSLATION */}
        {['MULTIPLE_CHOICE', 'FILL_BLANK', 'ERROR_CORRECTION', 'TRANSLATION', 'LISTEN_CHOOSE'].includes(
          current.type
        ) && (
          <div className="space-y-3">
            {parsedOptions.map((opt, idx) => {
              const isSelected = userAnswers[currentIndex] === opt;
              let style = 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white';

              if (isChecked) {
                if (opt.toLowerCase() === current.correctAnswer.toLowerCase()) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  style = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 font-bold';
                }
              } else if (isSelected) {
                style = 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-2 ring-blue-500/20';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isChecked}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {isChecked && opt.toLowerCase() === current.correctAnswer.toLowerCase() && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isChecked && isSelected && opt.toLowerCase() !== current.correctAnswer.toLowerCase() && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Display Box after Checking Answer */}
        {isChecked && (
          <div
            className={`p-5 rounded-2xl border text-xs sm:text-sm animate-fade-in flex items-start gap-3.5 ${
              isCorrect
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-extrabold text-sm sm:text-base">
                {isCorrect ? '🎉 Tuyệt vời! Bạn đã trả lời chính xác.' : 'Chưa chính xác!'}
              </p>
              {!isCorrect && (
                <p className="font-semibold text-rose-800">
                  Đáp án đúng: <span className="underline">{current.correctAnswer}</span>
                </p>
              )}
              {showFeedback[currentIndex]?.explanation && (
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  💡 <strong>Giải thích:</strong> {showFeedback[currentIndex].explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Câu trước
          </button>

          <div className="flex items-center gap-2">
            {!isChecked && current.type !== 'MATCHING' && (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={!userAnswers[currentIndex]}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Kiểm tra đáp án
              </button>
            )}

            {(isChecked || (current.type === 'MATCHING' && matchedPairs.size === matchingPairs.leftItems?.length)) && (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === exercises.length - 1}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
