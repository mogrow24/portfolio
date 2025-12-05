/**
 * 하이브리드 데이터 관리 시스템
 * Supabase 연결이 가능하면 Supabase를 사용하고,
 * 그렇지 않으면 로컬 스토리지를 폴백으로 사용합니다.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LocalProject, LocalProfile, LocalExperience, LocalSiteSettings, GalleryImage } from '@/types/admin';
import { initialProjects, initialProfile, initialExperiences, initialSiteSettings } from '@/data/initialData';

// Supabase 클라이언트 (환경 변수가 있을 때만 생성)
let supabase: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Supabase 연결 여부 확인
export const isSupabaseConnected = (): boolean => {
  return supabase !== null;
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
  projects: 'admin_projects',
  profile: 'admin_profile',
  experiences: 'admin_experiences',
  settings: 'admin_settings',
};

// ==================== 프로젝트 API ====================

export const projectsApi = {
  // 모든 프로젝트 가져오기
  async getAll(includeHidden = false): Promise<LocalProject[]> {
    if (supabase) {
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (!includeHidden) {
          query = query.eq('is_visible', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return initialProjects;
    
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    if (saved) {
      const projects = JSON.parse(saved) as LocalProject[];
      return includeHidden ? projects : projects.filter(p => p.is_visible);
    }
    
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(initialProjects));
    return includeHidden ? initialProjects : initialProjects.filter(p => p.is_visible);
  },

  // 프로젝트 저장
  async save(project: LocalProject): Promise<LocalProject | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .upsert({
            ...project,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    const projects: LocalProject[] = saved ? JSON.parse(saved) : [];
    
    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    return project;
  },

  // 프로젝트 삭제
  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return false;
    
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    if (saved) {
      const projects: LocalProject[] = JSON.parse(saved);
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(filtered));
    }
    return true;
  },

  // 순서 업데이트
  async updateOrder(projectIds: string[]): Promise<boolean> {
    if (supabase) {
      try {
        const updates = projectIds.map((id, index) => ({
          id,
          order_index: index + 1,
          updated_at: new Date().toISOString(),
        }));
        
        for (const update of updates) {
          const { error } = await supabase
            .from('projects')
            .update({ order_index: update.order_index, updated_at: update.updated_at })
            .eq('id', update.id);
          
          if (error) throw error;
        }
        return true;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return false;
    
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    if (saved) {
      const projects: LocalProject[] = JSON.parse(saved);
      const reordered = projectIds.map((id, index) => {
        const project = projects.find(p => p.id === id);
        return project ? { ...project, order_index: index + 1 } : null;
      }).filter(Boolean) as LocalProject[];
      
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(reordered));
    }
    return true;
  },

  // 전체 프로젝트 저장 (로컬 스토리지용)
  async saveAll(projects: LocalProject[]): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    return true;
  },
};

// ==================== 프로필 API ====================

export const profileApi = {
  async get(): Promise<LocalProfile> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return initialProfile;
    
    const saved = localStorage.getItem(STORAGE_KEYS.profile);
    return saved ? JSON.parse(saved) : initialProfile;
  },

  async save(profile: LocalProfile): Promise<LocalProfile | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            ...profile,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return null;
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    return profile;
  },
};

// ==================== 경력 API ====================

export const experiencesApi = {
  async getAll(): Promise<LocalExperience[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return initialExperiences;
    
    const saved = localStorage.getItem(STORAGE_KEYS.experiences);
    return saved ? JSON.parse(saved) : initialExperiences;
  },

  async save(experience: LocalExperience): Promise<LocalExperience | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .upsert({
            ...experience,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem(STORAGE_KEYS.experiences);
    const experiences: LocalExperience[] = saved ? JSON.parse(saved) : [];
    
    const existingIndex = experiences.findIndex(e => e.id === experience.id);
    if (existingIndex >= 0) {
      experiences[existingIndex] = experience;
    } else {
      experiences.push(experience);
    }
    
    localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(experiences));
    return experience;
  },

  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('experiences')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return false;
    
    const saved = localStorage.getItem(STORAGE_KEYS.experiences);
    if (saved) {
      const experiences: LocalExperience[] = JSON.parse(saved);
      const filtered = experiences.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(filtered));
    }
    return true;
  },

  async saveAll(experiences: LocalExperience[]): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(experiences));
    return true;
  },
};

// ==================== 설정 API ====================

export const settingsApi = {
  async get(): Promise<LocalSiteSettings> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return initialSiteSettings;
    
    const saved = localStorage.getItem(STORAGE_KEYS.settings);
    return saved ? JSON.parse(saved) : initialSiteSettings;
  },

  async save(settings: LocalSiteSettings): Promise<LocalSiteSettings | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .upsert({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase error, falling back to localStorage:', err);
      }
    }
    
    // 로컬 스토리지 폴백
    if (typeof window === 'undefined') return null;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    return settings;
  },
};

// ==================== 이미지 업로드 API ====================

export const imageApi = {
  // 이미지 업로드
  async upload(file: File, folder: string = 'projects'): Promise<string | null> {
    // Supabase Storage 사용
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });
        
        if (error) throw error;
        
        const { data } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);
        
        return data.publicUrl;
      } catch (err) {
        console.error('Supabase Storage error:', err);
      }
    }
    
    // 폴백: 파일을 Base64로 변환하여 로컬 스토리지에 저장
    // 주의: 큰 파일은 로컬 스토리지 용량을 초과할 수 있음
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.error('File reading error');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  },

  // 이미지 삭제
  async delete(url: string): Promise<boolean> {
    if (supabase && url.includes('supabase')) {
      try {
        const fileName = url.split('/portfolio-images/')[1];
        if (!fileName) return false;
        
        const { error } = await supabase.storage
          .from('portfolio-images')
          .remove([fileName]);
        
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase Storage error:', err);
      }
    }
    
    // Base64 이미지는 별도 삭제 불필요
    return true;
  },

  // 이미지 유효성 검사
  isValidImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: '지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WEBP만 지원)' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: '파일 크기가 5MB를 초과합니다.' };
    }
    
    return { valid: true };
  },
};


