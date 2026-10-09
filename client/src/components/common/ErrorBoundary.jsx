import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Đã xảy ra sự cố khi tải nội dung
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Hệ thống gặp lỗi kết nối hoặc xử lý dữ liệu. Bạn hãy bấm thử lại hoặc quay về trang chủ.
          </p>
          {this.state.error && (
            <p className="text-[11px] font-mono text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 max-w-lg truncate">
              {this.state.error.message || String(this.state.error)}
            </p>
          )}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tải lại trang</span>
            </button>
            <a
              href="/lessons"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Về danh sách bài học</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
