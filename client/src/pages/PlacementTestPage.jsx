import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Volume2,
  Play,
  Pause,
  BookOpen,
  Headphones,
  Check,
  Sparkles,
  AlertTriangle,
  X,
  Target,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { speakText } from '../utils/speech';

export default function PlacementTestPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Mode: 'WELCOME' | 'TAKING' | 'RESULT'
  const [viewMode, setViewMode] = useState('WELCOME');
  const [questions, setQuestions] = useState([]);
  const [partsOverview, setPartsOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = sessionStorage.getItem('e4b_placement_index');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    try {
      const saved = sessionStorage.getItem('e4b_placement_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'WRONG'

  // Audio player state for listening questions
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fetch 25 placement questions (Restores on F5 if mid-test, or fetches freshly)
  useEffect(() => {
    try {
      const savedQStr = sessionStorage.getItem('e4b_placement_questions');
      const savedAnsStr = sessionStorage.getItem('e4b_placement_answers');
      if (savedQStr && savedAnsStr) {
        const parsed = JSON.parse(savedQStr);
        if (Array.isArray(parsed) && parsed.length === 25) {
          setQuestions(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

    api.get('/placement-test')
      .then((res) => {
        const fetched = res.data.questions || [];
        setQuestions(fetched);
        setPartsOverview(res.data.partsOverview || null);
        try {
          sessionStorage.setItem('e4b_placement_questions', JSON.stringify(fetched));
        } catch {}
      })
      .catch((err) => console.error('Fetch placement test error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Save answers to sessionStorage so F5 doesn't lose state
  useEffect(() => {
    try {
      sessionStorage.setItem('e4b_placement_answers', JSON.stringify(selectedAnswers));
      sessionStorage.setItem('e4b_placement_index', String(currentIndex));
    } catch {}
  }, [selectedAnswers, currentIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handlePlayAudio = (text) => {
    if (!text) return;
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(text);
      const estDuration = Math.max(3000, (text.split(/\s+/).length / 2.3) * 1000);
      setTimeout(() => setIsPlayingAudio(false), estDuration);
    }
  };

  // Skip Test ("Phương án 2 – Học từ đầu")
  const handleSkipTest = async () => {
    try {
      await api.post('/placement-test/skip');
      if (updateUser) {
        updateUser({ level: 'A1', placementStatus: 'UNASSESSED' });
      }
      try {
        sessionStorage.removeItem('e4b_placement_answers');
        sessionStorage.removeItem('e4b_placement_index');
        sessionStorage.removeItem('e4b_placement_questions');
      } catch {}
      navigate('/dashboard');
    } catch (err) {
      console.error('Skip placement test error:', err);
      navigate('/dashboard');
    }
  };

  // Submit test
  const handleSubmit = async () => {
    setConfirmSubmitOpen(false);
    setSubmitting(true);
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);

    try {
      const res = await api.post('/placement-test/submit', {
        answers: selectedAnswers,
      });
      setResult(res.data);
      if (res.data.assignedLevel && updateUser) {
        updateUser({
          level: res.data.assignedLevel,
          placementStatus: 'ASSESSED',
          placementScore: res.data.score,
        });
      }
      try {
        sessionStorage.removeItem('e4b_placement_answers');
        sessionStorage.removeItem('e4b_placement_index');
        sessionStorage.removeItem('e4b_placement_questions');
      } catch {}
      setViewMode('RESULT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Có lỗi khi nộp bài test. Vui lòng thử lại.');
      console.error('Submit placement test error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Start a fresh, newly randomized 25-question test
  const handleStartFreshTest = () => {
    try {
      sessionStorage.removeItem('e4b_placement_answers');
      sessionStorage.removeItem('e4b_placement_index');
      sessionStorage.removeItem('e4b_placement_questions');
    } catch {}
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setLoading(true);

    api.get('/placement-test')
      .then((res) => {
        const fetched = res.data.questions || [];
        setQuestions(fetched);
        setPartsOverview(res.data.partsOverview || null);
        try {
          sessionStorage.setItem('e4b_placement_questions', JSON.stringify(fetched));
        } catch {}
        setViewMode('TAKING');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        console.error('Fetch placement test error:', err);
        setViewMode('TAKING');
      })
      .finally(() => setLoading(false));
  };

  const handleRetakeTest = handleStartFreshTest;

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Đang tải bộ đề kiểm tra đầu vào 25 câu...</p>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 1: WELCOME & ONBOARDING (CHỌN 1 TRONG 2 PHƯƠNG ÁN)
  // ===========================================================================
  if (viewMode === 'WELCOME') {
    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-inner">
            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Khởi đầu học tập
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Chào mừng bạn đến với English for Beginner!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Để mang lại trải nghiệm học tập hiệu quả nhất, bạn hãy lựa chọn phương án khởi đầu phù hợp bên dưới:
          </p>
        </div>

        {/* 2 Choices Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Option 1: Placement Test (Khuyên dùng) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-600 shadow-xl shadow-blue-500/10 flex flex-col justify-between space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              Khuyên dùng
            </div>

            <div className="space-y-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Phương án 1: Kiểm tra trình độ
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Làm bài kiểm tra ngắn gồm <strong>25 câu hỏi</strong> (15 câu điền từ và 10 câu luyện nghe) tăng dần từ A1 đến C2 để xác định chính xác cấp độ phù hợp.
              </p>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-1 font-medium">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lợi ích:</span>
                </div>
                <p>Gợi ý đúng bài học cần học, tiết kiệm thời gian và không phải học lại kiến thức đã biết.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartFreshTest}
              className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Kiểm tra trình độ (Start Test)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Learn from scratch (Học từ đầu) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-300 transition">
            <div className="space-y-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Phương án 2: Học từ đầu
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Bỏ qua bài test và bắt đầu ngay từ <strong>cấp độ A1</strong> với những bài học nền tảng cơ bản nhất. Trình độ sẽ ở trạng thái <em>"Chưa đánh giá"</em>.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1 font-medium">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Phù hợp với:</span>
                </div>
                <p>Người mới bắt đầu hoàn toàn hoặc người mất gốc muốn ôn lại từ bảng chữ cái và câu chào hỏi.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSkipTest}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
            >
              <span>Học từ đầu (Bỏ qua bài test)</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 3: RESULT SCREEN (KẾT QUẢ ĐÁNH GIÁ CEFR)
  // ===========================================================================
  if (viewMode === 'RESULT' && result) {
    const displayedDetails = result.details.filter((item) => {
      if (reviewFilter === 'ALL') return true;
      if (reviewFilter === 'CORRECT') return item.isCorrect;
      if (reviewFilter === 'WRONG') return !item.isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-fade-in pb-16">
        {/* Result Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block mb-2">
              Kết quả đánh giá đầu vào
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Cấp độ đề xuất: <span className="text-blue-600">{result.recommendedLevel}</span>
            </h2>
            <p className="text-base sm:text-lg font-bold text-slate-700 mt-1">{result.levelTitle}</p>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed font-medium">
              {result.recommendation}
            </p>
          </div>

          {/* 3 Metric Summary Boxes */}
          <div className="p-3.5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl mx-auto shadow-2xs text-center">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Điểm tổng kết</p>
              <p className="text-xl sm:text-3xl font-black text-blue-600 mt-0.5">
                {result.score} <span className="text-xs text-slate-400 font-semibold">/ 100 đ</span>
              </p>
            </div>
            <div className="min-w-0 border-y sm:border-y-0 sm:border-x border-slate-200 py-2 sm:py-0 px-1 sm:px-2">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Số câu đúng</p>
              <p className="text-xl sm:text-3xl font-black text-emerald-600 mt-0.5">
                {result.correctCount} <span className="text-xs text-slate-400 font-semibold">/ 25 ({result.percentage}%)</span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Điền từ / Luyện nghe</p>
              <p className="text-base sm:text-xl font-black text-slate-800 mt-1">
                {result.partScores.fillBlank.correct}/15 <span className="text-xs text-slate-400 font-semibold">•</span> {result.partScores.listening.correct}/10
              </p>
            </div>
          </div>

          {/* CEFR Tiers Breakdown Bars (A1 to C2) */}
          <div className="space-y-3 pt-3 max-w-2xl mx-auto text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Mức độ đạt chuẩn 75% theo từng cấp độ CEFR:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => {
                const tier = result.tierBreakdown[lvl];
                const isPassed = tier?.passed;

                return (
                  <div
                    key={lvl}
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                      isPassed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black">
                      <span className={isPassed ? 'text-emerald-900' : 'text-slate-700'}>{lvl} Level</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isPassed ? 'Đạt chuẩn' : 'Chưa đạt'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        style={{ width: `${tier?.percentage || 0}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between">
                      <span>{tier?.correct}/{tier?.total} câu</span>
                      <span>{tier?.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Weaknesses Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left text-xs pt-1">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Điểm mạnh ghi nhận:</span>
              </h5>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-900 font-medium">
                {result.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <h5 className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Nội dung cần tập trung cải thiện:</span>
              </h5>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900 font-medium">
                {result.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to={`/lessons?level=${result.recommendedLevel}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Bắt đầu học theo cấp độ {result.recommendedLevel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleRetakeTest}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-slate-200 active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Làm lại bài test</span>
            </button>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs sm:text-sm transition flex items-center justify-center border border-slate-200"
            >
              Về Dashboard
            </Link>
          </div>
        </div>

        {/* Detailed 25-Question Review List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chi tiết câu hỏi & Lời giải thích (25 câu)</h3>
              <p className="text-xs text-slate-400">Xem lại đáp án đã chọn, đáp án chuẩn xác và giải thích ngữ pháp chi tiết</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setReviewFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${
                  reviewFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả (25)
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('CORRECT')}
                className={`px-3 py-1 rounded-lg transition ${
                  reviewFilter === 'CORRECT' ? 'bg-white text-emerald-700 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đúng ({result.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('WRONG')}
                className={`px-3 py-1 rounded-lg transition ${
                  reviewFilter === 'WRONG' ? 'bg-white text-rose-700 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sai ({result.totalQuestions - result.correctCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {displayedDetails.map((q) => (
              <div key={q.id} className="py-4.5 first:pt-1 last:pb-1 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        q.isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
                      }`}
                    >
                      {q.orderNumber}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{q.question}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Phần {q.partNumber === 1 ? '1: Điền từ' : '2: Luyện nghe'} • Cấp độ {q.levelTarget}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {q.isCorrect ? 'Đúng (+4đ)' : 'Sai (0đ)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold pl-8">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-medium block text-[10px]">Đã chọn:</span>
                    <span className={q.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {q.userAnswer || '(Bỏ trống)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <span className="text-emerald-700 font-medium block text-[10px]">Đáp án đúng:</span>
                    <span className="text-emerald-900 font-bold">{q.correctAnswer}</span>
                  </div>
                </div>

                {q.explanation && (
                  <div className="pl-8 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 font-medium">
                    <strong className="text-slate-800">Giải thích: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 2: IN-PROGRESS TEST RUNNER (25 QUESTIONS)
  // ===========================================================================
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const totalQCount = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQCount) * 100);
  const isLastQuestion = currentIndex === totalQCount - 1;
  const isPart1 = currentQ.partNumber === 1;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 space-y-6 animate-fade-in pb-16">
      {/* Top Header Card: Progress & Questions Navigation */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-black text-xs border border-blue-200">
              {isPart1 ? 'Phần 1: Điền từ vào chỗ trống' : 'Phần 2: Luyện nghe ngắn'}
            </span>
            <span className="text-slate-400 font-bold hidden sm:inline">•</span>
            <span className="text-slate-600 font-bold hidden sm:inline">
              Câu {currentIndex + 1} / {totalQCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Đã làm: <strong className="text-blue-600">{answeredCount}</strong> / {totalQCount}
            </span>

            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              Nộp bài
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
        {/* Audio Player for Listening questions (Part 2) */}
        {!isPart1 && currentQ.audioText && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border border-purple-200 text-center space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-purple-600" />
                <span>Audio luyện nghe</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Bấm để lắng nghe thông tin</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handlePlayAudio(currentQ.audioText)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95 ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Đang phát...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Phát audio câu hỏi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsPlayingAudio(false);
                  setTimeout(() => handlePlayAudio(currentQ.audioText), 100);
                }}
                className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1"
                title="Nghe lại"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Nghe lại</span>
              </button>
            </div>
          </div>
        )}

        {/* Question Prompt */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200 mt-0.5">
              {currentIndex + 1}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>
        </div>

        {/* 4 Options Grid (A, B, C, D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options &&
            currentQ.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
              const isSelected = selectedAnswers[currentQ.id] === opt;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 shadow-2xs select-none active:scale-[0.99] ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 text-slate-800 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm">{opt}</span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsPlayingAudio(false);
              setCurrentIndex((prev) => prev - 1);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-40 flex items-center gap-1.5 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          {!isLastQuestion ? (
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsPlayingAudio(false);
                setCurrentIndex((prev) => prev + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <span>Câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md shadow-emerald-500/25 flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nộp bài kiểm tra</span>
            </button>
          )}
        </div>
      </div>

      {/* 25 Questions Numbered Matrix / Navigator */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 uppercase tracking-wide">Danh sách câu hỏi (1 – 25)</span>
          <span className="text-slate-400">Bấm số câu để chuyển nhanh</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsPlayingAudio(false);
                  setCurrentIndex(idx);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs transition flex items-center justify-center border ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                    : isAnswered
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal: Confirm Submit */}
      {confirmSubmitOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmSubmitOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-100 shadow-2xl text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">Xác nhận nộp bài kiểm tra?</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Bạn đã trả lời <strong>{answeredCount} / {totalQCount}</strong> câu hỏi.
              </p>
            </div>

            {totalQCount - answeredCount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left font-medium space-y-1">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Chú ý: Còn {totalQCount - answeredCount} câu chưa trả lời</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Các câu bỏ trống sẽ được tính là 0 điểm. Bạn có muốn quay lại kiểm tra trước khi nộp không?
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Nộp bài ngay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
