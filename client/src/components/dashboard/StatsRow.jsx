import React from 'react';
import { Flame, BookOpen, CheckCircle, Star } from 'lucide-react';

export default function StatsRow({ stats }) {
  if (!stats) return null;

  const statItems = [
    {
      label: 'Chuỗi học liên tục',
      value: `${stats.streakDays || 1} ngày`,
      icon: Flame,
      color: 'text-orange-500 bg-orange-50 border-orange-100',
    },
    {
      label: 'Từ vựng đã thuộc',
      value: `${stats.wordsLearned || 0} từ`,
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
    },
    {
      label: 'Bài học hoàn thành',
      value: `${stats.lessonsCompleted || 0} / ${stats.totalLessons || 5} bài`,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Điểm kinh nghiệm',
      value: `${stats.xp || 0} XP`,
      icon: Star,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${item.color} border shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{item.label}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
