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
  Flame,
  Award,
  Compass,
  Flag,
  MessageSquare,
  Target,
  Clock,
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
    {
      step: '01',
      level: 'Pre-A1',
      title: 'Khởi đầu từ số 0',
      subtitle: 'Xây lại phát âm & chào hỏi',
      desc: 'Làm quen bảng chữ cái, phát âm chuẩn IPA từng âm tiết, chào hỏi tự tin và làm chủ số đếm cơ bản.',
      tags: ['Bảng chữ cái & IPA', 'Chào hỏi cơ bản', 'Số đếm 1-100'],
      icon: Flag,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      accentColor: 'text-blue-600',
    },
    {
      step: '02',
      level: 'A1 Foundation',
      title: 'Nền tảng căn bản',
      subtitle: 'Ngữ pháp lõi & gia đình',
      desc: 'Nắm chắc đại từ nhân xưng, động từ To Be, vốn từ vựng gia đình thân yêu và thì hiện tại đơn.',
      tags: ['Đại từ & Động từ To Be', 'Gia đình & Quan hệ', 'Thì hiện tại đơn'],
      icon: BookOpen,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accentColor: 'text-indigo-600',
    },
    {
      step: '03',
      level: 'A1+ Everyday',
      title: 'Tiếng Anh đời sống',
      subtitle: 'Tình huống sinh hoạt thực tế',
      desc: 'Xử lý các tình huống thực tiễn: hỏi giờ, mua sắm, gọi đồ uống tại quán cà phê và chỉ đường.',
      tags: ['Xem giờ & Lịch trình', 'Gọi món tại Cafe', 'Mua sắm & Hỏi đường'],
      icon: MessageSquare,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentColor: 'text-emerald-600',
    },
    {
      step: '04',
      level: 'A2 Elementary',
      title: 'Giao tiếp chủ động',
      subtitle: 'Phản xạ đàm thoại linh hoạt',
      desc: 'Tự tin đàm thoại về thói quen hàng ngày, quá khứ đơn giản và phản xạ linh hoạt trong giao tiếp.',
      tags: ['Hội thoại phản xạ', 'Thói quen mỗi ngày', 'Kể chuyện ngắn'],
      icon: Target,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      accentColor: 'text-amber-600',
    },
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
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
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

      {/* Lộ Trình Học Tập Chuẩn Hóa */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Lộ trình học tập từng bước</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đi từ mất gốc đến tự tin giao tiếp
          </h2>
          <p className="text-slate-600 mt-3 text-base leading-relaxed">
            Học tập có trình tự khoa học theo 4 cột mốc rõ ràng. Mỗi giai đoạn đều có mục tiêu cụ thể, giúp bạn không bao giờ bị lạc hướng.
          </p>
        </div>

        {/* Desktop Step Flow Indicator */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-4 px-4">
          {steps.map((st, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {st.step}
              </span>
              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                {st.level}
              </span>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px border-t border-dashed border-slate-300 ml-2" />
              )}
            </div>
          ))}
        </div>

        {/* 4 Connected Milestone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle background stage watermark */}
                <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-100 select-none pointer-events-none group-hover:text-blue-50/60 transition-colors">
                  {st.step}
                </span>

                <div className="relative z-10">
                  {/* Top card pill & level indicator */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${st.badgeColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>Giai đoạn {st.step}</span>
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                      {st.level}
                    </span>
                  </div>

                  {/* Main Titles */}
                  <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                    {st.title}
                  </h3>
                  <p className={`text-xs font-semibold ${st.accentColor} mt-1 mb-3.5`}>
                    {st.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {st.desc}
                  </p>
                </div>

                {/* Concrete Learning Tags */}
                <div className="relative z-10 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Nội dung trọng tâm:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {st.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlights Bar */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-around gap-4 text-xs font-semibold text-slate-600 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Mỗi ngày chỉ cần <strong>15 - 20 phút</strong></span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đo lường tiến độ bằng <strong>Quiz & Placement Test</strong></span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Tích lũy <strong>XP & duy trì Streak</strong> mỗi ngày</span>
          </div>
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
