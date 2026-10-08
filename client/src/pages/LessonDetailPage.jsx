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
  CheckCircle2,
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

  useEffect(() => {
    setLoading(true);
    api.get(`/lessons/${id}`)
      .then((res) => {
        setLesson(res.data.lesson);
      })
      .catch((err) => {
        console.error('Fetch lesson error:', err);
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
