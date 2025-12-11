'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit3, Trash2, X, Target, Zap, MessageCircle, Crosshair, Star, Lightbulb, Users, Rocket, Languages, Loader2 } from 'lucide-react';
import { getCompetencies, saveCompetencies, type CompetencyData } from '@/lib/siteData';
import { translateKoToEn } from '@/lib/translate';

// 사용 가능한 아이콘 목록
const AVAILABLE_ICONS = [
  { name: 'Target', icon: Target },
  { name: 'Zap', icon: Zap },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Crosshair', icon: Crosshair },
  { name: 'Star', icon: Star },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Users', icon: Users },
  { name: 'Rocket', icon: Rocket },
];

function getIconComponent(iconName: string) {
  const found = AVAILABLE_ICONS.find(i => i.name === iconName);
  return found ? found.icon : Target;
}

export default function CompetenciesTab() {
  const [competencies, setCompetencies] = useState<CompetencyData[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CompetencyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  
  // 모달 드래그 시 닫힘 방지를 위한 상태
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);

  useEffect(() => {
    setCompetencies(getCompetencies());
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveCompetencies(competencies);
    setTimeout(() => setSaving(false), 500);
  };

  const handleAddNew = () => {
    setEditingItem({
      id: `comp-${Date.now()}`,
      icon: 'Target',
      title: '',
      subtitle_ko: '',
      subtitle_en: '',
      desc_ko: '',
      desc_en: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: CompetencyData) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setCompetencies(competencies.filter(c => c.id !== id));
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    const exists = competencies.find(c => c.id === editingItem.id);
    if (exists) {
      setCompetencies(competencies.map(c => c.id === editingItem.id ? editingItem : c));
    } else {
      setCompetencies([...competencies, editingItem]);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 모달 내 자동 번역
  const handleAutoTranslate = async () => {
    if (!editingItem) return;
    setTranslating(true);

    try {
      const translations = await Promise.all([
        editingItem.subtitle_ko ? translateKoToEn(editingItem.subtitle_ko) : { success: true, translatedText: '' },
        editingItem.desc_ko ? translateKoToEn(editingItem.desc_ko) : { success: true, translatedText: '' },
      ]);

      setEditingItem({
        ...editingItem,
        subtitle_en: translations[0].success ? translations[0].translatedText : editingItem.subtitle_en,
        desc_en: translations[1].success ? translations[1].translatedText : editingItem.desc_en,
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
        <h2 className="text-2xl font-bold text-white">역량 관리</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-4 py-2 rounded-lg bg-[--bg-tertiary] text-white flex items-center gap-2 hover:bg-[--accent-color]/20"
          >
            <Plus className="w-4 h-4" />
            새 역량
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

      <div className="grid sm:grid-cols-2 gap-4">
        {competencies.map((comp, index) => {
          const IconComponent = getIconComponent(comp.icon);
          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[--accent-color]/10 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-[--accent-color]" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(comp)}
                    className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comp.id)}
                    className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white mb-1">{comp.title}</h3>
              <p className="text-xs text-[--text-secondary] mb-2">{comp.subtitle_ko}</p>
              <p className="text-sm text-[--text-secondary] line-clamp-3">{comp.desc_ko}</p>
            </motion.div>
          );
        })}
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
              className="w-full max-w-2xl glass-card rounded-2xl p-6 max-h-[90vh] overflow-y-auto select-text"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">역량 편집</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoTranslate}
                    disabled={translating}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm flex items-center gap-1 hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                    한→영
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">아이콘</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        onClick={() => setEditingItem({ ...editingItem, icon: name })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          editingItem.icon === name
                            ? 'bg-[--accent-color] text-black'
                            : 'bg-[--bg-tertiary] text-[--text-secondary] hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">타이틀</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">서브타이틀 (한글)</label>
                    <input
                      type="text"
                      value={editingItem.subtitle_ko}
                      onChange={(e) => setEditingItem({ ...editingItem, subtitle_ko: e.target.value })}
                      placeholder="#키워드 #형식"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Subtitle (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <input
                      type="text"
                      value={editingItem.subtitle_en}
                      onChange={(e) => setEditingItem({ ...editingItem, subtitle_en: e.target.value })}
                      placeholder="#Keyword #Format"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">설명 (한글)</label>
                  <textarea
                    value={editingItem.desc_ko}
                    onChange={(e) => setEditingItem({ ...editingItem, desc_ko: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">Description (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                  <textarea
                    value={editingItem.desc_en}
                    onChange={(e) => setEditingItem({ ...editingItem, desc_en: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
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
