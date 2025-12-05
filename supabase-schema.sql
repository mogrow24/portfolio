-- =====================================================
-- 윤지희 포트폴리오 웹사이트 - Supabase 데이터베이스 스키마
-- =====================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 프로필 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ko VARCHAR(100) NOT NULL DEFAULT '윤지희',
  name_en VARCHAR(100) NOT NULL DEFAULT 'Jihee Yoon',
  title_ko VARCHAR(200) NOT NULL DEFAULT 'PM · 서비스 콘텐츠 기획자',
  title_en VARCHAR(200) NOT NULL DEFAULT 'PM · Service Content Planner',
  bio_ko TEXT,
  bio_en TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin VARCHAR(255),
  github VARCHAR(255),
  profile_image VARCHAR(500),
  resume_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. 프로젝트 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ko VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  description_ko TEXT NOT NULL,
  description_en TEXT NOT NULL,
  role_ko VARCHAR(200),
  role_en VARCHAR(200),
  period VARCHAR(100),
  thumbnail VARCHAR(500),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  link VARCHAR(500),
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. 스킬 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_ko VARCHAR(100) NOT NULL,
  category_en VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  level INTEGER CHECK (level >= 1 AND level <= 5) DEFAULT 3,
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. 경력 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_ko VARCHAR(200) NOT NULL,
  company_en VARCHAR(200) NOT NULL,
  position_ko VARCHAR(200) NOT NULL,
  position_en VARCHAR(200) NOT NULL,
  description_ko TEXT,
  description_en TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. 사이트 설정 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title_ko TEXT DEFAULT '안녕하세요',
  hero_title_en TEXT DEFAULT 'Hello',
  hero_subtitle_ko TEXT DEFAULT '사용자 경험을 중심으로 생각하고, 데이터 기반의 의사결정으로 서비스를 성장시킵니다.',
  hero_subtitle_en TEXT DEFAULT 'I think user experience-first and grow services through data-driven decisions.',
  about_title_ko TEXT DEFAULT '저를 소개합니다',
  about_title_en TEXT DEFAULT 'About Me',
  contact_cta_ko TEXT DEFAULT '연락하기',
  contact_cta_en TEXT DEFAULT 'Contact Me',
  meta_description_ko TEXT,
  meta_description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 인덱스 생성
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_visible ON projects(is_visible);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);
CREATE INDEX IF NOT EXISTS idx_experiences_order ON experiences(order_index);
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills(order_index);

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

-- 프로필 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can update profiles"
  ON profiles FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 프로젝트 테이블 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_visible = true OR auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update projects"
  ON projects FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete projects"
  ON projects FOR DELETE
  USING (auth.role() = 'authenticated');

-- 스킬 테이블 RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can manage skills"
  ON skills FOR ALL
  USING (auth.role() = 'authenticated');

-- 경력 테이블 RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences are viewable by everyone"
  ON experiences FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can manage experiences"
  ON experiences FOR ALL
  USING (auth.role() = 'authenticated');

-- 사이트 설정 테이블 RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can update site settings"
  ON site_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 초기 데이터 삽입
-- =====================================================

-- 프로필 초기 데이터
INSERT INTO profiles (name_ko, name_en, title_ko, title_en, bio_ko, bio_en, email)
VALUES (
  '윤지희',
  'Jihee Yoon',
  'PM · 서비스 콘텐츠 기획자',
  'PM · Service Content Planner',
  '사용자의 니즈를 파악하고 비즈니스 목표와 조화시키는 것에 열정을 가진 기획자입니다. 복잡한 문제를 단순하게 풀어내고, 팀과의 원활한 커뮤니케이션을 통해 프로젝트를 성공적으로 이끌어갑니다.',
  'A passionate planner who identifies user needs and harmonizes them with business objectives. I simplify complex problems and lead projects to success through smooth communication with teams.',
  'jihee7772@naver.com'
) ON CONFLICT DO NOTHING;

-- 사이트 설정 초기 데이터
INSERT INTO site_settings (hero_title_ko, hero_title_en)
VALUES (
  '안녕하세요',
  'Hello'
) ON CONFLICT DO NOTHING;

-- 샘플 프로젝트 데이터
INSERT INTO projects (title_ko, title_en, description_ko, description_en, role_ko, role_en, period, tags, order_index)
VALUES 
(
  '모바일 커머스 앱 리뉴얼',
  'Mobile Commerce App Renewal',
  '사용자 경험 개선을 통한 전환율 30% 향상 프로젝트. 사용자 리서치부터 와이어프레임 설계, 개발팀 협업까지 전 과정을 리드했습니다.',
  'A project that improved conversion rate by 30% through UX enhancement. Led the entire process from user research to wireframe design and development team collaboration.',
  'PM / 서비스 기획',
  'PM / Service Planning',
  '2024.01 - 2024.06',
  ARRAY['UX 개선', '전환율 최적화', 'A/B 테스트'],
  1
),
(
  '콘텐츠 큐레이션 플랫폼',
  'Content Curation Platform',
  '개인화 추천 알고리즘 기반의 콘텐츠 플랫폼 기획. 사용자 행동 데이터 분석을 통한 맞춤형 콘텐츠 추천 시스템을 설계했습니다.',
  'Planning a content platform based on personalized recommendation algorithms. Designed a customized content recommendation system through user behavior data analysis.',
  '콘텐츠 기획 / 데이터 분석',
  'Content Planning / Data Analysis',
  '2023.07 - 2023.12',
  ARRAY['개인화', '추천 시스템', '데이터 분석'],
  2
),
(
  'B2B SaaS 대시보드',
  'B2B SaaS Dashboard',
  '기업 고객을 위한 데이터 시각화 대시보드 기획. 복잡한 데이터를 직관적으로 이해할 수 있는 UI/UX를 설계했습니다.',
  'Planning a data visualization dashboard for enterprise customers. Designed UI/UX that allows intuitive understanding of complex data.',
  'PM / UX 기획',
  'PM / UX Planning',
  '2023.01 - 2023.06',
  ARRAY['B2B', 'Dashboard', 'Data Visualization'],
  3
);

-- 샘플 경력 데이터
INSERT INTO experiences (company_ko, company_en, position_ko, position_en, description_ko, description_en, start_date, end_date, is_current, order_index)
VALUES 
(
  '테크 스타트업 A',
  'Tech Startup A',
  'Product Manager',
  'Product Manager',
  '모바일 앱 서비스 기획 및 운영, 사용자 리서치 수행, 데이터 기반 서비스 개선, 유관 부서 협업 리드',
  'Mobile app service planning and operation, user research, data-driven service improvement, cross-functional collaboration',
  '2023-01-01',
  NULL,
  true,
  1
),
(
  '디지털 에이전시 B',
  'Digital Agency B',
  '서비스 기획자',
  'Service Planner',
  '다양한 클라이언트의 웹/앱 서비스 기획, 와이어프레임 및 프로토타입 제작, 기능 정의서 작성',
  'Web/app service planning for various clients, wireframe and prototype creation, functional specification documentation',
  '2021-03-01',
  '2022-12-31',
  false,
  2
),
(
  '콘텐츠 플랫폼 C',
  'Content Platform C',
  '콘텐츠 기획자',
  'Content Planner',
  '콘텐츠 전략 수립 및 기획, 에디터/크리에이터 관리, 콘텐츠 성과 분석 및 개선',
  'Content strategy development and planning, editor/creator management, content performance analysis and improvement',
  '2019-06-01',
  '2021-02-28',
  false,
  3
);

-- 샘플 스킬 데이터
INSERT INTO skills (category_ko, category_en, name, level, order_index)
VALUES 
('기획 도구', 'Planning Tools', 'Figma', 5, 1),
('기획 도구', 'Planning Tools', 'Notion', 5, 2),
('기획 도구', 'Planning Tools', 'Jira', 4, 3),
('데이터 분석', 'Data Analysis', 'Google Analytics', 4, 4),
('데이터 분석', 'Data Analysis', 'SQL', 3, 5),
('데이터 분석', 'Data Analysis', 'Excel/Sheets', 5, 6),
('협업', 'Collaboration', 'Slack', 5, 7),
('협업', 'Collaboration', 'Confluence', 4, 8);

-- =====================================================
-- 6. 게스트북(Q&A) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS guestbook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255),
  message TEXT NOT NULL,
  message_en TEXT,
  allow_notification BOOLEAN DEFAULT false,
  is_secret BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  reply TEXT,
  reply_en TEXT,
  reply_at TIMESTAMP WITH TIME ZONE,
  is_reply_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게스트북 인덱스
CREATE INDEX IF NOT EXISTS idx_guestbook_created ON guestbook(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_read ON guestbook(is_read);

-- 게스트북 RLS
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- 누구나 질문 등록 가능
CREATE POLICY "Anyone can insert guestbook"
  ON guestbook FOR INSERT
  WITH CHECK (true);

-- 공개 질문은 누구나 조회, 비밀글은 인증된 사용자만
CREATE POLICY "Public or authenticated can view guestbook"
  ON guestbook FOR SELECT
  USING (is_secret = false OR auth.role() = 'authenticated');

-- 인증된 사용자만 수정/삭제 가능
CREATE POLICY "Only authenticated users can update guestbook"
  ON guestbook FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete guestbook"
  ON guestbook FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. 방문자 카운트 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS visitor_count (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 방문자 카운트 데이터
INSERT INTO visitor_count (id, count) 
VALUES ('global', 0) 
ON CONFLICT (id) DO NOTHING;

-- 방문자 카운트 RLS
ALTER TABLE visitor_count ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능
CREATE POLICY "Anyone can view visitor count"
  ON visitor_count FOR SELECT
  USING (true);

-- 누구나 업데이트 가능 (카운트 증가용)
CREATE POLICY "Anyone can update visitor count"
  ON visitor_count FOR UPDATE
  USING (true);

-- 방문자 수 원자적 증가를 위한 RPC 함수
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE visitor_count 
  SET count = count + 1, updated_at = NOW()
  WHERE id = 'global'
  RETURNING count INTO new_count;
  
  IF new_count IS NULL THEN
    INSERT INTO visitor_count (id, count) VALUES ('global', 1)
    RETURNING count INTO new_count;
  END IF;
  
  RETURN new_count;
END;
$$;


