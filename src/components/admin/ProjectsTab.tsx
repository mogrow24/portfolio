'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Plus, Edit3, Trash2, X, Eye, EyeOff, FolderOpen, GripVertical, ChevronDown, ChevronUp, 
  Languages, Loader2, Image as ImageIcon, Layers, Monitor, FileText, Sparkles, Tag, ArrowUp, ArrowDown, RefreshCw, Download, Upload
} from 'lucide-react';
import { getProjects, saveProjects, getCategories, saveCategories, type ProjectData, type GalleryImage, type CategoryData, DEFAULT_CATEGORIES, isCloudSyncEnabled, STORAGE_KEYS, SITE_DATA_UPDATED_EVENT } from '@/lib/siteData';
import { translateKoToEn, translateArrayKoToEn } from '@/lib/translate';
import { api } from '@/lib/supabase';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';

// 아이콘 맵핑
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Layers,
  Monitor,
  FileText,
  Sparkles,
  Tag,
};

export default function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    setProjects(getProjects().sort((a, b) => a.order_index - b.order_index));
    setCategories(getCategories().sort((a, b) => a.order_index - b.order_index));
  }, []);

  const handleSave = async () => {
    if (projects.length === 0) {
      alert('프로젝트가 없습니다. 최소 1개 이상의 프로젝트가 필요합니다.');
      return;
    }
    
    setSaving(true);
    
    try {
      // order_index 재할당 후 저장
      const reorderedProjects = projects.map((proj, index) => ({
        ...proj,
        order_index: index,
      }));
      
      console.log('💾 저장 시작:', reorderedProjects.length, '개 프로젝트');
      
      // 저장 실행 (await로 완료 대기)
      await saveProjects(reorderedProjects);
      await saveCategories(categories);
      
      // 저장 후 즉시 확인 (여러 번 확인하여 확실하게)
      let savedProjects = getProjects();
      let retryCount = 0;
      const maxRetries = 10;
      
      while (savedProjects.length !== reorderedProjects.length && retryCount < maxRetries) {
        console.warn(`⚠️ 저장 검증 실패 (시도 ${retryCount + 1}/${maxRetries}): 저장한 ${reorderedProjects.length}개, 확인된 ${savedProjects.length}개`);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms 대기
        savedProjects = getProjects();
        retryCount++;
      }
      
      console.log('✅ 저장 후 확인:', savedProjects.length, '개 프로젝트');
      
      if (savedProjects.length === 0) {
        console.error('❌ 저장 실패 - 프로젝트가 없음!');
        alert('저장에 실패했습니다. 콘솔을 확인하세요.');
        setSaving(false);
        return;
      }
      
      if (savedProjects.length !== reorderedProjects.length) {
        console.error(`❌ 저장 불일치: 저장한 ${reorderedProjects.length}개, 확인된 ${savedProjects.length}개`);
        // 저장 불일치 시 다시 저장 시도
        console.log('🔄 저장 불일치 감지 - 다시 저장 시도...');
        await saveProjects(reorderedProjects);
        await new Promise(resolve => setTimeout(resolve, 200));
        savedProjects = getProjects();
        if (savedProjects.length === reorderedProjects.length) {
          console.log('✅ 재저장 성공!');
        } else {
          alert(`저장 불일치가 발생했습니다. 저장한 ${reorderedProjects.length}개 중 ${savedProjects.length}개만 확인되었습니다.`);
        }
      }
      
      // 상태 업데이트 (저장된 데이터로)
      setProjects([...savedProjects].sort((a, b) => a.order_index - b.order_index));
      
      console.log(`✅ 전체 저장 완료: ${savedProjects.length}개 프로젝트`);
      
      // 강제 새로고침 이벤트 (여러 번 발생)
      const triggerEvent = () => {
        window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
          detail: { key: STORAGE_KEYS.PROJECTS, data: savedProjects }
        }));
      };
      
      triggerEvent();
      setTimeout(triggerEvent, 100);
      setTimeout(triggerEvent, 300);
      setTimeout(triggerEvent, 500);
      setTimeout(triggerEvent, 1000);
      
    } catch (error) {
      console.error('❌ 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  // 순서 이동 함수 (저장 버튼을 눌러야 저장됨)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newProjects = [...projects];
    [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]];
    const reordered = newProjects.map((proj, i) => ({ ...proj, order_index: i }));
    
    // 상태만 업데이트 (저장은 저장 버튼을 눌러야 함)
    setProjects(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === projects.length - 1) return;
    
    const newProjects = [...projects];
    [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
    const reordered = newProjects.map((proj, i) => ({ ...proj, order_index: i }));
    
    // 상태만 업데이트 (저장은 저장 버튼을 눌러야 함)
    setProjects(reordered);
  };

  const handleAddNew = () => {
    // 새 프로젝트는 맨 위에 추가 (order_index: 0)
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
      video: '',
      is_visible: true,
      order_index: 0, // 새 항목은 맨 위
      category: categories[0]?.key || 'exhibition',
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
    
    const updatedProjects = projects.filter(p => p.id !== id);
    
    // order_index 재할당
    const reorderedProjects = updatedProjects.map((proj, index) => ({
      ...proj,
      order_index: index,
    }));
    
    // 상태만 업데이트 (저장은 저장 버튼을 눌러야 함)
    setProjects(reorderedProjects);
  };

  const handleToggleVisibility = (id: string) => {
    // 여러 개를 동시에 숨길 수 있도록 상태만 업데이트
    const updatedProjects = projects.map(p => 
      p.id === id ? { ...p, is_visible: !p.is_visible } : p
    );
    
    // 상태만 업데이트 (저장은 저장 버튼을 눌러야 함)
    setProjects(updatedProjects);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    
    setSaving(true);
    
    try {
      const cleaned = {
        ...editingProject,
        role_ko: editingProject.role_ko.filter(r => r.trim()),
        role_en: editingProject.role_en.filter(r => r.trim()),
        outcome_ko: editingProject.outcome_ko.filter(o => o.trim()),
        outcome_en: editingProject.outcome_en.filter(o => o.trim()),
        tags: editingProject.tags.filter(t => t.trim()),
      };

      let updatedProjects: ProjectData[];
      const exists = projects.find(p => p.id === cleaned.id);
      if (exists) {
        // 기존 항목 수정
        updatedProjects = projects.map(p => p.id === cleaned.id ? cleaned : p);
      } else {
        // 새 항목은 맨 위에 추가 (기존 항목들의 order_index를 1씩 증가)
        const reordered = projects.map(proj => ({
          ...proj,
          order_index: proj.order_index + 1,
        }));
        updatedProjects = [{ ...cleaned, order_index: 0 }, ...reordered];
      }

      // order_index 재할당 후 저장
      const reorderedProjects = updatedProjects.map((proj, index) => ({
        ...proj,
        order_index: index,
      }));

      // 즉시 저장 (에러 발생 시 throw)
      await saveProjects(reorderedProjects);
      await saveCategories(categories);
      
      // 저장 확인 - 로컬 스토리지에서 다시 읽어서 검증
      const savedProjects = getProjects();
      const savedCount = savedProjects.length;
      const expectedCount = reorderedProjects.length;
      
      if (savedCount !== expectedCount) {
        console.error(`⚠️ 저장 불일치: 예상 ${expectedCount}개, 실제 ${savedCount}개`);
        // 강제로 다시 저장 시도
        await saveProjects(reorderedProjects);
      }
      
      // 상태 업데이트 (저장 후 즉시)
      setProjects(reorderedProjects);
      
      // 성공 알림
      console.log(`✅ 프로젝트 저장 완료: ${reorderedProjects.length}개`);
      
      setIsModalOpen(false);
      setEditingProject(null);
      
      // 프론트엔드 강제 새로고침 이벤트 발생 (즉시 + 지연 보장)
      // saveToLocalStorage에서 이미 이벤트를 발생시키지만, 추가 보장을 위해 다시 발생
      const triggerUpdate = () => {
        const event = new CustomEvent(SITE_DATA_UPDATED_EVENT, {
          detail: { key: STORAGE_KEYS.PROJECTS, data: reorderedProjects }
        });
        window.dispatchEvent(event);
        console.log('📤 이벤트 발생:', SITE_DATA_UPDATED_EVENT, `${reorderedProjects.length}개 프로젝트`);
      };
      
      // 즉시 발생
      triggerUpdate();
      
      // 추가 보장: 약간의 지연 후 다시 발생
      setTimeout(() => {
        console.log('📤 지연 이벤트 발생 (100ms)');
        triggerUpdate();
      }, 100);
      
      setTimeout(() => {
        console.log('📤 최종 이벤트 발생 (500ms)');
        triggerUpdate();
      }, 500);
      
    } catch (error) {
      console.error('❌ 프로젝트 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  // 카테고리 관리 함수
  const handleAddCategory = () => {
    const newCategory: CategoryData = {
      id: `cat-${Date.now()}`,
      key: `category_${Date.now()}`,
      label_ko: '새 카테고리',
      label_en: 'New Category',
      icon: 'Tag',
      order_index: categories.length,
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (id: string, field: keyof CategoryData, value: string | number) => {
    setCategories(categories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    // 해당 카테고리를 사용하는 프로젝트가 있는지 확인
    const projectsWithCategory = projects.filter(p => p.category === category.key);
    if (projectsWithCategory.length > 0) {
      alert(`이 카테고리를 사용하는 프로젝트가 ${projectsWithCategory.length}개 있습니다. 먼저 프로젝트의 카테고리를 변경해주세요.`);
      return;
    }
    
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setCategories(categories.filter(c => c.id !== id));
  };

  // 데이터 복구 함수들 (강화 버전 - 모든 가능한 곳에서 찾기)
  const handleRecoverData = () => {
    const allFoundProjects: ProjectData[] = [];
    const allSources: string[] = [];
    
    // 1. 현재 저장된 데이터
    const current = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (current) {
      try {
        const projects = JSON.parse(current);
        if (Array.isArray(projects) && projects.length > 0) {
          allFoundProjects.push(...projects);
          allSources.push(`현재 저장: ${projects.length}개`);
        }
      } catch (e) {
        console.error('현재 데이터 파싱 실패:', e);
      }
    }
    
    // 2. 모든 가능한 키에서 찾기
    const allKeys = Object.keys(localStorage);
    const relevantKeys = allKeys.filter(key => 
      key.includes('project') || 
      key.includes('backup') ||
      key.startsWith('site_')
    );
    
    relevantKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // 배열인 경우
          if (Array.isArray(parsed)) {
            parsed.forEach((p: any) => {
              if (p && (p.id || p.title_ko || p.title_en || p.title)) {
                const exists = allFoundProjects.find(existing => 
                  existing.id === p.id || 
                  (existing.title_ko && p.title_ko && existing.title_ko === p.title_ko) ||
                  (existing.title_en && p.title_en && existing.title_en === p.title_en)
                );
                if (!exists) {
                  allFoundProjects.push(p);
                  if (!allSources.includes(key)) {
                    allSources.push(`${key}: ${parsed.length}개`);
                  }
                } else {
                  // 중복이지만 내용이 더 많은지 확인하여 교체
                  const existingIndex = allFoundProjects.findIndex(existing => 
                    existing.id === p.id || 
                    (existing.title_ko && p.title_ko && existing.title_ko === p.title_ko) ||
                    (existing.title_en && p.title_en && existing.title_en === p.title_en)
                  );
                  
                  if (existingIndex !== -1) {
                    const existing = allFoundProjects[existingIndex];
                    const existingHasContent = (existing.project_ko || existing.project_en) && 
                                              (Array.isArray(existing.role_ko) && existing.role_ko.length > 0 || 
                                               Array.isArray(existing.role_en) && existing.role_en.length > 0);
                    const newHasContent = (p.project_ko || p.project_en) && 
                                         (Array.isArray(p.role_ko) && p.role_ko.length > 0 || 
                                          Array.isArray(p.role_en) && p.role_en.length > 0);
                    
                    // 새 데이터가 내용이 있고 기존 것이 없으면 교체
                    if (newHasContent && !existingHasContent) {
                      allFoundProjects[existingIndex] = p;
                      console.log(`✅ ${p.title_ko || p.title_en} 교체: 내용이 있는 버전으로`);
                    } else if (newHasContent && existingHasContent) {
                      // 둘 다 내용이 있으면 더 많은 내용을 가진 것으로 교체
                      const existingScore = (
                        (existing.project_ko ? 1 : 0) + (existing.project_en ? 1 : 0) +
                        (Array.isArray(existing.role_ko) ? existing.role_ko.length : 0) +
                        (Array.isArray(existing.role_en) ? existing.role_en.length : 0) +
                        (Array.isArray(existing.gallery) ? existing.gallery.length : 0)
                      );
                      const newScore = (
                        (p.project_ko ? 1 : 0) + (p.project_en ? 1 : 0) +
                        (Array.isArray(p.role_ko) ? p.role_ko.length : 0) +
                        (Array.isArray(p.role_en) ? p.role_en.length : 0) +
                        (Array.isArray(p.gallery) ? p.gallery.length : 0)
                      );
                      if (newScore > existingScore) {
                        allFoundProjects[existingIndex] = p;
                        console.log(`✅ ${p.title_ko || p.title_en} 교체: 더 많은 내용`);
                      }
                    }
                  }
                }
              }
            });
          }
          // 중첩된 projects 속성이 있는 경우
          else if (parsed.projects && Array.isArray(parsed.projects)) {
            parsed.projects.forEach((p: any) => {
              if (p && (p.id || p.title_ko || p.title_en || p.title)) {
                const exists = allFoundProjects.find(existing => 
                  existing.id === p.id || 
                  (existing.title_ko && p.title_ko && existing.title_ko === p.title_ko) ||
                  (existing.title_en && p.title_en && existing.title_en === p.title_en)
                );
                if (!exists) {
                  allFoundProjects.push(p);
                  if (!allSources.includes(key)) {
                    allSources.push(`${key}: ${parsed.projects.length}개 (중첩)`);
                  }
                } else {
                  // 중복이지만 내용이 더 많은지 확인하여 교체
                  const existingIndex = allFoundProjects.findIndex(existing => 
                    existing.id === p.id || 
                    (existing.title_ko && p.title_ko && existing.title_ko === p.title_ko) ||
                    (existing.title_en && p.title_en && existing.title_en === p.title_en)
                  );
                  
                  if (existingIndex !== -1) {
                    const existing = allFoundProjects[existingIndex];
                    const existingHasContent = (existing.project_ko || existing.project_en) && 
                                              (Array.isArray(existing.role_ko) && existing.role_ko.length > 0 || 
                                               Array.isArray(existing.role_en) && existing.role_en.length > 0);
                    const newHasContent = (p.project_ko || p.project_en) && 
                                         (Array.isArray(p.role_ko) && p.role_ko.length > 0 || 
                                          Array.isArray(p.role_en) && p.role_en.length > 0);
                    
                    // 새 데이터가 내용이 있고 기존 것이 없으면 교체
                    if (newHasContent && !existingHasContent) {
                      allFoundProjects[existingIndex] = p;
                      console.log(`✅ ${p.title_ko || p.title_en} 교체: 내용이 있는 버전으로`);
                    } else if (newHasContent && existingHasContent) {
                      // 둘 다 내용이 있으면 더 많은 내용을 가진 것으로 교체
                      const existingScore = (
                        (existing.project_ko ? 1 : 0) + (existing.project_en ? 1 : 0) +
                        (Array.isArray(existing.role_ko) ? existing.role_ko.length : 0) +
                        (Array.isArray(existing.role_en) ? existing.role_en.length : 0) +
                        (Array.isArray(existing.gallery) ? existing.gallery.length : 0)
                      );
                      const newScore = (
                        (p.project_ko ? 1 : 0) + (p.project_en ? 1 : 0) +
                        (Array.isArray(p.role_ko) ? p.role_ko.length : 0) +
                        (Array.isArray(p.role_en) ? p.role_en.length : 0) +
                        (Array.isArray(p.gallery) ? p.gallery.length : 0)
                      );
                      if (newScore > existingScore) {
                        allFoundProjects[existingIndex] = p;
                        console.log(`✅ ${p.title_ko || p.title_en} 교체: 더 많은 내용`);
                      }
                    }
                  }
                }
              }
            });
          }
        }
      } catch (e) {
        // 파싱 실패는 무시
      }
    });
    
    // 3. 결과 출력
    console.log('🔍 발견된 소스:', allSources);
    console.log('📊 총 발견된 프로젝트:', allFoundProjects.length, '개');
    console.table(allFoundProjects.map(p => ({
      ID: p.id,
      제목: p.title_ko || p.title_en || '없음',
      카테고리: p.category || '없음'
    })));
    
    if (allFoundProjects.length > 0) {
      // 가장 완전한 데이터 선택 (내용이 가장 많은 것)
      const projectsWithContent = allFoundProjects.map(p => ({
        project: p,
        contentScore: (
          (p.project_ko ? 1 : 0) +
          (p.project_en ? 1 : 0) +
          (Array.isArray(p.role_ko) && p.role_ko.length > 0 ? 1 : 0) +
          (Array.isArray(p.role_en) && p.role_en.length > 0 ? 1 : 0) +
          (Array.isArray(p.outcome_ko) && p.outcome_ko.length > 0 ? 1 : 0) +
          (Array.isArray(p.outcome_en) && p.outcome_en.length > 0 ? 1 : 0) +
          (Array.isArray(p.gallery) && p.gallery.length > 0 ? 2 : 0) +
          (p.problem_ko || p.problem_en ? 1 : 0) +
          (p.solution_ko || p.solution_en ? 1 : 0)
        )
      }));
      
      // 내용 점수가 높은 것부터 정렬
      projectsWithContent.sort((a, b) => b.contentScore - a.contentScore);
      
      // 중복 제거 (같은 ID나 제목이 있으면 내용이 더 많은 것만 남김)
      const uniqueProjects: ProjectData[] = [];
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      
      projectsWithContent.forEach(({ project }) => {
        const id = project.id || '';
        const title = project.title_ko || project.title_en || '';
        
        if (!id && !title) return;
        
        const key = id || title;
        if (seenIds.has(id) || seenTitles.has(title)) {
          // 중복이지만 내용이 더 많은지 확인
          const existing = uniqueProjects.find(p => 
            (id && p.id === id) || (title && (p.title_ko === title || p.title_en === title))
          );
          
          if (existing) {
            const existingScore = (
              (existing.project_ko ? 1 : 0) +
              (existing.project_en ? 1 : 0) +
              (Array.isArray(existing.role_ko) && existing.role_ko.length > 0 ? 1 : 0) +
              (Array.isArray(existing.gallery) && existing.gallery.length > 0 ? 2 : 0)
            );
            
            const newScore = (
              (project.project_ko ? 1 : 0) +
              (project.project_en ? 1 : 0) +
              (Array.isArray(project.role_ko) && project.role_ko.length > 0 ? 1 : 0) +
              (Array.isArray(project.gallery) && project.gallery.length > 0 ? 2 : 0)
            );
            
            if (newScore > existingScore) {
              // 기존 것을 제거하고 새로운 것으로 교체
              const index = uniqueProjects.indexOf(existing);
              if (index !== -1) {
                uniqueProjects[index] = project;
              }
            }
          }
        } else {
          uniqueProjects.push(project);
          if (id) seenIds.add(id);
          if (title) seenTitles.add(title);
        }
      });
      
      // order_index 정리
      const sortedProjects = uniqueProjects.map((p, index) => ({
        ...p,
        order_index: typeof p.order_index === 'number' ? p.order_index : index,
        id: p.id || `proj-${Date.now()}-${index}`
      })).sort((a, b) => a.order_index - b.order_index);
      
      // 내용 확인
      const projectsWithFullContent = sortedProjects.filter(p => 
        (p.project_ko || p.project_en) && 
        (Array.isArray(p.role_ko) && p.role_ko.length > 0 || Array.isArray(p.role_en) && p.role_en.length > 0)
      );
      
      const message = `총 ${sortedProjects.length}개 프로젝트를 찾았습니다.\n\n` +
        `내용이 있는 프로젝트: ${projectsWithFullContent.length}개\n` +
        `빈 프로젝트: ${sortedProjects.length - projectsWithFullContent.length}개\n\n` +
        `발견된 소스:\n${allSources.slice(0, 5).join('\n')}${allSources.length > 5 ? `\n... 외 ${allSources.length - 5}개` : ''}\n\n` +
        `복구하시겠습니까?`;
      
      console.log('📊 발견된 프로젝트 상세:', sortedProjects);
      
      if (confirm(message)) {
        // 현재 데이터 백업
        if (current) {
          const backupKey = `site_projects_backup_before_recover_${Date.now()}`;
          localStorage.setItem(backupKey, current);
          console.log(`✅ 현재 데이터 백업: ${backupKey}`);
        }
        
        // 복구
        setProjects(sortedProjects);
        saveProjects(sortedProjects);
        
        // 이벤트 발생
        window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
          detail: { key: STORAGE_KEYS.PROJECTS, data: sortedProjects }
        }));
        
        alert(
          `✅ ${sortedProjects.length}개 프로젝트 복구 완료!\n\n` +
          `내용이 있는 프로젝트: ${projectsWithFullContent.length}개\n` +
          `빈 프로젝트: ${sortedProjects.length - projectsWithFullContent.length}개\n\n` +
          `페이지를 새로고침하세요.`
        );
        return;
      }
    }
    
    // 4. 긴급 복구 스크립트 안내
    alert(
      '❌ 자동 복구 실패\n\n' +
      '브라우저 콘솔에서 다음을 실행하세요:\n\n' +
      '1. F12 키를 눌러 개발자 도구 열기\n' +
      '2. Console 탭 선택\n' +
      '3. 복구 스크립트 실행 (아래 코드 붙여넣기)\n\n' +
      '또는 어드민 페이지를 새로고침하고 다시 시도하세요.'
    );
    
    // 콘솔에 긴급 복구 코드 출력
    console.log(`
🔴 긴급 복구 코드 (콘솔에 복사해서 실행하세요):

(function() {
  const STORAGE_KEY = 'site_projects';
  const allFound = [];
  Object.keys(localStorage).forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (Array.isArray(data)) {
        allFound.push(...data);
      } else if (data.projects) {
        allFound.push(...data.projects);
      }
    } catch(e) {}
  });
  
  const unique = [];
  allFound.forEach(p => {
    if (p && (p.id || p.title_ko || p.title_en) && !unique.find(u => u.id === p.id)) {
      unique.push(p);
    }
  });
  
  console.log('찾은 프로젝트:', unique.length, '개');
  console.table(unique);
  
  if (unique.length > 0 && confirm(unique.length + '개 복구?')) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    location.reload();
  }
})();
    `);
  };

  const handleBackupData = () => {
    const dataToBackup = {
      timestamp: new Date().toISOString(),
      projects: projects,
      categories: categories,
      version: '1.0'
    };
    
    const backupKey = `site_projects_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(projects));
    localStorage.setItem(`site_categories_backup_${Date.now()}`, JSON.stringify(categories));
    
    // 다운로드 가능한 파일로도 저장
    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`✅ 백업 완료!\n- 로컬 스토리지: ${backupKey}\n- 파일 다운로드: portfolio-backup-*.json`);
  };

  const handleRestoreFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.projects && Array.isArray(data.projects)) {
            if (confirm(`${data.projects.length}개 프로젝트를 찾았습니다. 복구하시겠습니까?`)) {
              setProjects(data.projects.sort((a: ProjectData, b: ProjectData) => a.order_index - b.order_index));
              saveProjects(data.projects);
              if (data.categories) {
                setCategories(data.categories);
                saveCategories(data.categories);
              }
              alert(`✅ ${data.projects.length}개 프로젝트 복구 완료!`);
            }
          } else {
            alert('❌ 잘못된 파일 형식입니다.');
          }
        } catch (error) {
          console.error('파일 복구 실패:', error);
          alert('❌ 파일 읽기 실패');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 카테고리 라벨 가져오기
  const getCategoryLabel = (categoryKey: string) => {
    const cat = categories.find(c => c.key === categoryKey);
    return cat?.label_ko || categoryKey;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">프로젝트 관리</h2>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showCategoryManager ? 'bg-[--accent-color]/20 text-[--accent-color]' : 'bg-[--bg-tertiary] text-white hover:bg-[--accent-color]/10'
            }`}
          >
            <Tag className="w-4 h-4" />
            카테고리 관리
          </motion.button>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRecoverData}
            className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-2 hover:bg-yellow-500/30"
            title="저장된 데이터 복구"
          >
            <RefreshCw className="w-4 h-4" />
            데이터 복구
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackupData}
            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-2 hover:bg-blue-500/30"
            title="현재 데이터 백업"
          >
            <Download className="w-4 h-4" />
            백업
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestoreFromFile}
            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-2 hover:bg-green-500/30"
            title="백업 파일에서 복구"
          >
            <Upload className="w-4 h-4" />
            파일 복구
          </motion.button>
        </div>
      </div>

      {/* 카테고리 관리 섹션 */}
      <AnimatePresence>
        {showCategoryManager && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[--accent-color]" />
                  카테고리 관리
                </h3>
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 rounded-lg bg-[--accent-color]/20 text-[--accent-color] text-sm flex items-center gap-1 hover:bg-[--accent-color]/30"
                >
                  <Plus className="w-3 h-3" />
                  추가
                </button>
              </div>
              
              <div className="space-y-3">
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon] || Tag;
                  return (
                    <div key={category.id} className="flex items-center gap-3 p-3 rounded-lg bg-[--bg-tertiary]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[--accent-color]/20 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-[--accent-color]" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={category.key}
                          onChange={(e) => handleUpdateCategory(category.id, 'key', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                          placeholder="키 (영문)"
                          className="px-3 py-1.5 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
                        />
                        <input
                          type="text"
                          value={category.label_ko}
                          onChange={(e) => handleUpdateCategory(category.id, 'label_ko', e.target.value)}
                          placeholder="한글 라벨"
                          className="px-3 py-1.5 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
                        />
                        <input
                          type="text"
                          value={category.label_en}
                          onChange={(e) => handleUpdateCategory(category.id, 'label_en', e.target.value)}
                          placeholder="English Label"
                          className="px-3 py-1.5 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
                        />
                      </div>
                      <select
                        value={category.icon}
                        onChange={(e) => handleUpdateCategory(category.id, 'icon', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
                      >
                        <option value="Layers">Layers</option>
                        <option value="Monitor">Monitor</option>
                        <option value="FileText">FileText</option>
                        <option value="Sparkles">Sparkles</option>
                        <option value="Tag">Tag</option>
                      </select>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-xs text-[--text-secondary]">
                * 카테고리의 '키'는 영문 소문자와 언더스코어(_)만 사용할 수 있습니다.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 프로젝트 목록 */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
            className={`glass-card rounded-xl p-4 ${!project.is_visible ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-4">
              {/* 순서 조정 버튼 */}
              <div className="flex-shrink-0 flex flex-col gap-1 pt-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded transition-colors ${index === 0 ? 'text-[--text-secondary]/30 cursor-not-allowed' : 'text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10'}`}
                  title="위로 이동"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-xs text-[--text-secondary] text-center">{index + 1}</span>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === projects.length - 1}
                  className={`p-1 rounded transition-colors ${index === projects.length - 1 ? 'text-[--text-secondary]/30 cursor-not-allowed' : 'text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10'}`}
                  title="아래로 이동"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-[--bg-tertiary] flex items-center justify-center overflow-hidden">
                {project.thumb ? (
                  <img src={project.thumb} alt={project.title_ko} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[--text-secondary]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-white truncate">{project.title_ko || '(제목 없음)'}</h3>
                  {!project.is_visible && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[--bg-tertiary] text-[--text-secondary]">숨김</span>
                  )}
                  {project.category && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[--accent-color]/20 text-[--accent-color]">
                      {getCategoryLabel(project.category)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[--text-secondary] line-clamp-2 mb-2">{project.project_ko}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tags && Array.isArray(project.tags) && project.tags.slice(0, 3).map((tag, idx) => (
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
            categories={categories}
            onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
            onSave={handleSaveProject}
            onChange={setEditingProject}
            onAddCategory={(newCat) => setCategories([...categories, newCat])}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProjectEditModalProps {
  project: ProjectData;
  categories: CategoryData[];
  onClose: () => void;
  onSave: () => void;
  onChange: (project: ProjectData) => void;
  onAddCategory: (category: CategoryData) => void;
  saving?: boolean;
}

// 카테고리 선택 + 추가 컴포넌트
function CategorySelector({ 
  value, 
  categories, 
  onChange, 
  onAddCategory 
}: { 
  value: string; 
  categories: CategoryData[]; 
  onChange: (value: string) => void;
  onAddCategory: (cat: CategoryData) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ key: '', label_ko: '', label_en: '' });

  const handleAddNew = () => {
    if (!newCat.key.trim() || !newCat.label_ko.trim()) return;
    
    const category: CategoryData = {
      id: `cat-${Date.now()}`,
      key: newCat.key.toLowerCase().replace(/\s/g, '_'),
      label_ko: newCat.label_ko,
      label_en: newCat.label_en || newCat.label_ko,
      icon: 'Tag',
      order_index: categories.length,
    };
    
    onAddCategory(category);
    onChange(category.key);
    setNewCat({ key: '', label_ko: '', label_en: '' });
    setIsAdding(false);
  };

  return (
    <div>
      <label className="block text-sm text-[--text-secondary] mb-1">카테고리</label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
        >
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.key}>
              {cat.label_ko} ({cat.label_en})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-colors ${
            isAdding ? 'bg-[--accent-color]/20 text-[--accent-color]' : 'bg-[--bg-tertiary] text-[--text-secondary] hover:text-[--accent-color]'
          }`}
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>
      
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 rounded-lg bg-[--bg-primary] border border-[--accent-color]/30 space-y-2"
          >
            <p className="text-xs text-[--accent-color] font-semibold">새 카테고리 추가</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={newCat.key}
                onChange={(e) => setNewCat(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                placeholder="키 (영문)"
                className="px-3 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
              />
              <input
                type="text"
                value={newCat.label_ko}
                onChange={(e) => setNewCat(prev => ({ ...prev, label_ko: e.target.value }))}
                placeholder="한글 라벨"
                className="px-3 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
              />
              <input
                type="text"
                value={newCat.label_en}
                onChange={(e) => setNewCat(prev => ({ ...prev, label_en: e.target.value }))}
                placeholder="English"
                className="px-3 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs text-[--text-secondary] hover:bg-[--bg-tertiary]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddNew}
                disabled={!newCat.key.trim() || !newCat.label_ko.trim()}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-[--accent-color] text-black font-semibold disabled:opacity-50"
              >
                추가하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectEditModal({ project, categories, onClose, onSave, onChange, onAddCategory, saving = false }: ProjectEditModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    description: false,
    roles: false,
    problemSolution: false,
    outcomes: false,
    gallery: false,
  });
  const [translating, setTranslating] = useState(false);
  
  // 모달 드래그 시 닫힘 방지를 위한 상태
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);

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
    onChange({ ...project, gallery: [...project.gallery, { src: '', caption_ko: '', caption_en: '', type: 'image' as const }] });
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
      onMouseDown={(e) => setMouseDownTarget(e.target)}
      onClick={(e) => {
        // 드래그 시 모달 닫힘 방지: mousedown과 click이 같은 요소에서 발생했을 때만 닫기
        if (e.target === e.currentTarget && mouseDownTarget === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-4xl glass-card rounded-2xl max-h-[90vh] overflow-hidden flex flex-col select-text"
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
                
                {/* 카테고리 선택 */}
                <CategorySelector
                  value={project.category || ''}
                  categories={categories}
                  onChange={(value) => onChange({ ...project, category: value })}
                  onAddCategory={(newCat) => {
                    // 새 카테고리 추가
                    onAddCategory(newCat);
                  }}
                />
                
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
                <VideoUploader
                  value={project.video || ''}
                  onChange={(url) => onChange({ ...project, video: url })}
                  label="영상 URL 또는 파일 업로드 (선택사항)"
                  placeholder="YouTube, Vimeo, 비디오 파일 URL 또는 파일 업로드"
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
                      <span className="text-sm font-semibold text-white">
                        {img.type === 'video' ? '영상' : '이미지'} {i + 1}
                      </span>
                      <button onClick={() => removeGalleryImage(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    
                    {/* 타입 선택 */}
                    <div>
                      <label className="block text-sm text-[--text-secondary] mb-1">타입</label>
                      <select
                        value={img.type || 'image'}
                        onChange={(e) => updateGalleryImage(i, 'type', e.target.value as 'image' | 'video')}
                        className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                      >
                        <option value="image">이미지</option>
                        <option value="video">영상</option>
                      </select>
                    </div>

                    {/* 이미지인 경우: 썸네일 이미지 */}
                    {(!img.type || img.type === 'image') && (
                      <ImageUploader
                        value={img.src}
                        onChange={(url) => updateGalleryImage(i, 'src', url)}
                        placeholder="갤러리 이미지 URL"
                      />
                    )}

                    {/* 영상인 경우: 썸네일과 영상 URL */}
                    {img.type === 'video' && (
                      <>
                        <div>
                          <label className="block text-sm text-[--text-secondary] mb-1">썸네일 이미지 URL (선택사항)</label>
                          <input
                            type="url"
                            value={img.src || ''}
                            onChange={(e) => updateGalleryImage(i, 'src', e.target.value)}
                            placeholder="영상 썸네일 이미지 URL"
                            className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                          />
                        </div>
                        <VideoUploader
                          value={img.videoUrl || ''}
                          onChange={(url) => updateGalleryImage(i, 'videoUrl', url)}
                          label="영상 URL 또는 파일 업로드"
                          placeholder="YouTube, Vimeo, 비디오 파일 URL 또는 파일 업로드"
                        />
                      </>
                    )}

                    {/* 캡션 */}
                    <div className="grid md:grid-cols-2 gap-2">
                      <input type="text" value={img.caption_ko} onChange={(e) => updateGalleryImage(i, 'caption_ko', e.target.value)} placeholder="캡션 (한글)" className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                      <input type="text" value={img.caption_en} onChange={(e) => updateGalleryImage(i, 'caption_en', e.target.value)} placeholder="Caption (English) ← 자동번역" className="w-full px-4 py-2 rounded-lg bg-[--bg-primary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]" />
                    </div>
                  </div>
                ))}
                <button onClick={addGalleryImage} className="w-full py-3 rounded-lg border-2 border-dashed border-[--border-color] text-[--text-secondary] hover:border-[--accent-color] hover:text-[--accent-color] flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> 이미지/영상 추가
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex gap-3 p-6 border-t border-[--border-color]">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary]">취소</button>
          <button 
            onClick={onSave} 
            disabled={saving || translating}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
