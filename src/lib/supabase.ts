import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 클라이언트 사이드용 Supabase 클라이언트
// 환경 변수가 있을 때만 생성 (없으면 null)
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase 클라이언트 생성 실패:', error);
  }
}

// Supabase 클라이언트 export (null일 수 있음)
export const supabase = supabaseInstance;

// Supabase 연결 여부 확인 함수
export const isSupabaseAvailable = (): boolean => {
  return supabaseInstance !== null;
};

// 데이터베이스 타입 정의
export interface Profile {
  id: string;
  name_ko: string;
  name_en: string;
  title_ko: string;
  title_en: string;
  bio_ko: string;
  bio_en: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  profile_image?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title_ko: string;
  title_en: string;
  description_ko: string;
  description_en: string;
  role_ko: string;
  role_en: string;
  period: string;
  thumbnail?: string;
  images: string[];
  tags: string[];
  link?: string;
  is_visible: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  category_ko: string;
  category_en: string;
  name: string;
  level: number; // 1-5
  icon?: string;
  order_index: number;
}

export interface Experience {
  id: string;
  company_ko: string;
  company_en: string;
  position_ko: string;
  position_en: string;
  description_ko: string;
  description_en: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  order_index: number;
}

export interface SiteSettings {
  id: string;
  hero_title_ko: string;
  hero_title_en: string;
  hero_subtitle_ko: string;
  hero_subtitle_en: string;
  about_title_ko: string;
  about_title_en: string;
  contact_cta_ko: string;
  contact_cta_en: string;
  meta_description_ko: string;
  meta_description_en: string;
}

// 게스트북 타입 (Supabase 스네이크 케이스)
export interface GuestbookDB {
  id: string;
  name: string;
  company?: string;
  email?: string;
  message: string;
  message_en?: string;
  allow_notification: boolean;
  is_secret: boolean;
  is_read: boolean;
  reply?: string;
  reply_en?: string;
  reply_at?: string;
  is_reply_locked: boolean;
  created_at: string;
  updated_at: string;
}

// API 함수들
export const api = {
  // 프로필 관련
  async getProfile(): Promise<Profile | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    return data;
  },

  // 프로젝트 관련
  async getProjects(includeHidden = false): Promise<Project[]> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return [];
    }
    
    let query = supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!includeHidden) {
      query = query.eq('is_visible', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data || [];
  },

  async getProject(id: string): Promise<Project | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }
    return data;
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    return data;
  },

  async updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update({ ...project, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    return data;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return false;
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    return true;
  },

  async toggleProjectVisibility(id: string, isVisible: boolean): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return false;
    }
    
    const { error } = await supabase
      .from('projects')
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error toggling project visibility:', error);
      return false;
    }
    return true;
  },

  // 스킬 관련
  async getSkills(): Promise<Skill[]> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
    return data || [];
  },

  // 경력 관련
  async getExperiences(): Promise<Experience[]> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching experiences:', error);
      return [];
    }
    return data || [];
  },

  // 사이트 설정
  async getSiteSettings(): Promise<SiteSettings | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }
    return data;
  },

  // 이미지 업로드
  async uploadImage(file: File, bucket: string = 'portfolio-images'): Promise<string | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  },

  // 이미지 삭제
  async deleteImage(url: string, bucket: string = 'portfolio-images'): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return false;
    }
    
    const fileName = url.split('/').pop();
    if (!fileName) return false;
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    return true;
  },

  // 게스트북 관련
  async getGuestbook(): Promise<GuestbookDB[]> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching guestbook:', error);
      return [];
    }
    return data || [];
  },

  async createGuestbookMessage(message: Omit<GuestbookDB, 'id' | 'created_at' | 'updated_at' | 'is_read' | 'reply' | 'reply_en' | 'reply_at' | 'is_reply_locked'>): Promise<GuestbookDB | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('guestbook')
      .insert({
        ...message,
        is_read: false,
        is_reply_locked: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating guestbook message:', error);
      return null;
    }
    return data;
  },

  async updateGuestbookMessage(id: string, updates: Partial<GuestbookDB>): Promise<GuestbookDB | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('guestbook')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating guestbook message:', error);
      return null;
    }
    return data;
  },

  async deleteGuestbookMessage(id: string): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return false;
    }
    
    const { error } = await supabase
      .from('guestbook')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting guestbook message:', error);
      return false;
    }
    return true;
  },

  async addReplyToGuestbook(id: string, reply: string, reply_en?: string, is_reply_locked: boolean = false): Promise<GuestbookDB | null> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('guestbook')
      .update({
        reply,
        reply_en,
        reply_at: new Date().toISOString(),
        is_reply_locked,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding reply:', error);
      return null;
    }
    return data;
  },

  async markGuestbookAsRead(id: string): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return false;
    }
    
    const { error } = await supabase
      .from('guestbook')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking as read:', error);
      return false;
    }
    return true;
  },

  // 방문자 카운트 관련
  async getVisitorCount(): Promise<number> {
    if (!supabase) {
      return 0;
    }
    
    const { data, error } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 'global')
      .single();
    
    if (error) {
      console.error('Error fetching visitor count:', error);
      return 0;
    }
    return data?.count || 0;
  },

  async incrementVisitorCount(): Promise<number> {
    if (!supabase) {
      return 0;
    }
    
    // RPC 함수로 원자적 증가 (동시 접속 문제 해결)
    const { data, error } = await supabase.rpc('increment_visitor_count');
    
    if (error) {
      console.error('Error incrementing visitor count:', error);
      // RPC 실패 시 직접 업데이트 시도
      const { data: currentData } = await supabase
        .from('visitor_count')
        .select('count')
        .eq('id', 'global')
        .single();
      
      const newCount = (currentData?.count || 0) + 1;
      await supabase
        .from('visitor_count')
        .upsert({ id: 'global', count: newCount });
      
      return newCount;
    }
    return data || 0;
  },
};

// 인증 관련
export const auth = {
  async signIn(email: string, password: string) {
    if (!supabase) {
      console.warn('Supabase가 설정되지 않았습니다.');
      return null;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return null;
    }
    return data;
  },

  async signOut() {
    if (!supabase) {
      return false;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    return true;
  },

  async getSession() {
    if (!supabase) {
      return null;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      return { data: { subscription: null }, unsubscribe: () => {} };
    }
    
    return supabase.auth.onAuthStateChange(callback);
  },
};

