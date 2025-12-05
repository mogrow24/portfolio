'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Plus, 
  Edit3, 
  Trash2, 
  Briefcase, 
  X, 
  GripVertical,
  Calendar,
  Building
} from 'lucide-react';
import { LocalExperience } from '@/types/admin';
import { initialExperiences } from '@/data/initialData';

export default function ExperienceEditor() {
  const [experiences, setExperiences] = useState<LocalExperience[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<LocalExperience | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  // 로컬 스토리지에서 경력 로드
  useEffect(() => {
    const saved = localStorage.getItem('admin_experiences');
    if (saved) {
      setExperiences(JSON.parse(saved));
    } else {
      setExperiences(initialExperiences);
      localStorage.setItem('admin_experiences', JSON.stringify(initialExperiences));
    }
  }, []);

  const saveExperiences = (newExperiences: LocalExperience[]) => {
    setExperiences(newExperiences);
    localStorage.setItem('admin_experiences', JSON.stringify(newExperiences));
    setSaveMessage('저장되었습니다.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말로 이 경력을 삭제하시겠습니까?')) return;
    saveExperiences(experiences.filter(e => e.id !== id));
  };

  const handleSave = (data: LocalExperience) => {
    if (editingExperience?.id) {
      // 수정
      saveExperiences(experiences.map(e => e.id === data.id ? data : e));
    } else {
      // 새로 생성
      const newExp: LocalExperience = {
        ...data,
        id: Date.now().toString(),
        order_index: experiences.length + 1,
      };
      saveExperiences([...experiences, newExp]);
    }
    setIsModalOpen(false);
    setEditingExperience(null);
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month] = date.split('-');
    return `${year}.${month}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">경력 관리</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingExperience(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          경력 추가
        </motion.button>
      </div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 rounded-lg bg-green-500/20 text-green-400"
        >
          {saveMessage}
        </motion.div>
      )}

      {/* 경력 목록 */}
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-start gap-4">
              {/* 드래그 핸들 */}
              <div className="flex-shrink-0 pt-1 text-[--text-secondary] cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* 아이콘 */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[--accent-color]/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[--accent-color]" />
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">
                    {exp.company_ko}
                  </h3>
                  {exp.is_current && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[--accent-color]/20 text-[--accent-color]">
                      재직중
                    </span>
                  )}
                </div>
                <p className="text-sm text-[--text-secondary] mb-2">
                  {exp.position_ko}
                </p>
                <div className="flex items-center gap-4 text-xs text-[--text-secondary]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(exp.start_date)} ~ {exp.is_current ? '현재' : formatDate(exp.end_date)}
                  </span>
                </div>
                {exp.description_ko && (
                  <p className="mt-2 text-sm text-[--text-secondary] line-clamp-2">
                    {exp.description_ko}
                  </p>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingExperience(exp);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary] transition-colors"
                  title="수정"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {experiences.length === 0 && (
          <div className="text-center py-12 text-[--text-secondary]">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 경력이 없습니다.</p>
            <p className="text-sm">새 경력을 추가해보세요.</p>
          </div>
        )}
      </div>

      {/* 경력 편집 모달 */}
      <AnimatePresence>
        {isModalOpen && (
          <ExperienceEditModal
            experience={editingExperience}
            onClose={() => {
              setIsModalOpen(false);
              setEditingExperience(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 경력 편집 모달 컴포넌트
interface ExperienceEditModalProps {
  experience: LocalExperience | null;
  onClose: () => void;
  onSave: (data: LocalExperience) => void;
}

function ExperienceEditModal({ experience, onClose, onSave }: ExperienceEditModalProps) {
  const [formData, setFormData] = useState({
    company_ko: experience?.company_ko || '',
    company_en: experience?.company_en || '',
    position_ko: experience?.position_ko || '',
    position_en: experience?.position_en || '',
    description_ko: experience?.description_ko || '',
    description_en: experience?.description_en || '',
    start_date: experience?.start_date || '',
    end_date: experience?.end_date || '',
    is_current: experience?.is_current || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: experience?.id || Date.now().toString(),
      ...formData,
      order_index: experience?.order_index || 0,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl glass-card rounded-2xl p-6 my-8"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-[--accent-color]" />
            {experience ? '경력 수정' : '새 경력 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">회사명 (한글) *</label>
              <input
                type="text"
                value={formData.company_ko}
                onChange={(e) => setFormData({ ...formData, company_ko: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Company (English) *</label>
              <input
                type="text"
                value={formData.company_en}
                onChange={(e) => setFormData({ ...formData, company_en: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">직책 (한글) *</label>
              <input
                type="text"
                value={formData.position_ko}
                onChange={(e) => setFormData({ ...formData, position_ko: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Position (English) *</label>
              <input
                type="text"
                value={formData.position_en}
                onChange={(e) => setFormData({ ...formData, position_en: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">시작일 *</label>
              <input
                type="month"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">종료일</label>
              <input
                type="month"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={formData.is_current}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
              className="w-4 h-4 rounded border-[--border-color] bg-[--bg-tertiary] text-[--accent-color] focus:ring-[--accent-color]"
            />
            <label htmlFor="is_current" className="text-sm text-[--text-secondary]">
              현재 재직 중
            </label>
          </div>

          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">업무 설명 (한글)</label>
            <textarea
              value={formData.description_ko}
              onChange={(e) => setFormData({ ...formData, description_ko: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">Description (English)</label>
            <textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}


