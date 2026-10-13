import React, { useState } from 'react';
import { Plus, Trash2, Volume2 } from 'lucide-react';
import api from '../../services/api';
import { speakText } from '../../utils/speech';

export default function VocabManager({ vocabList = [], lessons = [], onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    pronunciation: '',
    partOfSpeech: 'noun',
    example: '',
    exampleMeaning: '',
    category: 'General',
    level: 'A1',
    lessonId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/vocabulary', {
        ...formData,
        lessonId: formData.lessonId ? parseInt(formData.lessonId, 10) : null,
      });
      setShowAddModal(false);
      setFormData({
        word: '',
        meaning: '',
        pronunciation: '',
        partOfSpeech: 'noun',
        example: '',
        exampleMeaning: '',
        category: 'General',
        level: 'A1',
        lessonId: '',
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi thêm từ vựng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) return;
    try {
      await api.delete(`/admin/vocabulary/${id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Lỗi xóa từ vựng: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h3 className="font-bold text-lg text-slate-900">Quản lý Từ vựng ({vocabList.length})</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm từ vựng mới</span>
        </button>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold sticky top-0">
              <tr>
                <th className="p-3.5">Từ tiếng Anh</th>
                <th className="p-3.5">Phiên âm IPA</th>
                <th className="p-3.5">Nghĩa tiếng Việt</th>
                <th className="p-3.5">Chủ đề</th>
                <th className="p-3.5">Loại từ</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {vocabList.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <span>{v.word}</span>
                    <button
                      onClick={() => speakText(v.word)}
                      className="text-slate-400 hover:text-blue-600"
                      title="Phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{v.pronunciation}</td>
                  <td className="p-3.5 font-semibold text-blue-900">{v.meaning}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold">
                      {v.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 italic">{v.partOfSpeech}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa từ"
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
            <h3 className="text-xl font-bold text-slate-900">Thêm từ vựng mới</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Từ tiếng Anh</label>
                  <input
                    type="text"
                    required
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    placeholder="Apple"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phiên âm IPA</label>
                  <input
                    type="text"
                    value={formData.pronunciation}
                    onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    placeholder="/ˈæpəl/"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nghĩa tiếng Việt</label>
                <input
                  type="text"
                  required
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="Quả táo"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại từ</label>
                  <select
                    value={formData.partOfSpeech}
                    onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="noun">Danh từ (noun)</option>
                    <option value="verb">Động từ (verb)</option>
                    <option value="adjective">Tính từ (adjective)</option>
                    <option value="adverb">Trạng từ (adverb)</option>
                    <option value="phrase">Cụm từ (phrase)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gán vào bài học (tùy chọn)</label>
                <select
                  value={formData.lessonId}
                  onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none bg-white"
                >
                  <option value="">-- Không gán bài học --</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      Bài {l.orderNumber}: {l.title}
                    </option>
                  ))}
                </select>
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
                  {loading ? 'Đang lưu...' : 'Lưu từ vựng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
