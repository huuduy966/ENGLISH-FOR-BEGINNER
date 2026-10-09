import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  BookOpen,
  Headphones,
  MessageSquare,
  CheckSquare,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Check,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FlashcardSection from '../components/lesson/FlashcardSection';
import PronunciationSection from '../components/lesson/PronunciationSection';
import GrammarSection from '../components/lesson/GrammarSection';
import ListeningSection from '../components/lesson/ListeningSection';
import ConversationSection from '../components/lesson/ConversationSection';
import ExerciseSection from '../components/lesson/ExerciseSection';
import QuizSection from '../components/lesson/QuizSection';

export default function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vocab');
  const [lockData, setLockData] = useState(null);

  // Track the highest step index the user has reached sequentially (0 to 6)
  const [unlockedStepIndex, setUnlockedStepIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setLockData(null);
    setActiveTab('vocab');

    // Retrieve saved step index if present
    const saved = localStorage.getItem(`e4b_lesson_${id}_step`);
    setUnlockedStepIndex(saved ? parseInt(saved, 10) : 0);

    api.get(`/lessons/${id}`)
      .then((res) => {
        setLesson(res.data.lesson);
        // If lesson was already completed previously, unlock all steps
        if (res.data.lesson?.userProgress?.completed) {
          setUnlockedStepIndex(6);
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

  const tabs = [
    { id: 'vocab', stepNum: 1, title: 'Từ vựng', label: '1. Từ vựng bài học', icon: BookOpen },
    { id: 'pronounce', stepNum: 2, title: 'Phát âm', label: '2. Phát âm', icon: Mic },
    { id: 'grammar', stepNum: 3, title: 'Ngữ pháp', label: '3. Ngữ pháp', icon: BookOpen },
    { id: 'listen', stepNum: 4, title: 'Luyện nghe', label: '4. Luyện nghe', icon: Headphones },
    { id: 'conversation', stepNum: 5, title: 'Hội thoại', label: '5. Hội thoại', icon: MessageSquare },
    { id: 'exercise', stepNum: 6, title: 'Bài tập', label: '6. Bài tập', icon: CheckSquare },
    { id: 'quiz', stepNum: 7, title: 'Quiz cuối bài', label: '7. Quiz cuối bài', icon: Award },
  ];

  const currentStepIndex = tabs.findIndex((t) => t.id === activeTab);
  const currentTab = tabs[currentStepIndex] || tabs[0];

  const handleTabClick = (targetTabId, targetIndex) => {
    // If completed or admin, all tabs are freely accessible
    if (isCompleted || isAdmin) {
      setActiveTab(targetTabId);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Must advance sequentially step-by-step
    if (targetIndex <= unlockedStepIndex + 1) {
      setActiveTab(targetTabId);
      if (targetIndex > unlockedStepIndex) {
        setUnlockedStepIndex(targetIndex);
        localStorage.setItem(`e4b_lesson_${id}_step`, targetIndex.toString());
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      alert(`Vui lòng hoàn thành lần lượt các bước trước đó để mở khóa Bước ${targetIndex + 1}: ${tabs[targetIndex].title}.`);
    }
  };

  const progressPercent = Math.round(((Math.min(unlockedStepIndex + 1, 7)) / 7) * 100);

  return (
    <div className="space-y-6">
      {/* Compact Top Header Navigation */}
      <div className="bg-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              to="/lessons"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition shrink-0"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Bài {lesson.orderNumber}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {lesson.category}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCompleted ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã hoàn thành bài học này</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                <span>Bước {currentStepIndex + 1} / 7: {currentTab.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Step Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium text-slate-400">
            <span>Tiến độ hoàn thành các bước trong bài</span>
            <span>{isCompleted ? '100%' : `${progressPercent}%`}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Vertical Steps Menu (Left) & Main Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Vertical Step Menu (Menu Hàng Dọc) */}
        <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 lg:sticky lg:top-24">
          <div className="px-2 pt-1 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Lộ trình 7 bước
            </span>
            <span className="text-xs font-bold text-slate-800">
              Hoàn thành lần lượt
            </span>
          </div>

          <div className="flex flex-col space-y-1.5">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isTabUnlocked = isCompleted || isAdmin || idx <= unlockedStepIndex + 1;
              const isTabDone = isCompleted || (idx <= unlockedStepIndex && idx !== currentStepIndex);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id, idx)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-left transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                      : isTabDone
                      ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/60'
                      : isTabUnlocked
                      ? 'text-slate-700 hover:bg-slate-100 bg-white border border-transparent'
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200/50 opacity-60'
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
                    {isTabDone && !isActive ? (
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

        {/* Right: Main Step Content */}
        <div className="lg:col-span-3 min-h-[500px]">
          {activeTab === 'vocab' && (
            <FlashcardSection vocabularies={lesson.vocabularies} />
          )}
          {activeTab === 'pronounce' && (
            <PronunciationSection vocabularies={lesson.vocabularies} />
          )}
          {activeTab === 'grammar' && (
            <GrammarSection grammarPoints={lesson.grammarPoints} />
          )}
          {activeTab === 'listen' && (
            <ListeningSection listenings={lesson.listenings} />
          )}
          {activeTab === 'conversation' && (
            <ConversationSection conversations={lesson.conversations} />
          )}
          {activeTab === 'exercise' && (
            <ExerciseSection exercises={lesson.exercises} />
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
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
