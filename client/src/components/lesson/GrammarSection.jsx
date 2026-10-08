import React, { useState } from 'react';
import { BookOpen, CheckCircle, Lightbulb, Check, X } from 'lucide-react';

export default function GrammarSection({ grammarPoints = [] }) {
  const [selectedExampleAnswers, setSelectedExampleAnswers] = useState({});

  if (!grammarPoints || grammarPoints.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Chưa có bài giảng ngữ pháp cho bài học này.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {grammarPoints.map((gp, idx) => (
        <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Chủ điểm ngữ pháp #{idx + 1}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{gp.title}</h3>
            </div>
          </div>

          {/* Explanation */}
          <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {gp.explanation}
          </div>

          {/* Formula Box */}
          {gp.formula && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span>Công thức trọng tâm</span>
              </div>
              <p className="font-mono text-base font-bold text-emerald-950">
                {gp.formula}
              </p>
            </div>
          )}

          {/* Examples list */}
          {gp.examples && gp.examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Ví dụ minh họa:</h4>
              <div className="grid gap-2.5">
                {gp.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm"
                  >
                    <span className="text-sm font-semibold text-blue-700 font-mono">
                      {ex.en}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {ex.vi}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
