import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import {
  BookOpen,
  Headphones,
  Mic,
  Brain,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Flame,
  Award,
  Compass,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      color: 'bg-blue-500 text-white',
      title: 'Vocabulary (Từ vựng)',
      desc: 'Học từ vựng nền tảng với Flashcard lật mặt 3D, phiên âm chuẩn IPA và ví dụ minh họa dễ nhớ.',
    },
    {
      icon: BookOpen,
      color: 'bg-emerald-500 text-white',
      title: 'Grammar (Ngữ pháp)',
      desc: 'Nắm vững các cấu trúc ngữ pháp then chốt bằng sơ đồ trực quan và bài tập thực hành ngay sau lý thuyết.',
    },
    {
      icon: Headphones,
      color: 'bg-purple-500 text-white',
      title: 'Listening (Luyện nghe)',
      desc: 'Luyện nghe giọng chuẩn bản xứ với hội thoại đời sống, tốc độ phù hợp cho người mới bắt đầu.',
    },
    {
      icon: Mic,
      color: 'bg-amber-500 text-white',
      title: 'Speaking (Phát âm & Nói)',
      desc: 'Luyện phát âm từng từ và đóng vai phân vai trong các tình huống thực tế tại quán cà phê, trường học.',
    },
  ];

  const steps = [
    { level: 'Beginner', title: 'Khởi đầu từ số 0', desc: 'Làm quen bảng chữ cái, phát âm, chào hỏi và số đếm cơ bản.' },
    { level: 'Basic English', title: 'Nền tảng căn bản', desc: 'Đại từ nhân xưng, động từ To Be, đồ vật và gia đình thân yêu.' },
    { level: 'Everyday English', title: 'Tiếng Anh đời sống', desc: 'Hỏi giờ, chỉ đường, mua sắm và gọi món tại nhà hàng / quán cà phê.' },
    { level: 'Elementary', title: 'Tự tin giao tiếp sơ cấp', desc: 'Kể về thói quen hàng ngày, quá khứ và phản xạ hội thoại linh hoạt.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Logo size="md" to="/" />

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                Vào học ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
                >
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Giải pháp hoàn hảo cho người mất gốc tiếng Anh</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Learn English from Zero
          <span className="block text-blue-600 mt-2">Học tiếng Anh từ con số 0 theo từng bước</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Không còn cảm giác hoang mang "hôm nay tôi cần học gì?". English for Beginner định hướng lộ trình rõ ràng, kết hợp từ vựng, ngữ pháp, nghe và phản xạ mỗi ngày.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-3"
          >
            <span>Bắt đầu học ngay</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/placement-test"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-800 font-bold text-base shadow-sm hover:bg-blue-50/50 transition flex items-center justify-center gap-3"
          >
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Kiểm tra trình độ đầu vào</span>
          </Link>
        </div>

        {/* Gamification Highlights */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 shrink-0">
              <Flame className="w-6 h-6 fill-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Chuỗi ngày</p>
              <p className="text-sm font-bold text-slate-800">Duy trì Streak</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Thành tích</p>
              <p className="text-sm font-bold text-slate-800">Tích lũy XP</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Bài học nhỏ</p>
              <p className="text-sm font-bold text-slate-800">15 phút / ngày</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đánh giá</p>
              <p className="text-sm font-bold text-slate-800">Quiz & Thử thách</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Nhóm Tính Năng Cốt Lõi */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Trụ cột học tập</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">4 Nhóm kỹ năng toàn diện</p>
            <p className="text-slate-600 mt-3 text-base">Được thiết kế gắn kết chặt chẽ trong từng bài học giúp bạn vừa hiểu vừa áp dụng được ngay.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lộ Trình Minh Họa */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Lộ trình chuẩn hóa</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Từng bước làm chủ tiếng Anh</p>
          <p className="text-slate-600 mt-3 text-base">Học có trình tự, đi từ số 0 đến tự tin phản xạ trong giao tiếp đời sống.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((st, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500"></div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Giai đoạn {idx + 1}
              </span>
              <h3 className="font-bold text-lg text-slate-900 mt-4">{st.level}</h3>
              <h4 className="text-sm font-semibold text-blue-700 mb-2">{st.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-slate-900 text-slate-400 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm">
            © 2026 <strong>English for Beginner (E4B)</strong>. Xây dựng theo định hướng đồ án học tập chuẩn mực.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Learn English Step by Step - Easy.
          </p>
        </div>
      </footer>
    </div>
  );
}
