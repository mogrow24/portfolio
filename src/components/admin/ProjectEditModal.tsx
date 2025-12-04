'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LocalProject, GalleryImage } from '@/types/admin';
import ImageUploader from './ImageUploader';

interface ProjectEditModalProps {
  project: LocalProject | null;
  onClose: () => void;
  onSave: (data: LocalProject) => void;
}

export default function ProjectEditModal({ project, onClose, onSave }: ProjectEditModalProps) {
  const [activeSection, setActiveSection] = useState<string>('basic');
  
  // 기본 정보
  const [titleKo, setTitleKo] = useState(project?.title_ko || '');
  const [titleEn, setTitleEn] = useState(project?.title_en || '');
  const [tags, setTags] = useState(project?.tags.join(', ') || '');
  const [statKo, setStatKo] = useState(project?.stat_ko || '');
  const [statEn, setStatEn] = useState(project?.stat_en || '');
  const [thumb, setThumb] = useState(project?.thumb || '');
  const [period, setPeriod] = useState(project?.period || '');
  const [teamKo, setTeamKo] = useState(project?.team_ko || '');
  const [teamEn, setTeamEn] = useState(project?.team_en || '');
  const [isVisible, setIsVisible] = useState(project?.is_visible ?? true);

  // 상세 설명
  const [projectKo, setProjectKo] = useState(project?.desc.project_ko || '');
  const [projectEn, setProjectEn] = useState(project?.desc.project_en || '');
  const [roleKo, setRoleKo] = useState(project?.desc.role_ko.join('\n') || '');
  const [roleEn, setRoleEn] = useState(project?.desc.role_en.join('\n') || '');
  const [problemKo, setProblemKo] = useState(project?.desc.problem_ko || '');
  const [problemEn, setProblemEn] = useState(project?.desc.problem_en || '');
  const [solutionKo, setSolutionKo] = useState(project?.desc.solution_ko || '');
  const [solutionEn, setSolutionEn] = useState(project?.desc.solution_en || '');
  const [outcomeKo, setOutcomeKo] = useState(project?.desc.outcome_ko.join('\n') || '');
  const [outcomeEn, setOutcomeEn] = useState(project?.desc.outcome_en.join('\n') || '');

  // 갤러리
  const [gallery, setGallery] = useState<GalleryImage[]>(project?.gallery || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData: LocalProject = {
      id: project?.id || Date.now().toString(),
      title_ko: titleKo,
      title_en: titleEn,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      stat_ko: statKo,
      stat_en: statEn,
      thumb,
      period,
      team_ko: teamKo,
      team_en: teamEn,
      desc: {
        project_ko: projectKo,
        project_en: projectEn,
        role_ko: roleKo.split('\n').filter(Boolean),
        role_en: roleEn.split('\n').filter(Boolean),
        problem_ko: problemKo,
        problem_en: problemEn,
        solution_ko: solutionKo,
        solution_en: solutionEn,
        outcome_ko: outcomeKo.split('\n').filter(Boolean),
        outcome_en: outcomeEn.split('\n').filter(Boolean),
      },
      gallery: gallery.filter(g => g.src),
      is_visible: isVisible,
      order_index: project?.order_index || 0,
    };
    
    onSave(projectData);
  };

  const sections = [
    { id: 'basic', label: '기본 정보' },
    { id: 'description', label: '프로젝트 설명' },
    { id: 'role', label: '역할 & 문제해결' },
    { id: 'outcome', label: '성과' },
    { id: 'gallery', label: '갤러리 이미지' },
  ];

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? '' : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl glass-card rounded-2xl p-6 my-8"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[--border-color]">
          <h2 className="text-xl font-bold text-white">
            {project ? '프로젝트 수정' : '새 프로젝트 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] hover:bg-[--bg-secondary] transition-colors"
            >
              <span className="font-semibold text-white">기본 정보</span>
              {activeSection === 'basic' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {activeSection === 'basic' && (
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">제목 (한글) *</label>
                    <input
                      type="text"
                      value={titleKo}
                      onChange={(e) => setTitleKo(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Title (English) *</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">핵심 성과 (한글)</label>
                    <input
                      type="text"
                      value={statKo}
                      onChange={(e) => setStatKo(e.target.value)}
                      placeholder="예: 전환율 30% 향상"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Key Result (English)</label>
                    <input
                      type="text"
                      value={statEn}
                      onChange={(e) => setStatEn(e.target.value)}
                      placeholder="e.g., 30% Conversion Increase"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">기간</label>
                    <input
                      type="text"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      placeholder="2024.01 ~ 2024.06"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="UX, PM, Mobile"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">팀 구성 (한글)</label>
                    <input
                      type="text"
                      value={teamKo}
                      onChange={(e) => setTeamKo(e.target.value)}
                      placeholder="예: 기획 2명, 디자인 3명"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Team (English)</label>
                    <input
                      type="text"
                      value={teamEn}
                      onChange={(e) => setTeamEn(e.target.value)}
                      placeholder="e.g., 2 planners, 3 designers"
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    />
                  </div>
                </div>

                {/* 썸네일 이미지 업로더 */}
                <ImageUploader
                  value={thumb}
                  onChange={setThumb}
                  label="썸네일 이미지"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_visible"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="w-4 h-4 rounded border-[--border-color] bg-[--bg-tertiary] text-[--accent-color] focus:ring-[--accent-color]"
                  />
                  <label htmlFor="is_visible" className="text-sm text-[--text-secondary]">
                    공개
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 프로젝트 설명 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('description')}
              className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] hover:bg-[--bg-secondary] transition-colors"
            >
              <span className="font-semibold text-white">프로젝트 설명</span>
              {activeSection === 'description' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {activeSection === 'description' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">프로젝트 개요 (한글)</label>
                  <textarea
                    value={projectKo}
                    onChange={(e) => setProjectKo(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">Project Overview (English)</label>
                  <textarea
                    value={projectEn}
                    onChange={(e) => setProjectEn(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 역할 & 문제해결 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('role')}
              className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] hover:bg-[--bg-secondary] transition-colors"
            >
              <span className="font-semibold text-white">역할 & 문제해결</span>
              {activeSection === 'role' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {activeSection === 'role' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">담당 역할 (한글, 줄바꿈으로 구분)</label>
                  <textarea
                    value={roleKo}
                    onChange={(e) => setRoleKo(e.target.value)}
                    rows={4}
                    placeholder="기획 100%&#10;외주 소통 80%&#10;클라이언트 소통 80%"
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">Roles (English, separate by newline)</label>
                  <textarea
                    value={roleEn}
                    onChange={(e) => setRoleEn(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">문제 상황 (한글)</label>
                    <textarea
                      value={problemKo}
                      onChange={(e) => setProblemKo(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Problem (English)</label>
                    <textarea
                      value={problemEn}
                      onChange={(e) => setProblemEn(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">해결 방안 (한글)</label>
                    <textarea
                      value={solutionKo}
                      onChange={(e) => setSolutionKo(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-secondary] mb-1">Solution (English)</label>
                    <textarea
                      value={solutionEn}
                      onChange={(e) => setSolutionEn(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 성과 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('outcome')}
              className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] hover:bg-[--bg-secondary] transition-colors"
            >
              <span className="font-semibold text-white">성과 (Outcome)</span>
              {activeSection === 'outcome' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {activeSection === 'outcome' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">성과 목록 (한글, 줄바꿈으로 구분)</label>
                  <textarea
                    value={outcomeKo}
                    onChange={(e) => setOutcomeKo(e.target.value)}
                    rows={4}
                    placeholder="정식 오픈 후 브랜드 홍보 성공&#10;전환율 30% 향상&#10;어워드 수상"
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[--text-secondary] mb-1">Outcomes (English, separate by newline)</label>
                  <textarea
                    value={outcomeEn}
                    onChange={(e) => setOutcomeEn(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 갤러리 섹션 */}
          <div className="border border-[--border-color] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('gallery')}
              className="w-full flex items-center justify-between p-4 bg-[--bg-tertiary] hover:bg-[--bg-secondary] transition-colors"
            >
              <span className="font-semibold text-white">갤러리 이미지 ({gallery.length})</span>
              {activeSection === 'gallery' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {activeSection === 'gallery' && (
              <div className="p-4 space-y-4">
                {gallery.map((img, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[--bg-tertiary] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">이미지 {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ImageUploader
                      value={img.src}
                      onChange={(url) => {
                        const newGallery = [...gallery];
                        newGallery[i] = { ...newGallery[i], src: url };
                        setGallery(newGallery);
                      }}
                    />
                    <div className="grid md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={img.caption_ko}
                        onChange={(e) => {
                          const newGallery = [...gallery];
                          newGallery[i] = { ...newGallery[i], caption_ko: e.target.value };
                          setGallery(newGallery);
                        }}
                        placeholder="캡션 (한글)"
                        className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                      />
                      <input
                        type="text"
                        value={img.caption_en}
                        onChange={(e) => {
                          const newGallery = [...gallery];
                          newGallery[i] = { ...newGallery[i], caption_en: e.target.value };
                          setGallery(newGallery);
                        }}
                        placeholder="Caption (English)"
                        className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setGallery([...gallery, { src: '', caption_ko: '', caption_en: '' }])}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-[--border-color] text-[--text-secondary] hover:border-[--accent-color] hover:text-[--accent-color]"
                >
                  + 이미지 추가
                </button>
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-[--border-color]">
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
