'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit3, Trash2, X, Briefcase, Calendar, Languages, Loader2, ChevronUp, ChevronDown, GripVertical, ArrowUpDown } from 'lucide-react';
import { getExperiences, saveExperiences, type ExperienceData } from '@/lib/siteData';
import { translateKoToEn, translateArrayKoToEn } from '@/lib/translate';

export default function ExperienceTab() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  
  // 모달 드래그 시 닫힘 방지를 위한 상태
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);

  useEffect(() => {
    // order_index로 정렬된 데이터 로드
    const loadedExperiences = getExperiences();
    setExperiences(loadedExperiences.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // order_index 재할당 후 저장
    const reorderedExperiences = experiences.map((exp, index) => ({
      ...exp,
      order_index: index,
    }));
    await saveExperiences(reorderedExperiences);
    setTimeout(() => setSaving(false), 500);
  };

  const handleAddNew = () => {
    // 새 항목은 맨 위에 추가 (order_index: 0)
    setEditingItem({
      id: `exp-${Date.now()}`,
      company_ko: '',
      company_en: '',
      position_ko: '',
      position_en: '',
      period: '',
      highlights_ko: [''],
      highlights_en: [''],
      order_index: 0,
    });
    setIsModalOpen(true);
  };

  // 순서 이동 함수
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newExperiences = [...experiences];
    [newExperiences[index - 1], newExperiences[index]] = [newExperiences[index], newExperiences[index - 1]];
    // order_index 재할당
    const reordered = newExperiences.map((exp, i) => ({ ...exp, order_index: i }));
    setExperiences(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === experiences.length - 1) return;
    const newExperiences = [...experiences];
    [newExperiences[index], newExperiences[index + 1]] = [newExperiences[index + 1], newExperiences[index]];
    // order_index 재할당
    const reordered = newExperiences.map((exp, i) => ({ ...exp, order_index: i }));
    setExperiences(reordered);
  };

  // 날짜순 자동 정렬 (최신순: 종료일 기준 내림차순)
  const handleSortByDate = () => {
    const sorted = [...experiences].sort((a, b) => {
      // period 형식: "2022.01 ~ 2025.05" 또는 "2022.01 ~ 현재"
      const getEndDate = (period: string): number => {
        const parts = period.split('~').map(p => p.trim());
        const endPart = parts[1] || parts[0];
        
        // "현재" 또는 "Present"인 경우 가장 최신으로
        if (endPart.includes('현재') || endPart.toLowerCase().includes('present')) {
          return 999999;
        }
        
        // "2025.05" → 202505 숫자로 변환
        const match = endPart.match(/(\d{4})\.?(\d{1,2})?/);
        if (match) {
          const year = parseInt(match[1]);
          const month = match[2] ? parseInt(match[2]) : 12;
          return year * 100 + month;
        }
        return 0;
      };
      
      // 내림차순 (최신이 위로)
      return getEndDate(b.period) - getEndDate(a.period);
    });
    
    // order_index 재할당
    const reordered = sorted.map((exp, i) => ({ ...exp, order_index: i }));
    setExperiences(reordered);
  };

  const handleEdit = (item: ExperienceData) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    // 빈 항목 제거
    const cleaned = {
      ...editingItem,
      highlights_ko: editingItem.highlights_ko.filter(h => h.trim()),
      highlights_en: editingItem.highlights_en.filter(h => h.trim()),
    };
    
    const exists = experiences.find(e => e.id === cleaned.id);
    if (exists) {
      // 기존 항목 수정
      setExperiences(experiences.map(e => e.id === cleaned.id ? cleaned : e));
    } else {
      // 새 항목은 맨 위에 추가 (기존 항목들의 order_index를 1씩 증가)
      const updatedExperiences = experiences.map(exp => ({
        ...exp,
        order_index: (exp.order_index ?? 0) + 1,
      }));
      setExperiences([{ ...cleaned, order_index: 0 }, ...updatedExperiences]);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const updateHighlight = (lang: 'ko' | 'en', index: number, value: string) => {
    if (!editingItem) return;
    const key = lang === 'ko' ? 'highlights_ko' : 'highlights_en';
    const newHighlights = [...editingItem[key]];
    newHighlights[index] = value;
    setEditingItem({ ...editingItem, [key]: newHighlights });
  };

  const addHighlight = (lang: 'ko' | 'en') => {
    if (!editingItem) return;
    const key = lang === 'ko' ? 'highlights_ko' : 'highlights_en';
    setEditingItem({ ...editingItem, [key]: [...editingItem[key], ''] });
  };

  const removeHighlight = (lang: 'ko' | 'en', index: number) => {
    if (!editingItem) return;
    const key = lang === 'ko' ? 'highlights_ko' : 'highlights_en';
    setEditingItem({ ...editingItem, [key]: editingItem[key].filter((_, i) => i !== index) });
  };

  // 자동 번역
  const handleAutoTranslate = async () => {
    if (!editingItem) return;
    setTranslating(true);

    try {
      const [companyResult, positionResult] = await Promise.all([
        editingItem.company_ko ? translateKoToEn(editingItem.company_ko) : { success: true, translatedText: '' },
        editingItem.position_ko ? translateKoToEn(editingItem.position_ko) : { success: true, translatedText: '' },
      ]);

      const highlightsEn = await translateArrayKoToEn(editingItem.highlights_ko);

      setEditingItem({
        ...editingItem,
        company_en: companyResult.success ? companyResult.translatedText : editingItem.company_en,
        position_en: positionResult.success ? positionResult.translatedText : editingItem.position_en,
        highlights_en: highlightsEn,
      });
    } catch (error) {
      alert('번역 중 오류가 발생했습니다.');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">경력 관리</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSortByDate}
            className="px-4 py-2 rounded-lg bg-[--bg-tertiary] text-white flex items-center gap-2 hover:bg-[--accent-color]/20"
            title="종료일 기준 최신순 정렬"
          >
            <ArrowUpDown className="w-4 h-4" />
            날짜순
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-4 py-2 rounded-lg bg-[--bg-tertiary] text-white flex items-center gap-2 hover:bg-[--accent-color]/20"
          >
            <Plus className="w-4 h-4" />
            새 경력
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
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* 순서 조정 버튼 */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${index === 0 ? 'text-[--text-secondary]/30 cursor-not-allowed' : 'text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10'}`}
                    title="위로 이동"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === experiences.length - 1}
                    className={`p-1 rounded transition-colors ${index === experiences.length - 1 ? 'text-[--text-secondary]/30 cursor-not-allowed' : 'text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10'}`}
                    title="아래로 이동"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[--accent-color]/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-[--accent-color]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{exp.company_ko}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[--bg-tertiary] text-[--text-secondary]">#{index + 1}</span>
                  </div>
                  <p className="text-sm text-[--accent-color]">{exp.position_ko}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[--text-secondary] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {exp.period}
                </span>
                <button
                  onClick={() => handleEdit(exp)}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ul className="text-sm text-[--text-secondary] space-y-1 ml-16">
              {exp.highlights_ko.slice(0, 3).map((h, i) => (
                <li key={i} className="list-disc">{h}</li>
              ))}
              {exp.highlights_ko.length > 3 && (
                <li className="text-[--accent-color]">+{exp.highlights_ko.length - 3}개 더...</li>
              )}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* 편집 모달 */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => setMouseDownTarget(e.target)}
            onClick={(e) => {
              // 드래그 시 모달 닫힘 방지: mousedown과 click이 같은 요소에서 발생했을 때만 닫기
              if (e.target === e.currentTarget && mouseDownTarget === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full max-w-3xl glass-card rounded-2xl p-6 max-h-[90vh] overflow-y-auto select-text"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">경력 편집</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoTranslate}
                    disabled={translating}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm flex items-center gap-1 hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                    한→영 자동번역
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">회사명 (한글)</label>
                    <input
                      type="text"
                      value={editingItem.company_ko}
                      onChange={(e) => setEditingItem({ ...editingItem, company_ko: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Company (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <input
                      type="text"
                      value={editingItem.company_en}
                      onChange={(e) => setEditingItem({ ...editingItem, company_en: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">직책 (한글)</label>
                    <input
                      type="text"
                      value={editingItem.position_ko}
                      onChange={(e) => setEditingItem({ ...editingItem, position_ko: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Position (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <input
                      type="text"
                      value={editingItem.position_en}
                      onChange={(e) => setEditingItem({ ...editingItem, position_en: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">기간</label>
                  <input
                    type="text"
                    value={editingItem.period}
                    onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                    placeholder="2022.01 ~ 2025.05"
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">주요 업무 (한글)</label>
                  <div className="space-y-2">
                    {editingItem.highlights_ko.map((h, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => updateHighlight('ko', i, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                        />
                        <button
                          onClick={() => removeHighlight('ko', i)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addHighlight('ko')}
                      className="text-sm text-[--accent-color] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 항목 추가
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">Highlights (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                  <div className="space-y-2">
                    {editingItem.highlights_en.map((h, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => updateHighlight('en', i, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                        />
                        <button
                          onClick={() => removeHighlight('en', i)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addHighlight('en')}
                      className="text-sm text-[--accent-color] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary]"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveItem}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
