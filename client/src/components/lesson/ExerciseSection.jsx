import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  AlertCircle,
  Link2,
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
  const [matchingPairs, setMatchingPairs] = useState({ leftItems: [], rightItems: [], correctMap: {} });
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set()); // Set of left items that are correctly matched
  const [wrongPair, setWrongPair] = useState(null); // { left, right } when wrong
  const [lines, setLines] = useState([]); // Array of { id, x1, y1, x2, y2, status: 'matched'|'wrong'|'pending' }

  // Score counter (+4 on correct, -2 on wrong)
  const [exerciseScore, setExerciseScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const containerRef = useRef(null);
  const leftItemRefs = useRef({});
  const rightItemRefs = useRef({});
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
    clearAutoAdvanceTimer();
    setCurrentIndex(0);
    setUserAnswers({});
    setShowFeedback({});
    setArrangedWords([]);
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    setLines([]);
    setExerciseScore(0);
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
    setWrongPair(null);
    setLines([]);
  }, [currentIndex, current]);

  // Recalculate SVG lines connecting matched and active pairs
  const updateSvgLines = () => {
    if (!containerRef.current || !current || current.type !== 'MATCHING') return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    // 1. Draw confirmed matched lines
    matchedPairs.forEach((leftItem) => {
      const rightItem = matchingPairs.correctMap[leftItem];
      const leftEl = leftItemRefs.current[leftItem];
      const rightEl = rightItemRefs.current[rightItem];

      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        newLines.push({
          id: `matched-${leftItem}`,
          x1: leftRect.right - containerRect.left,
          y1: leftRect.top + leftRect.height / 2 - containerRect.top,
          x2: rightRect.left - containerRect.left,
          y2: rightRect.top + rightRect.height / 2 - containerRect.top,
          status: 'matched',
        });
      }
    });

    // 2. Draw wrong match line if active
    if (wrongPair) {
      const leftEl = leftItemRefs.current[wrongPair.left];
      const rightEl = rightItemRefs.current[wrongPair.right];
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        newLines.push({
          id: `wrong-${wrongPair.left}-${wrongPair.right}`,
          x1: leftRect.right - containerRect.left,
          y1: leftRect.top + leftRect.height / 2 - containerRect.top,
          x2: rightRect.left - containerRect.left,
          y2: rightRect.top + rightRect.height / 2 - containerRect.top,
          status: 'wrong',
        });
      }
    }

    setLines(newLines);
  };

  useLayoutEffect(() => {
    updateSvgLines();
  }, [matchedPairs, wrongPair, selectedLeft, selectedRight]);

  useEffect(() => {
    window.addEventListener('resize', updateSvgLines);
    return () => window.removeEventListener('resize', updateSvgLines);
  }, [matchedPairs, wrongPair]);

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
            Bạn đã vượt qua tất cả các bài tập ({exercises.length} câu) với {correctCount} câu trả lời đúng và đạt {exerciseScore} điểm kỹ năng.
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
              setExerciseScore(0);
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

  // --- MATCHING LOGIC ---
  const handleMatchingLeftClick = (item) => {
    if (matchedPairs.has(item) || isAdvancing) return;
    if (selectedLeft === item) {
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(item);
    if (selectedRight) {
      checkMatching(item, selectedRight);
    }
  };

  const handleMatchingRightClick = (item) => {
    const isAlreadyMatched = Array.from(matchedPairs).some(
      (left) => matchingPairs.correctMap && matchingPairs.correctMap[left] === item
    );
    if (isAlreadyMatched || isAdvancing) return;
    if (selectedRight === item) {
      setSelectedRight(null);
      return;
    }
    setSelectedRight(item);
    if (selectedLeft) {
      checkMatching(selectedLeft, item);
    }
  };

  const checkMatching = (left, right) => {
    const isMatch = matchingPairs.correctMap && matchingPairs.correctMap[left] === right;

    if (isMatch) {
      const nextSet = new Set(matchedPairs);
      nextSet.add(left);
      setMatchedPairs(nextSet);
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongPair(null);
      setExerciseScore((s) => s + 4);

      // If all items matched!
      if (nextSet.size === matchingPairs.leftItems.length) {
        setCorrectCount((c) => c + 1);
        setShowFeedback((prev) => ({
          ...prev,
          [currentIndex]: {
            isCorrect: true,
            explanation: current.explanation || 'Xuất sắc!',
          },
        }));

        // 1.5s Auto-advance
        setIsAdvancing(true);
        autoAdvanceTimerRef.current = setTimeout(() => {
          setIsAdvancing(false);
          if (currentIndex < exercises.length - 1) {
            handleAdvanceToNext();
          } else {
            setAllExercisesDone(true);
            if (onStepComplete) onStepComplete(true);
          }
        }, 1500);
      }
    } else {
      // Wrong match: penalty -2, show red line & shake, then clear
      setExerciseScore((s) => Math.max(0, s - 2));
      setWrongPair({ left, right });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 750);
    }
  };

  // --- MULTIPLE CHOICE / OPTIONS SELECTION (1.5s Auto-Advance on Correct, Retry on Wrong) ---
  const handleSelectOption = (opt) => {
    if (isAdvancing || showFeedback[currentIndex]?.isCorrect) return;

    setUserAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
    const correct = current.correctAnswer.trim().toLowerCase();
    const ans = opt.trim().toLowerCase();
    const isMatch = ans === correct || correct.split('|').map((s) => s.trim().toLowerCase()).includes(ans);

    if (isMatch) {
      setCorrectCount((c) => c + 1);
      setExerciseScore((s) => s + 4);
      setShowFeedback((prev) => ({
        ...prev,
        [currentIndex]: {
          isCorrect: true,
          explanation: current.explanation || `Chính xác! "${current.correctAnswer}".`,
        },
      }));

      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentIndex < exercises.length - 1) {
          handleAdvanceToNext();
        } else {
          setAllExercisesDone(true);
          if (onStepComplete) onStepComplete(true);
        }
      }, 1500);
    } else {
      setExerciseScore((s) => Math.max(0, s - 2));
      setShowFeedback((prev) => ({
        ...prev,
        [currentIndex]: {
          isCorrect: false,
          explanation: 'Chưa chính xác! Vui lòng chọn lại đáp án đúng.',
        },
      }));
    }
  };

  // --- WORD ORDER LOGIC ---
  const handleWordOrderBankClick = (word, indexInOptions) => {
    if (isAdvancing || showFeedback[currentIndex]?.isCorrect) return;
    setArrangedWords((prev) => {
      const next = [...prev, { text: word, origIdx: indexInOptions }];
      setUserAnswers((u) => ({ ...u, [currentIndex]: next.map((w) => w.text).join(' ') }));
      return next;
    });
  };

  const handleWordOrderRemoveWord = (clickedIdx) => {
    if (isAdvancing || showFeedback[currentIndex]?.isCorrect) return;
    setArrangedWords((prev) => {
      const next = prev.filter((_, i) => i !== clickedIdx);
      setUserAnswers((u) => ({ ...u, [currentIndex]: next.map((w) => w.text).join(' ') }));
      return next;
    });
  };

  const handleWordOrderReset = () => {
    if (isAdvancing || showFeedback[currentIndex]?.isCorrect) return;
    setArrangedWords([]);
    setUserAnswers((u) => ({ ...u, [currentIndex]: '' }));
    setShowFeedback((prev) => ({ ...prev, [currentIndex]: null }));
  };

  const handleCheckWordOrder = () => {
    if (isAdvancing || arrangedWords.length === 0) return;
    const constructed = arrangedWords.map((w) => w.text).join(' ').trim().toLowerCase();
    const target = current.correctAnswer.trim().toLowerCase();
    const isMatch = constructed === target;

    if (isMatch) {
      setCorrectCount((c) => c + 1);
      setExerciseScore((s) => s + 4);
      setShowFeedback((prev) => ({
        ...prev,
        [currentIndex]: {
          isCorrect: true,
          explanation: current.explanation || `Chính xác! "${current.correctAnswer}".`,
        },
      }));

      setIsAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentIndex < exercises.length - 1) {
          handleAdvanceToNext();
        } else {
          setAllExercisesDone(true);
          if (onStepComplete) onStepComplete(true);
        }
      }, 1500);
    } else {
      setExerciseScore((s) => Math.max(0, s - 2));
      setShowFeedback((prev) => ({
        ...prev,
        [currentIndex]: {
          isCorrect: false,
          explanation: 'Thứ tự từ chưa chính xác! Hãy bấm vào từ để hoàn tác và thử lại.',
        },
      }));
    }
  };

  const handleAdvanceToNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setArrangedWords([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongPair(null);
      setLines([]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setArrangedWords([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongPair(null);
      setLines([]);
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

  const getTypeBadge = (type = '') => {
    switch (type) {
      case 'MATCHING':
        return { label: 'Trò chơi nối từ SVG', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'WORD_ORDER':
        return { label: 'Sắp xếp câu', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'FILL_BLANK':
        return { label: 'Chọn từ điền khuyết', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'LISTEN_CHOOSE':
        return { label: 'Nghe và chọn từ', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'ERROR_CORRECTION':
        return { label: 'Tìm và sửa lỗi sai', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'TRANSLATION':
        return { label: 'Dịch câu', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: 'Trắc nghiệm', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const typeInfo = getTypeBadge(current.type);
  const currentFeedback = showFeedback[currentIndex];

  return (
    <div className="w-full space-y-4 animate-fade-in pb-4">
      {/* Top Header Tracker */}
      <div className="bg-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-black text-slate-800">
            Bài tập {currentIndex + 1} / {exercises.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.bg}`}>
            {typeInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-bold hidden sm:inline">
            Đúng: <strong className="text-emerald-600">{correctCount}</strong> / {exercises.length}
          </span>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
            +{exerciseScore} điểm
          </span>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Question Prompt */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {current.question}
          </h3>
        </div>

        {/* 1. LISTEN AND CHOOSE AUDIO TRIGGER */}
        {current.type === 'LISTEN_CHOOSE' && (
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col items-center justify-center gap-2.5 text-center">
            <button
              type="button"
              onClick={() => speakText(current.correctAnswer)}
              className="p-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-bold text-purple-900">Bấm loa để nghe phát âm</p>
              <p className="text-[11px] text-purple-600">Lắng nghe và chọn từ chính xác bên dưới</p>
            </div>
          </div>
        )}

        {/* 2. MATCHING PAIRS INTERACTIVE GAME WITH DYNAMIC SVG LINES */}
        {current.type === 'MATCHING' && matchingPairs.leftItems && (
          <div ref={containerRef} className="relative space-y-4 select-none pt-2 pb-2">
            {/* SVG Connecting Lines Canvas Overlay */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible"
              style={{ minHeight: '100%' }}
            >
              {lines.map((line) => {
                const dx = Math.max(25, Math.abs(line.x2 - line.x1) * 0.35);
                const pathData = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;
                const isLineMatched = line.status === 'matched';
                return (
                  <g key={line.id}>
                    {/* Shadow halo line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isLineMatched ? '#10B981' : '#EF4444'}
                      strokeWidth="6"
                      strokeOpacity="0.2"
                      strokeLinecap="round"
                    />
                    {/* Main stroke line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isLineMatched ? '#10B981' : '#EF4444'}
                      strokeWidth="3"
                      strokeDasharray={isLineMatched ? 'none' : '4 4'}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </svg>

            {/* 2 Columns: Left (EN) and Right (VI) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-6 md:gap-10 relative z-20">
              {/* Left Column (English words) */}
              <div className="space-y-2 sm:space-y-2.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1 truncate">
                  Cột A: Tiếng Anh
                </span>
                {matchingPairs.leftItems.map((item, idx) => {
                  const isMatched = matchedPairs.has(item);
                  const isSelected = selectedLeft === item;
                  const isWrong = wrongPair?.left === item;

                  return (
                    <button
                      key={idx}
                      ref={(el) => (leftItemRefs.current[item] = el)}
                      type="button"
                      onClick={() => handleMatchingLeftClick(item)}
                      disabled={isMatched || isAdvancing}
                      className={`w-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left font-bold text-xs sm:text-sm border transition-all flex items-center justify-between shadow-2xs relative ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : isWrong
                          ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 animate-shake'
                          : isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/30 shadow-sm translate-x-0.5'
                          : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-1 sm:pr-2 text-[11px] sm:text-xs md:text-sm">{item}</span>
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {isMatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        ) : (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-blue-600 ring-4 ring-blue-200' : 'bg-slate-300'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Vietnamese meanings) */}
              <div className="space-y-2 sm:space-y-2.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1 truncate">
                  Cột B: Tiếng Việt
                </span>
                {matchingPairs.rightItems.map((item, idx) => {
                  const isMatched = Array.from(matchedPairs).some(
                    (left) => matchingPairs.correctMap && matchingPairs.correctMap[left] === item
                  );
                  const isSelected = selectedRight === item;
                  const isWrong = wrongPair?.right === item;

                  return (
                    <button
                      key={idx}
                      ref={(el) => (rightItemRefs.current[item] = el)}
                      type="button"
                      onClick={() => handleMatchingRightClick(item)}
                      disabled={isMatched || isAdvancing}
                      className={`w-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left font-bold text-xs sm:text-sm border transition-all flex items-center justify-between shadow-2xs relative ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : isWrong
                          ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 animate-shake'
                          : isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/30 shadow-sm -translate-x-0.5'
                          : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 mr-1 sm:mr-2">
                        {isMatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        ) : (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-blue-600 ring-4 ring-blue-200' : 'bg-slate-300'
                            }`}
                          />
                        )}
                      </div>
                      <span className="truncate text-right flex-1 text-[11px] sm:text-xs md:text-sm">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matching progress hint banner */}
            <div className="pt-2 text-center text-xs font-medium text-slate-500">
              {matchedPairs.size === matchingPairs.leftItems.length ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>🎉 Bạn đã nối đúng toàn bộ các cặp từ!</span>
                </div>
              ) : (
                <span>
                  Đã nối: <strong className="text-emerald-600">{matchedPairs.size}</strong> / {matchingPairs.leftItems.length} cặp. Nhấp ô cột A rồi nhấp nghĩa tương ứng ở cột B.
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3. WORD ORDER INTERACTIVE CLICK */}
        {current.type === 'WORD_ORDER' && (
          <div className="space-y-4">
            {/* Sentence construction box */}
            <div className="min-h-18 p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center">
              {arrangedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Chạm vào các từ bên dưới theo đúng trật tự ngữ pháp để tạo thành câu hoàn chỉnh...
                </span>
              ) : (
                arrangedWords.map((w, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    onClick={() => handleWordOrderRemoveWord(wIdx)}
                    disabled={isAdvancing || currentFeedback?.isCorrect}
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
                    disabled={isUsed || isAdvancing || currentFeedback?.isCorrect}
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
                disabled={isAdvancing || arrangedWords.length === 0 || currentFeedback?.isCorrect}
                className="font-bold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa làm lại câu</span>
              </button>

              <button
                type="button"
                onClick={handleCheckWordOrder}
                disabled={isAdvancing || arrangedWords.length === 0 || currentFeedback?.isCorrect}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-40"
              >
                Xác nhận câu
              </button>
            </div>
          </div>
        )}

        {/* 4. MULTIPLE CHOICE, FILL BLANK, ERROR CORRECTION, TRANSLATION, LISTEN_CHOOSE */}
        {['MULTIPLE_CHOICE', 'FILL_BLANK', 'ERROR_CORRECTION', 'TRANSLATION', 'LISTEN_CHOOSE'].includes(
          current.type
        ) && (
          <div className="space-y-2.5 pt-1">
            {parsedOptions.map((opt, idx) => {
              const isSelected = userAnswers[currentIndex] === opt;
              const isChecked = !!currentFeedback;
              let style = 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white';

              if (isChecked) {
                if (opt.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase()) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  style = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 font-bold animate-shake';
                }
              } else if (isSelected) {
                style = 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold ring-2 ring-blue-500/20';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAdvancing || currentFeedback?.isCorrect}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-2 shadow-2xs ${style}`}
                >
                  <span>{opt}</span>
                  {isChecked && opt.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase() && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isChecked && isSelected && opt.trim().toLowerCase() !== current.correctAnswer.trim().toLowerCase() && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Display Banner */}
        {currentFeedback && (
          <div
            className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm animate-fade-in flex items-start gap-3 ${
              currentFeedback.isCorrect
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/90 border-rose-200 text-rose-900'
            }`}
          >
            {currentFeedback.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-extrabold text-sm">
                {currentFeedback.isCorrect
                  ? 'Chính xác!'
                  : 'Chưa chính xác! Vui lòng thử lại.'}
              </p>
              {currentFeedback.explanation && (
                <p className="text-xs opacity-90 leading-relaxed font-medium">
                  💡 {currentFeedback.explanation}
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
            disabled={currentIndex === 0 || isAdvancing}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Câu trước
          </button>

          <button
            type="button"
            onClick={handleAdvanceToNext}
            disabled={currentIndex === exercises.length - 1 || isAdvancing}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-30 flex items-center gap-1.5"
          >
            <span>Bỏ qua / Câu sau</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
