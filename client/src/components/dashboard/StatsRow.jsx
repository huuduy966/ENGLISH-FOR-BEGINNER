import React from 'react';
import { Flame, Target, CheckCircle, ClipboardCheck } from 'lucide-react';

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
      label: 'Điểm làm bài',
      value: `${stats.practiceScore || 0} điểm`,
      icon: Target,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Bài học hoàn thành',
      value: `${stats.lessonsCompleted || 0} / ${stats.totalLessons || 5} bài`,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Bài kiểm tra đã làm',
      value: `${stats.examsCompleted || 0} bài`,
      icon: ClipboardCheck,
      color: 'text-purple-500 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5 sm:gap-4 min-w-0"
          >
            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${item.color} border shrink-0`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight truncate">{item.label}</p>
              <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 truncate">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
