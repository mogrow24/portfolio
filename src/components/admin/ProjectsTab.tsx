'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit3, Trash2, X, Eye, EyeOff, FolderOpen, GripVertical, ChevronDown, ChevronUp, Languages, Loader2, Image as ImageIcon } from 'lucide-react';
import { getProjects, saveProjects, type ProjectData, type GalleryImage } from '@/lib/siteData';
import { translateKoToEn, translateArrayKoToEn } from '@/lib/translate';
import ImageUploader from './ImageUploader';

export default function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setProjects(getProjects().sort((a, b) => a.order_index - b.order_index));
  }, []);

  const handleSave = () => {
    setSaving(true);
    saveProjects(projects);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleAddNew = () => {
    const newProject: ProjectData = {
      id: `proj-${Date.now()}`,
      title_ko: '',
      title_en: '',
      tags: [],
      stat_ko: '',
      stat_en: '',
      thumb: '',
      period: '',
      team_ko: '',
      team_en: '',
      project_ko: '',
      project_en: '',
      role_ko: [''],
      role_en: [''],
      problem_ko: '',
      problem_en: '',
      solution_ko: '',
      solution_en: '',
      outcome_ko: [''],
      outcome_en: [''],
      gallery: [],
      is_visible: true,
      order_index: projects.length,
    };
    setEditingProject(newProject);
    setIsModalOpen(true);
  };

  const handleEdit = (project: ProjectData) => {
    setEditingProject({ ...project });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, is_visible: !p.is_visible } : p));
  };

  const handleSaveProject = () => {
    if (!editingProject) return;
    
    const cleaned = {
      ...editingProject,
      role_ko: editingProject.role_ko.filter(r => r.trim()),
      role_en: editingProject.role_en.filter(r => r.trim()),
      outcome_ko: editingProject.outcome_ko.filter(o => o.trim()),
      outcome_en: editingProject.outcome_en.filter(o => o.trim()),
      tags: editingProject.tags.filter(t => t.trim()),
    };

    const exists = projects.find(p => p.id === cleaned.id);
    if (exists) {
      setProjects(projects.map(p => p.id === cleaned.id ? cleaned : p));
    } else {
      setProjects([...projects, cleaned]);
    }
    
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">프로젝트 관리</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-4 py-2 rounded-lg bg-[--bg-tertiary] text-white flex items-center gap-2 hover:bg-[--accent-color]/20"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
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
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card rounded-xl p-4 ${!project.is_visible ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1 text-[--text-secondary] cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-[--bg-tertiary] flex items-center justify-center overflow-hidden">
                {project.thumb ? (
                  <img src={project.thumb} alt={project.title_ko} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[--text-secondary]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{project.title_ko || '(제목 없음)'}</h3>
                  {!project.is_visible && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[--bg-tertiary] text-[--text-secondary]">숨김</span>
                  )}
                </div>
                <p className="text-sm text-[--text-secondary] line-clamp-2 mb-2">{project.project_ko}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded text-xs bg-[--bg-tertiary] text-[--text-secondary]">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(project.id)}
                  className={`p-2 rounded-lg transition-colors ${project.is_visible ? 'text-[--accent-color] hover:bg-[--accent-color]/10' : 'text-[--text-secondary] hover:bg-[--bg-tertiary]'}`}
                  title={project.is_visible ? '숨기기' : '보이기'}
                >
                  {project.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary] transition-colors"
                  title="수정"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 text-[--text-secondary]">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 프로젝트가 없습니다.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && editingProject && (
          <ProjectEditModal
            project={editingProject}
            onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
            onSave={handleSaveProject}
            onChange={setEditingProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProjectEditModalProps {
  project: ProjectData;
  onClose: () => void;
  onSave: () => void;
  onChange: (project: ProjectData) => void;
}

function ProjectEditModal({ project, onClose, onSave, onChange }: ProjectEditModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    description: false,
    roles: false,
    problemSolution: false,
    outcomes: false,
    gallery: false,
  });
  const [translating, setTranslating] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateArrayField = (field: 'role_ko' | 'role_en' | 'outcome_ko' | 'outcome_en' | 'tags', index: number, value: string) => {
    const newArray = [...project[field]];
    newArray[index] = value;
    onChange({ ...project, [field]: newArray });
  };

  const addArrayItem = (field: 'role_ko' | 'role_en' | 'outcome_ko' | 'outcome_en' | 'tags') => {
    onChange({ ...project, [field]: [...project[field], ''] });
  };

  const removeArrayItem = (field: 'role_ko' | 'role_en' | 'outcome_ko' | 'outcome_en' | 'tags', index: number) => {
    onChange({ ...project, [field]: project[field].filter((_, i) => i !== index) });
  };

  const addGalleryImage = () => {
    onChange({ ...project, gallery: [...project.gallery, { src: '', caption_ko: '', caption_en: '' }] });
  };

  const updateGalleryImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newGallery = [...project.gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    onChange({ ...project, gallery: newGallery });
  };

  const removeGalleryImage = (index: number) => {
    onChange({ ...project, gallery: project.gallery.filter((_, i) => i !== index) });
  };

  // 전체 자동 번역
  const handleAutoTranslate = async () => {
    setTranslating(true);

    try {
      const [
        titleResult,
        statResult,
        teamResult,
        projectDescResult,
        problemResult,
        solutionResult,
      ] = await Promise.all([
        project.title_ko ? translateKoToEn(project.title_ko) : { success: true, translatedText: '' },
        project.stat_ko ? translateKoToEn(project.stat_ko) : { success: true, translatedText: '' },
        project.team_ko ? translateKoToEn(project.team_ko) : { success: true, translatedText: '' },
        project.project_ko ? translateKoToEn(project.project_ko) : { success: true, translatedText: '' },
        project.problem_ko ? translateKoToEn(project.problem_ko) : { success: true, translatedText: '' },
        project.solution_ko ? translateKoToEn(project.solution_ko) : { success: true, translatedText: '' },
      ]);

      const roleEn = await translateArrayKoToEn(project.role_ko);
      const outcomeEn = await translateArrayKoToEn(project.outcome_ko);
      
      // 갤러리 캡션 번역
      const galleryCaptionsEn = await translateArrayKoToEn(project.gallery.map(g => g.caption_ko));
      const updatedGallery = project.gallery.map((g, i) => ({
        ...g,
        caption_en: galleryCaptionsEn[i] || g.caption_en,
      }));

      onChange({
        ...project,
        title_en: titleResult.success ? titleResult.translatedText : project.title_en,
        stat_en: statResult.success ? statResult.translatedText : project.stat_en,
        team_en: teamResult.success ? teamResult.translatedText : project.team_en,
        project_en: projectDescResult.success ? projectDescResult.translatedText : project.project_en,
        problem_en: problemResult.success ? problemResult.translatedText : project.problem_en,
        solution_en: solutionResult.success ? solutionResult.translatedText : project.solution_en,
        role_en: roleEn,
        outcome_en: outcomeEn,
        gallery: updatedGallery,
      });

      alert('영문 번역이 완료되었습니다. 내용을 확인 후 저장해주세요.');
    } catch (error) {
      alert('번역 중 오류가 발생했습니다.');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl glass-card rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-[--border-color]">
          <h2 className="text-xl font-bold text-white">프로젝트 편집</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoTranslate}
              disabled={translating}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm flex items-center gap-1 hover:bg-blue-500/30 disabled:opacity-50"
            >
              {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
              {translating ? '번역 중...' : '한→영 자동번역'}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 기본 정보 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] text-white font-semibold">
              기본 정보
              {expandedSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.basic && (
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">제목 (한글)</label>
                    <input type="text" value={project.title_ko} onChange={(e) => onChange({ ...project, title_ko: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Title (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <input type="text" value={project.title_en} onChange={(e) => onChange({ ...project, title_en: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">성과 (한글)</label>
                    <input type="text" value={project.stat_ko} onChange={(e) => onChange({ ...project, stat_ko: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Stat (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <input type="text" value={project.stat_en} onChange={(e) => onChange({ ...project, stat_en: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">기간</label>
                  <input type="text" value={project.period} onChange={(e) => onChange({ ...project, period: e.target.value })} placeholder="2022.02 ~ 2022.08" className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                </div>
                <ImageUploader
                  label="썸네일 이미지"
                  value={project.thumb}
                  onChange={(url) => onChange({ ...project, thumb: url })}
                  placeholder="썸네일 이미지 URL"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">팀 구성 (한글)</label>
                    <input type="text" value={project.team_ko} onChange={(e) => onChange({ ...project, team_ko: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Team (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <input type="text" value={project.team_en} onChange={(e) => onChange({ ...project, team_en: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">태그 (쉼표로 구분)</label>
                  <input type="text" value={project.tags.join(', ')} onChange={(e) => onChange({ ...project, tags: e.target.value.split(',').map(t => t.trim()) })} placeholder="Global Marketing, Web/App, AR/VR" className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_visible" checked={project.is_visible} onChange={(e) => onChange({ ...project, is_visible: e.target.checked })} className="w-4 h-4 rounded" />
                  <label htmlFor="is_visible" className="text-sm text-[--text-secondary]">공개</label>
                </div>
              </div>
            )}
          </div>

          {/* 프로젝트 설명 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('description')} className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] text-white font-semibold">
              프로젝트 설명
              {expandedSections.description ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.description && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">프로젝트 설명 (한글)</label>
                  <textarea value={project.project_ko} onChange={(e) => onChange({ ...project, project_ko: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">Project Description (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                  <textarea value={project.project_en} onChange={(e) => onChange({ ...project, project_en: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* 역할 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('roles')} className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] text-white font-semibold">
              담당 역할
              {expandedSections.roles ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.roles && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">역할 (한글)</label>
                  {project.role_ko.map((r, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={r} onChange={(e) => updateArrayField('role_ko', i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                      <button onClick={() => removeArrayItem('role_ko', i)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('role_ko')} className="text-sm text-[--accent-color] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> 항목 추가</button>
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">Roles (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                  {project.role_en.map((r, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={r} onChange={(e) => updateArrayField('role_en', i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                      <button onClick={() => removeArrayItem('role_en', i)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('role_en')} className="text-sm text-[--accent-color] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
                </div>
              </div>
            )}
          </div>

          {/* 문제/해결 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('problemSolution')} className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] text-white font-semibold">
              문제 & 해결책
              {expandedSections.problemSolution ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.problemSolution && (
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">문제 (한글)</label>
                    <textarea value={project.problem_ko} onChange={(e) => onChange({ ...project, problem_ko: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Problem (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <textarea value={project.problem_en} onChange={(e) => onChange({ ...project, problem_en: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">해결책 (한글)</label>
                    <textarea value={project.solution_ko} onChange={(e) => onChange({ ...project, solution_ko: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Solution (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                    <textarea value={project.solution_en} onChange={(e) => onChange({ ...project, solution_en: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 성과 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('outcomes')} className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] text-white font-semibold">
              성과 (Outcomes)
              {expandedSections.outcomes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.outcomes && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">성과 (한글)</label>
                  {project.outcome_ko.map((o, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={o} onChange={(e) => updateArrayField('outcome_ko', i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                      <button onClick={() => removeArrayItem('outcome_ko', i)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('outcome_ko')} className="text-sm text-[--accent-color] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> 항목 추가</button>
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-2">Outcomes (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
                  {project.outcome_en.map((o, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={o} onChange={(e) => updateArrayField('outcome_en', i, e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                      <button onClick={() => removeArrayItem('outcome_en', i)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('outcome_en')} className="text-sm text-[--accent-color] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
                </div>
              </div>
            )}
          </div>

          {/* 갤러리 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('gallery')} className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] text-white font-semibold">
              갤러리 이미지
              {expandedSections.gallery ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSections.gallery && (
              <div className="p-4 space-y-4">
                {project.gallery.map((img, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[--bg-tertiary] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">이미지 {i + 1}</span>
                      <button onClick={() => removeGalleryImage(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    <ImageUploader
                      value={img.src}
                      onChange={(url) => updateGalleryImage(i, 'src', url)}
                      placeholder="갤러리 이미지"
                    />
                    <div className="grid md:grid-cols-2 gap-2">
                      <input type="text" value={img.caption_ko} onChange={(e) => updateGalleryImage(i, 'caption_ko', e.target.value)} placeholder="캡션 (한글)" className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                      <input type="text" value={img.caption_en} onChange={(e) => updateGalleryImage(i, 'caption_en', e.target.value)} placeholder="Caption (English) ← 자동번역" className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                    </div>
                  </div>
                ))}
                <button onClick={addGalleryImage} className="w-full py-3 rounded-lg border-2 border-dashed border-[--border-color] text-[--text-secondary] hover:border-[--accent-color] hover:text-[--accent-color] flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> 이미지 추가
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex gap-3 p-6 border-t border-[--border-color]">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary]">취소</button>
          <button onClick={onSave} className="flex-1 btn-primary flex items-center justify-center gap-2"><Save className="w-4 h-4" />저장</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
