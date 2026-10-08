import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Layers, Award, ShieldCheck, UserCheck } from 'lucide-react';
import api from '../services/api';
import LessonManager from '../components/admin/LessonManager';
import VocabManager from '../components/admin/VocabManager';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons'); // lessons | vocab | users

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, lessonsRes, vocabRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/lessons'),
        api.get('/vocabulary'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setLessons(lessonsRes.data.lessons || []);
      setVocabulary(vocabRes.data.vocabulary || []);
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Admin Management Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Bảng điều khiển Quản trị viên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị nội dung bài học, kho từ vựng và theo dõi học viên toàn hệ thống.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng số học viên</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.counts?.totalUsers || 2}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng số bài học</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.counts?.totalLessons || 5}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Kho từ vựng</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.counts?.totalVocabulary || 35}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Lượt làm Quiz</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.counts?.totalQuizAttempts || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'lessons'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Quản lý Bài học ({lessons.length})
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'vocab'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Quản lý Từ vựng ({vocabulary.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Danh sách Học viên ({users.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'lessons' && (
        <LessonManager lessons={lessons} onRefresh={fetchData} />
      )}

      {activeTab === 'vocab' && (
        <VocabManager vocabList={vocabulary} lessons={lessons} onRefresh={fetchData} />
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Danh sách Người dùng & Học viên</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Họ tên</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Vai trò</th>
                  <th className="p-3.5">Trình độ</th>
                  <th className="p-3.5">XP</th>
                  <th className="p-3.5">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold">{u.level || 'A1'}</td>
                    <td className="p-3.5 font-bold text-amber-600">{u.xp} XP</td>
                    <td className="p-3.5 text-orange-600 font-bold">{u.streakDays} ngày</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
