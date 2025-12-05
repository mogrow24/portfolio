'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, GripVertical, Edit3, X, MessageCircle } from 'lucide-react';
import { getInterviews, saveInterviews, type InterviewData, DEFAULT_INTERVIEWS } from '@/lib/siteData';

export default function InterviewsTab() {
  const [interviews, setInterviews] = useState<InterviewData[]>(DEFAULT_INTERVIEWS);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setInterviews(getInterviews().sort((a, b) => a.order_index - b.order_index));
  }, []);

  const handleSave = () => {
    setSaving(true);
    saveInterviews(interviews);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleAdd = () => {
    const newItem: InterviewData = {
      id: `int-${Date.now()}`,
      question_ko: '새 질문을 입력하세요',
      question_en: 'Enter new question',
      answer_ko: '답변을 입력하세요',
      answer_en: 'Enter answer',
      order_index: interviews.length,
    };
    setInterviews([...interviews, newItem]);
    setEditingId(newItem.id);
  };

  const handleDelete = (id: string) => {
    if (!confirm('이 인터뷰 항목을 삭제하시겠습니까?')) return;
    setInterviews(interviews.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, field: keyof InterviewData, value: string) => {
    setInterviews(
      interviews.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = interviews.findIndex((item) => item.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === interviews.length - 1) return;

    const newInterviews = [...interviews];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newInterviews[index], newInterviews[swapIndex]] = [newInterviews[swapIndex], newInterviews[index]];
    
    // order_index 업데이트
    newInterviews.forEach((item, i) => {
      item.order_index = i;
    });
    
    setInterviews(newInterviews);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">인터뷰 관리</h2>
          <p className="text-sm text-[--text-secondary]">
            Q&A 형식의 인터뷰 콘텐츠를 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg bg-[--bg-tertiary] text-[--text-secondary] hover:text-[--accent-color] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            추가
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </motion.button>
        </div>
      </div>

      <div className="space-y-4">
        {interviews.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-xl p-5"
          >
            {editingId === item.id ? (
              // 편집 모드
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[--accent-color]" />
                    <span className="font-semibold text-white">인터뷰 #{index + 1} 편집</span>
                  </div>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">질문 (한글)</label>
                    <input
                      type="text"
                      value={item.question_ko}
                      onChange={(e) => handleUpdate(item.id, 'question_ko', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">질문 (영문)</label>
                    <input
                      type="text"
                      value={item.question_en}
                      onChange={(e) => handleUpdate(item.id, 'question_en', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">답변 (한글)</label>
                    <textarea
                      value={item.answer_ko}
                      onChange={(e) => handleUpdate(item.id, 'answer_ko', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">답변 (영문)</label>
                    <textarea
                      value={item.answer_en}
                      onChange={(e) => handleUpdate(item.id, 'answer_en', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 rounded-lg bg-[--accent-color] text-black font-semibold"
                  >
                    완료
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-[--text-secondary] hover:text-white disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-[--accent-color]/20 text-[--accent-color]">
                      Q{index + 1}
                    </span>
                    <h3 className="font-semibold text-white">{item.question_ko}</h3>
                  </div>
                  <p className="text-sm text-[--text-secondary] line-clamp-2">
                    {item.answer_ko}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="p-2 rounded-lg text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {interviews.length === 0 && (
        <div className="text-center py-12 text-[--text-secondary]">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>인터뷰 항목이 없습니다.</p>
          <button
            onClick={handleAdd}
            className="mt-4 text-[--accent-color] hover:underline"
          >
            첫 번째 인터뷰 추가하기
          </button>
        </div>
      )}
    </div>
  );
}
