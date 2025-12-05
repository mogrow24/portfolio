// 어드민 관리용 타입 정의

// 갤러리 이미지 타입
export interface GalleryImage {
  src: string;
  caption_ko: string;
  caption_en: string;
}

// 프로젝트 상세 설명 타입
export interface ProjectDescription {
  project_ko: string;
  project_en: string;
  role_ko: string[];
  role_en: string[];
  problem_ko: string;
  problem_en: string;
  solution_ko: string;
  solution_en: string;
  outcome_ko: string[];
  outcome_en: string[];
}

// 로컬 프로젝트 전체 타입
export interface LocalProject {
  id: string;
  title_ko: string;
  title_en: string;
  tags: string[];
  stat_ko: string;
  stat_en: string;
  thumb: string;
  period: string;
  team_ko: string;
  team_en: string;
  desc: ProjectDescription;
  gallery: GalleryImage[];
  is_visible: boolean;
  order_index: number;
}

// 프로필 타입
export interface LocalProfile {
  id: string;
  name_ko: string;
  name_en: string;
  title_ko: string;
  title_en: string;
  bio_ko: string;
  bio_en: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  profile_image: string;
}

// 경력 타입
export interface LocalExperience {
  id: string;
  company_ko: string;
  company_en: string;
  position_ko: string;
  position_en: string;
  description_ko: string;
  description_en: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  order_index: number;
}

// 사이트 설정 타입
export interface LocalSiteSettings {
  hero_title_ko: string;
  hero_title_en: string;
  hero_subtitle_ko: string;
  hero_subtitle_en: string;
  about_description_ko: string;
  about_description_en: string;
  contact_email: string;
  social_linkedin: string;
  social_github: string;
}

// 탭 타입
export type TabType = 'projects' | 'profile' | 'experience' | 'settings';


