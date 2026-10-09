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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FlashcardSection from '../components/lesson/FlashcardSection';
import PronunciationSection from '../components/lesson/PronunciationSection';
import GrammarSection from '../components/lesson/GrammarSection';
import ListeningSection from '../components/lesson/ListeningSection';
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

  // Track the highest step index the user has unlocked sequentially (0 to 5, or 6 if all done)
  const [unlockedStepIndex, setUnlockedStepIndex] = useState(0);

  // Track completion condition per step in current session
  const [stepCompletionMap, setStepCompletionMap] = useState({
    vocab: false,
    pronounce: false,
    grammar: false,
    listen: false,
    exercise: false,
    quiz: false,
  });

  // Standardized 6 Steps Roadmap (Conversation step completely removed)
  const tabs = [
    { id: 'vocab', stepNum: 1, title: 'Từ vựng', label: '1. Từ vựng', icon: BookOpen },
    { id: 'pronounce', stepNum: 2, title: 'Phát âm', label: '2. Phát âm', icon: Mic },
    { id: 'grammar', stepNum: 3, title: 'Ngữ pháp', label: '3. Ngữ pháp', icon: BookOpen },
    { id: 'listen', stepNum: 4, title: 'Luyện nghe', label: '4. Luyện nghe', icon: Headphones },
    { id: 'exercise', stepNum: 5, title: 'Bài tập', label: '5. Bài tập', icon: CheckSquare },
    { id: 'quiz', stepNum: 6, title: 'Quiz cuối bài', label: '6. Quiz cuối bài', icon: Award },
  ];

  useEffect(() => {
    setLoading(true);
    setLockData(null);
    setActiveTab('vocab');

    // Retrieve saved step index if present
    const saved = localStorage.getItem(`e4b_lesson_${id}_unlocked_step`);
    const initialUnlocked = saved ? parseInt(saved, 10) : 0;
    setUnlockedStepIndex(initialUnlocked);

    api.get(`/lessons/${id}`)
      .then((res) => {
        setLesson(res.data.lesson);
        // If lesson was already completed previously on server, unlock all 6 steps
        if (res.data.lesson?.userProgress?.completed) {
          setUnlockedStepIndex(6);
          setStepCompletionMap({
            vocab: true,
            pronounce: true,
            grammar: true,
            listen: true,
            exercise: true,
            quiz: true,
          });
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
  }, [id]);

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
          Bài học đang bị khóa
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {lockData.message || 'Bạn cần hoàn thành bài học trước đó theo thứ tự để mở khóa bài học này.'}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
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

  // Mark a specific step as complete
  const handleMarkStepComplete = (stepId) => {
    setStepCompletionMap((prev) => ({ ...prev, [stepId]: true }));
    // Automatically increment unlockedStepIndex if at the frontier
    const stepIdx = tabs.findIndex((t) => t.id === stepId);
    if (stepIdx >= unlockedStepIndex && stepIdx < tabs.length - 1) {
      const nextUnlocked = stepIdx + 1;
      setUnlockedStepIndex(nextUnlocked);
      localStorage.setItem(`e4b_lesson_${id}_unlocked_step`, nextUnlocked.toString());
    }
  };

  // Advance to next step handler
  const handleAdvanceNextStep = () => {
    if (currentStepIndex < tabs.length - 1) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex > unlockedStepIndex) {
        setUnlockedStepIndex(nextIndex);
        localStorage.setItem(`e4b_lesson_${id}_unlocked_step`, nextIndex.toString());
      }
      setActiveTab(tabs[nextIndex].id);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Can the learner advance right now?
  const canAdvance = isCompleted || isAdmin || currentStepIndex < unlockedStepIndex || stepCompletionMap[currentTab.id];

  // Calculate actual progress across 6 steps
  const progressPercent = isCompleted
    ? 100
    : Math.min(95, Math.round(((Math.min(unlockedStepIndex, 5)) / 6) * 100));

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* A. Top Header Info Bar */}
      <div className="bg-white px-5 py-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/lessons"
              className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition shrink-0"
              title="Quay lại danh sách bài học"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  Bài {lesson.orderNumber}
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded-md bg-slate-100">
                  {lesson.level}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {lesson.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCompleted ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã hoàn thành bài học</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
                <span>Bước {currentStepIndex + 1} / 6: {currentTab.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* 6-Step Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-500">
            <span>Tiến độ hoàn thành bài học (Chuẩn 6 bước)</span>
            <span className={isCompleted ? 'text-emerald-600 font-black' : 'text-blue-600 font-black'}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Vertical 6 Steps Menu (Left) & Main Stage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* B. Left: Standardized 6 Steps Roadmap Menu */}
        <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 lg:sticky lg:top-24">
          <div className="px-2 pt-1 pb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Lộ trình 6 bước
            </span>
            <span className="text-xs font-bold text-slate-800">
              Học tuần tự từng bước
            </span>
          </div>

          <div className="flex flex-col space-y-1.5">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isTabUnlocked = isCompleted || isAdmin || idx <= unlockedStepIndex;
              const isTabDone = isCompleted || (idx < unlockedStepIndex && !isActive) || (stepCompletionMap[tab.id] && !isActive);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id, idx)}
                  disabled={!isTabUnlocked}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-left transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                      : isTabDone
                      ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/60'
                      : isTabUnlocked
                      ? 'text-slate-700 hover:bg-slate-100 bg-white border border-transparent'
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200/40 opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
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
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    ) : !isTabUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <span className="flex-1 truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* C. Right: Main Stage Area (Nội dung của bước đang học) */}
        <div className="lg:col-span-3 min-h-[500px]">
          <ErrorBoundary>
            {activeTab === 'vocab' && (
              <FlashcardSection
                vocabularies={lesson.vocabularies}
                onStepComplete={(complete) => handleMarkStepComplete('vocab')}
              />
            )}
            {activeTab === 'pronounce' && (
              <PronunciationSection
                vocabularies={lesson.vocabularies}
                onStepComplete={(complete) => handleMarkStepComplete('pronounce')}
              />
            )}
            {activeTab === 'grammar' && (
              <GrammarSection
                grammarPoints={lesson.grammarPoints}
                onStepComplete={(complete) => handleMarkStepComplete('grammar')}
              />
            )}
            {activeTab === 'listen' && (
              <ListeningSection
                listenings={lesson.listenings}
                onStepComplete={(complete) => handleMarkStepComplete('listen')}
              />
            )}
            {activeTab === 'exercise' && (
              <ExerciseSection
                exercises={lesson.exercises}
                onStepComplete={(complete) => handleMarkStepComplete('exercise')}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizSection
                lessonId={lesson.id}
                quizzes={lesson.quizzes}
                onQuizPassed={() => {
                  setLesson((prev) => ({
                    ...prev,
                    userProgress: { ...(prev.userProgress || {}), completed: true },
                  }));
                  setUnlockedStepIndex(6);
                  handleMarkStepComplete('quiz');
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* D. Sticky Bottom Action Bar (Thanh thao tác điều hướng tuần tự) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-8 py-3.5 z-30 shadow-lg flex items-center justify-between gap-4">
        {/* Back Step Button */}
        <button
          type="button"
          onClick={() => {
            if (currentStepIndex > 0) {
              setActiveTab(tabs[currentStepIndex - 1].id);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }
          }}
          disabled={currentStepIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lại bước trước</span>
        </button>

        {/* Center Step Status */}
        <div className="text-center hidden md:block">
          <p className="text-xs font-bold text-slate-800">
            Bước {currentStepIndex + 1} / 6: {currentTab.title}
          </p>
          <p className="text-[11px] text-slate-400">
            {canAdvance ? '✅ Đã hoàn thành điều kiện bước này' : '⏳ Hoàn thành nội dung bắt buộc để tiếp tục'}
          </p>
        </div>

        {/* Forward Step Action Button */}
        {nextTab ? (
          <button
            type="button"
            onClick={handleAdvanceNextStep}
            disabled={!canAdvance}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
          >
            <span>Tiếp tục sang {nextTab.title}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            to="/lessons"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <span>{isCompleted ? 'Về danh sách bài học' : 'Đang làm bài Quiz cuối'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
