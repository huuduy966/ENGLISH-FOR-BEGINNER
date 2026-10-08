import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PlacementTestPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/placement-test')
      .then((res) => {
        setQuestions(res.data.questions || []);
      })
      .catch((err) => console.error('Fetch placement test error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/placement-test/submit', {
        answers: selectedAnswers,
      });
      setResult(res.data);
      if (res.data.assignedLevel && user) {
        updateUser({ level: res.data.assignedLevel, xp: (user.xp || 0) + 50 });
      }
    } catch (err) {
      alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải đề kiểm tra...</p>
      </div>
    );
  }

  // 1. Start Screen
  if (!testStarted && !result) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-inner">
          <Compass className="w-10 h-10 animate-bounce" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Kiểm tra trình độ đầu vào
        </h1>
        <p className="mt-3 text-slate-600 text-base leading-relaxed max-w-lg mx-auto">
          Hãy làm bài kiểm tra ngắn gồm <strong>{questions.length} câu hỏi</strong> tăng dần độ khó để hệ thống xác định trình độ và gợi ý lộ trình học tập tối ưu nhất cho bạn.
        </p>

        <div className="my-8 p-6 rounded-2xl bg-white border border-slate-200 text-left space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Lưu ý trước khi làm bài:</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Thời gian làm bài thoải mái, không giới hạn.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Các câu hỏi bao gồm từ vựng, ngữ pháp và đọc hiểu cơ bản.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sau khi hoàn thành, bạn sẽ nhận ngay <strong>+50 XP</strong> thưởng đầu vào!</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => setTestStarted(true)}
          className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition inline-flex items-center gap-3"
        >
          <span>Bắt đầu kiểm tra (Start Test)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // 2. Result Screen
  if (result) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
            <Award className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Kết quả đánh giá
          </span>

          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            Trình độ đề xuất: {result.assignedLevel}
          </h2>
          <p className="text-base font-semibold text-blue-600 mt-1">{result.levelTitle}</p>

          <div className="my-6 inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-medium">Số câu đúng</p>
              <p className="text-2xl font-black text-slate-800">{result.score} / {result.total}</p>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tỷ lệ chính xác</p>
              <p className="text-2xl font-black text-emerald-600">{result.percentage}%</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-left max-w-xl mx-auto mb-8">
            <h4 className="font-bold text-blue-900 text-sm mb-1.5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Lộ trình đề xuất cho bạn:
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">{result.recommendation}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Vào Dashboard học tập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setResult(null);
                setTestStarted(false);
                setSelectedAnswers({});
                setCurrentIndex(0);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại bài kiểm tra</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Questions In Progress
  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const selectedCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
          <span>Đã trả lời: {selectedCount}/{questions.length} ({progressPercent}%)</span>
        </div>
        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {currentQ.category || 'Trắc nghiệm'} • Cấp độ {currentQ.levelTarget}
          </span>
          <span className="text-xs text-slate-400 font-medium">#{currentQ.orderNumber}</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQ.id] === opt;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt)}
                className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </div>
                <span className="flex-1 text-base">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition disabled:opacity-40"
          >
            Quay lại
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedCount < questions.length}
              className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn thành & Nộp bài</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
