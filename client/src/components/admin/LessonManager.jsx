import React, { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import api from '../../services/api';

export default function LessonManager({ lessons = [], onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'A1',
    category: 'Daily Life',
    orderNumber: lessons.length + 1,
    durationMinutes: 15,
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/lessons', formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        level: 'A1',
        category: 'Daily Life',
        orderNumber: lessons.length + 2,
        durationMinutes: 15,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi tạo bài học: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này không?')) return;
    try {
      await api.delete(`/admin/lessons/${id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi xóa bài học: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900">Quản lý Bài học ({lessons.length})</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3.5">STT</th>
                <th className="p-3.5">Tiêu đề bài học</th>
                <th className="p-3.5">Chủ đề</th>
                <th className="p-3.5">Cấp độ</th>
                <th className="p-3.5">Thời lượng</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {lessons.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-blue-600">#{l.orderNumber}</td>
                  <td className="p-3.5 font-bold text-slate-900">{l.title}</td>
                  <td className="p-3.5">{l.category}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {l.level}
                    </span>
                  </td>
                  <td className="p-3.5">{l.durationMinutes} phút</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa bài học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Thêm bài học mới</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài học</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Daily Activities"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả nội dung trọng tâm bài học..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự bài</label>
                  <input
                    type="number"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
