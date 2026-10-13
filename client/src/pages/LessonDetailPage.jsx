import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  BookOpen,
  Headphones,
  CheckSquare,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookMarked,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FlashcardSection from '../components/lesson/FlashcardSection';
import PronunciationSection from '../components/lesson/PronunciationSection';
import GrammarSection from '../components/lesson/GrammarSection';
import ListeningSection from '../components/lesson/ListeningSection';
import ReadingSection from '../components/lesson/ReadingSection';
import ExerciseSection from '../components/lesson/ExerciseSection';
import QuizSection from '../components/lesson/QuizSection';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vocab');
  const [lockData, setLockData] = useState(null);

  // Track the highest step index the user has unlocked sequentially (0 to 6, or 7 if all done)
  const [unlockedStepIndex, setUnlockedStepIndex] = useState(0);

  // Track completion condition per step in current session
  const [stepCompletionMap, setStepCompletionMap] = useState({
    vocab: false,
    pronounce: false,
    grammar: false,
    listen: false,
    reading: false,
    exercise: false,
    quiz: false,
  });

  // Standardized 7 Steps Roadmap (Conversation step completely removed, Reading added)
  const tabs = [
    { id: 'vocab', stepNum: 1, title: 'Từ vựng', label: '1. Từ vựng', icon: BookOpen },
    { id: 'pronounce', stepNum: 2, title: 'Thu âm từ vựng', label: '2. Thu âm từ vựng', icon: Mic },
    { id: 'grammar', stepNum: 3, title: 'Ngữ pháp', label: '3. Ngữ pháp', icon: Sparkles },
    { id: 'listen', stepNum: 4, title: 'Luyện nghe', label: '4. Luyện nghe', icon: Headphones },
    { id: 'reading', stepNum: 5, title: 'Đọc hiểu', label: '5. Đọc hiểu', icon: BookMarked },
    { id: 'exercise', stepNum: 6, title: 'Bài tập', label: '6. Bài tập', icon: CheckSquare },
    { id: 'quiz', stepNum: 7, title: 'Quiz cuối bài', label: '7. Quiz cuối bài', icon: Award },
  ];

  // Clear any legacy unscoped localStorage keys
  useEffect(() => {
    try {
      localStorage.removeItem(`e4b_lesson_${id}_unlocked_step`);
      localStorage.removeItem(`e4b_lesson_${id}_step_completion`);
    } catch {}
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setLockData(null);
    setActiveTab('vocab');

    // Default for fresh lesson: 0 steps completed
    const freshMap = {
      vocab: false,
      pronounce: false,
      grammar: false,
      listen: false,
      reading: false,
      exercise: false,
      quiz: false,
    };

    const unlockedKey = user?.id ? `e4b_u${user.id}_lesson_${id}_unlocked_step` : null;
    const completionKey = user?.id ? `e4b_u${user.id}_lesson_${id}_step_completion` : null;

    api.get(`/lessons/${id}`)
      .then((res) => {
        const fetchedLesson = res.data.lesson;
        setLesson(fetchedLesson);

        const up = fetchedLesson?.userProgress;

        if (up && up.completed) {
          // 1. Lesson is completed on server for this user
          setUnlockedStepIndex(7);
          const fullMap = {
            vocab: true,
            pronounce: true,
            grammar: true,
            listen: true,
            reading: true,
            exercise: true,
            quiz: true,
          };
          setStepCompletionMap(fullMap);
          if (unlockedKey) localStorage.setItem(unlockedKey, '7');
          if (completionKey) localStorage.setItem(completionKey, JSON.stringify(fullMap));
        } else if (up && up.progress > 0) {
          // 2. In-progress lesson for this user on server
          const stepsCountFromServer = Math.min(6, Math.max(1, Math.round((up.progress / 100) * 7)));
          let restoredUnlocked = stepsCountFromServer;
          let currentMap = { ...freshMap };

          if (completionKey) {
            try {
              const savedComp = localStorage.getItem(completionKey);
              if (savedComp) {
                currentMap = { ...currentMap, ...JSON.parse(savedComp) };
              }
            } catch {}
          }

          if (unlockedKey) {
            try {
              const savedU = localStorage.getItem(unlockedKey);
              if (savedU) {
                restoredUnlocked = Math.max(restoredUnlocked, parseInt(savedU, 10) || 0);
              }
            } catch {}
          }

          tabs.forEach((t, idx) => {
            if (idx < restoredUnlocked) {
              currentMap[t.id] = true;
            }
          });

          setUnlockedStepIndex(restoredUnlocked);
          setStepCompletionMap(currentMap);
        } else {
          // 3. Brand new user or untouched lesson: STRICTLY 0 progress!
          setUnlockedStepIndex(0);
          setStepCompletionMap(freshMap);
          if (unlockedKey) localStorage.removeItem(unlockedKey);
          if (completionKey) localStorage.removeItem(completionKey);
        }
      })
      .catch((err) => {
        if (err.response?.status === 403 && err.response?.data?.isLocked) {
          setLockData(err.response.data);
        } else {
          console.error('Fetch lesson error:', err);
        }
      })
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải nội dung bài học...</p>
      </div>
    );
  }

  // Locked State Screen when student tries to skip ahead to a locked lesson
  if (lockData) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5 animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-sm">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          {lockData.isLevelLocked ? `Cấp độ ${lockData.lockedLevel || ''} đang bị khóa` : 'Bài học đang bị khóa'}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {lockData.message || 'Bạn cần hoàn thành bài học trước đó theo thứ tự để mở khóa bài học này.'}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {lockData.isLevelLocked ? (
            <>
              <Link
                to={`/lessons?level=${lockData.requiredLevel || 'A1'}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Học cấp độ {lockData.requiredLevel || 'A1'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/placement-test"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Kiểm tra trình độ</span>
              </Link>
            </>
          ) : (
            <>
              {lockData.requiredLessonId && (
                <Link
                  to={`/lessons/${lockData.requiredLessonId}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>Vào học Bài {lockData.requiredOrderNumber} {lockData.level ? `(${lockData.level})` : ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/lessons"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Quay lại danh sách
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600 font-bold">Không tìm thấy bài học.</p>
        <Link to="/lessons" className="mt-4 inline-block text-blue-600 font-semibold text-sm">
          ← Quay lại danh sách bài học
        </Link>
      </div>
    );
  }

  const isCompleted = lesson?.userProgress?.completed;
  const isAdmin = user?.role === 'ADMIN';

  const currentStepIndex = tabs.findIndex((t) => t.id === activeTab);
  const currentTab = tabs[currentStepIndex] || tabs[0];
  const nextTab = currentStepIndex < tabs.length - 1 ? tabs[currentStepIndex + 1] : null;

  // Strict Sequential Check: User cannot click a step ahead of unlockedStepIndex
  const handleTabClick = (targetTabId, targetIndex) => {
    if (isCompleted || isAdmin || targetIndex <= unlockedStepIndex) {
      setActiveTab(targetTabId);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      alert(`Bạn cần hoàn thành Bước ${unlockedStepIndex + 1}: ${tabs[unlockedStepIndex].title} trước khi mở khóa bước tiếp theo.`);
    }
  };

  // Mark a specific step as complete and link directly to overall progress
  const handleMarkStepComplete = (stepId) => {
    setStepCompletionMap((prev) => {
      const updated = { ...prev, [stepId]: true };
      const completionKey = user?.id ? `e4b_u${user.id}_lesson_${id}_step_completion` : null;
      if (completionKey) localStorage.setItem(completionKey, JSON.stringify(updated));

      // Calculate how many of the 7 tasks are done
      const doneCount = tabs.filter((t) => updated[t.id]).length;
      const calculatedProgress = doneCount >= 7 ? 100 : Math.round((doneCount / 7) * 100);

      // Persist progress to backend API
      api.post(`/lessons/${id}/progress`, { progress: calculatedProgress, stepId }).catch(() => {});

      if (doneCount >= 7) {
        api.post(`/lessons/${id}/complete`).catch(() => {});
        setLesson((prevLesson) => ({
          ...prevLesson,
          userProgress: { ...(prevLesson?.userProgress || {}), completed: true, progress: 100 },
        }));
      }

      return updated;
    });

    // Automatically increment unlockedStepIndex if at the frontier
    const stepIdx = tabs.findIndex((t) => t.id === stepId);
    if (stepIdx >= unlockedStepIndex && stepIdx < tabs.length) {
      const nextUnlocked = Math.min(tabs.length, stepIdx + 1);
      setUnlockedStepIndex(nextUnlocked);
      const unlockedKey = user?.id ? `e4b_u${user.id}_lesson_${id}_unlocked_step` : null;
      if (unlockedKey) localStorage.setItem(unlockedKey, nextUnlocked.toString());
    }
  };

  // Advance to next step handler
  const handleAdvanceNextStep = () => {
    if (currentStepIndex < tabs.length - 1) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex > unlockedStepIndex) {
        setUnlockedStepIndex(nextIndex);
        const unlockedKey = user?.id ? `e4b_u${user.id}_lesson_${id}_unlocked_step` : null;
        if (unlockedKey) localStorage.setItem(unlockedKey, nextIndex.toString());
      }
      setActiveTab(tabs[nextIndex].id);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Can the learner advance right now?
  const canAdvance = isCompleted || isAdmin || currentStepIndex < unlockedStepIndex || stepCompletionMap[currentTab.id];

  // Calculate actual tasks completed out of 7
  const completedTasksCount = isCompleted
    ? 7
    : tabs.filter((t) => stepCompletionMap[t.id]).length;

  const isAll7Done = Boolean(isCompleted || completedTasksCount >= 7);

  // Real linked progress percentage across the 7 steps: exactly 100% when all 7 tasks done!
  const progressPercent = isAll7Done
    ? 100
    : Math.round((completedTasksCount / 7) * 100);

  return (
    <div className="space-y-3.5 pb-28 animate-fade-in">
      {/* A. Top Header Info Bar */}
      <div className="bg-white px-3.5 sm:px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/lessons"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition shrink-0"
              title="Quay lại danh sách bài học"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                  Bài {lesson.orderNumber}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded-md bg-slate-100 shrink-0">
                  {lesson.level}
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">
                  • {lesson.category}
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 mt-0.5 truncate">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {isAll7Done ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hoàn thành 100% (7/7 nhiệm vụ)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
                <span>Bước {currentStepIndex + 1}/7: {currentTab.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* 7-Step Progress Bar linked to completed tasks */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>Tiến độ bài học: {completedTasksCount}/7 nhiệm vụ đã hoàn thành</span>
            <span className={isAll7Done ? 'text-emerald-600 font-black' : 'text-blue-600 font-black'}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAll7Done ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Vertical 7 Steps Menu (Left) & Main Stage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* B. Left: Standardized 7 Steps Roadmap Menu */}
        <div className="lg:col-span-1 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5 lg:sticky lg:top-20">
          <div className="px-2 pt-0.5 pb-0.5 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Lộ trình 7 bước
            </span>
            <span className={`text-[11px] font-bold ${isAll7Done ? 'text-emerald-600' : 'text-blue-600'}`}>
              {completedTasksCount}/7 hoàn thành
            </span>
          </div>

          <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar py-1 lg:py-0">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isTabUnlocked = isAll7Done || isAdmin || idx <= unlockedStepIndex;
              const isTabDone = isAll7Done || stepCompletionMap[tab.id] || (idx < unlockedStepIndex && !isActive);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id, idx)}
                  disabled={!isTabUnlocked}
                  className={`shrink-0 lg:w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all select-none whitespace-nowrap lg:whitespace-normal ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : isTabDone
                      ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/60'
                      : isTabUnlocked
                      ? 'text-slate-700 hover:bg-slate-100 bg-white border border-transparent'
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200/40 opacity-60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isTabDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : !isTabUnlocked
                        ? 'bg-slate-200/60 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isTabDone ? (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    ) : !isTabUnlocked ? (
                      <Lock className="w-3 h-3 text-slate-400" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>

                  <span className="flex-1 truncate text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* C. Right: Main Stage Area (Nội dung của bước đang học) */}
        <div className="lg:col-span-3 min-h-[380px]">
          <ErrorBoundary>
            {activeTab === 'vocab' && (
              <FlashcardSection
                vocabularies={lesson.vocabularies}
                onStepComplete={() => handleMarkStepComplete('vocab')}
              />
            )}
            {activeTab === 'pronounce' && (
              <PronunciationSection
                vocabularies={lesson.vocabularies}
                onStepComplete={() => handleMarkStepComplete('pronounce')}
              />
            )}
            {activeTab === 'grammar' && (
              <GrammarSection
                grammarPoints={lesson.grammarPoints}
                onStepComplete={() => handleMarkStepComplete('grammar')}
              />
            )}
            {activeTab === 'listen' && (
              <ListeningSection
                listenings={lesson.listenings}
                onStepComplete={() => handleMarkStepComplete('listen')}
              />
            )}
            {activeTab === 'reading' && (
              <ReadingSection
                readings={lesson.readings}
                onStepComplete={() => handleMarkStepComplete('reading')}
              />
            )}
            {activeTab === 'exercise' && (
              <ExerciseSection
                exercises={lesson.exercises}
                onStepComplete={() => handleMarkStepComplete('exercise')}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizSection
                lessonId={lesson.id}
                quizzes={lesson.quizzes}
                onQuizPassed={() => {
                  setLesson((prev) => ({
                    ...prev,
                    userProgress: { ...(prev?.userProgress || {}), completed: true, progress: 100 },
                  }));
                  setUnlockedStepIndex(7);
                  handleMarkStepComplete('quiz');
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* D. Sticky Bottom Action Bar (Thanh thao tác điều hướng tuần tự) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 py-2 z-30 shadow-lg flex items-center justify-between gap-3">
        {/* Back Step Button */}
        <button
          type="button"
          onClick={() => {
            if (currentStepIndex > 0) {
              setActiveTab(tabs[currentStepIndex - 1].id);
            }
          }}
          disabled={currentStepIndex === 0}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Bước trước</span>
        </button>

        {/* Center Step Status */}
        <div className="text-center hidden sm:block">
          <p className="text-xs font-bold text-slate-800">
            Bước {currentStepIndex + 1}/7: {currentTab.title}
          </p>
          <p className="text-[10px] text-slate-400">
            {isAll7Done
              ? '🎉 Bạn đã hoàn thành xuất sắc toàn bộ 7 nhiệm vụ!'
              : stepCompletionMap[currentTab.id]
              ? '✅ Đã hoàn thành phần này • Sẵn sàng sang bước tiếp'
              : canAdvance
              ? '✅ Có thể chuyển tiếp'
              : '⏳ Hoàn thành nội dung để mở tiếp'}
          </p>
        </div>

        {/* Forward Step Action Button */}
        {nextTab ? (
          <button
            type="button"
            onClick={handleAdvanceNextStep}
            disabled={!canAdvance}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95"
          >
            <span>Sang {nextTab.title}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            to="/lessons"
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <span>{isAll7Done ? 'Hoàn thành bài học (Về danh sách)' : 'Quiz cuối bài'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
