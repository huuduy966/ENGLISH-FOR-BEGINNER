import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
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
} from 'lucide-react';
import api from '../services/api';
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

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vocab'); // vocab, pronounce, grammar, listen, conversation, exercise, quiz
  const [lockData, setLockData] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLockData(null);
    api.get(`/lessons/${id}`)
      .then((res) => {
        setLesson(res.data.lesson);
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

  // Locked State Screen when student tries to skip ahead
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
              <span>Vào học Bài {lockData.requiredOrderNumber}</span>
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

  const tabs = [
    { id: 'vocab', label: '1. Từ vựng bài học', icon: BookOpen, count: lesson.vocabularies?.length },
    { id: 'pronounce', label: '2. Phát âm', icon: Mic },
    { id: 'grammar', label: '3. Ngữ pháp', icon: BookOpen, count: lesson.grammarPoints?.length },
    { id: 'listen', label: '4. Luyện nghe', icon: Headphones, count: lesson.listenings?.length },
    { id: 'conversation', label: '5. Hội thoại', icon: MessageSquare, count: lesson.conversations?.length },
    { id: 'exercise', label: '6. Bài tập', icon: CheckSquare, count: lesson.exercises?.length },
    { id: 'quiz', label: '7. Quiz cuối bài', icon: Award, count: lesson.quizzes?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/lessons"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Bài {lesson.orderNumber}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {lesson.category}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {lesson.title}
            </h1>
          </div>
        </div>

        {lesson.userProgress?.completed && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold self-start sm:self-auto border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã hoàn thành bài học này</span>
          </div>
        )}
      </div>

      {/* Tabs navigation bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="min-h-[500px]">
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
            }}
          />
        )}
      </div>
    </div>
  );
}
