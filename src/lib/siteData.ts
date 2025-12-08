// 사이트 콘텐츠 데이터 스토어
// Supabase + 로컬 스토리지 하이브리드 방식으로 모든 사이트 콘텐츠를 중앙 관리

import { supabase, isSupabaseAvailable } from './supabase';

// ===== 타입 정의 =====

// 프로필 정보
export interface ProfileData {
  name_ko: string;
  name_en: string;
  phone: string;
  email: string;
  photo_url: string;
  subtitle_ko: string;
  subtitle_en: string;
  title1_ko: string;
  title1_en: string;
  title2_ko: string;
  title2_en: string;
  desc_ko: string;
  desc_en: string;
  quote_ko: string;
  quote_en: string;
  skills: string[];
}

// 역량 정보
export interface CompetencyData {
  id: string;
  icon: string; // 아이콘 이름
  title: string;
  subtitle_ko: string;
  subtitle_en: string;
  desc_ko: string;
  desc_en: string;
}

// 경력 정보
export interface ExperienceData {
  id: string;
  company_ko: string;
  company_en: string;
  position_ko: string;
  position_en: string;
  period: string;
  highlights_ko: string[];
  highlights_en: string[];
  order_index: number; // 정렬 순서 (낮을수록 상단)
}

// 프로젝트 갤러리 이미지
export interface GalleryImage {
  src: string;
  caption_ko: string;
  caption_en: string;
}

// 프로젝트 카테고리 타입
export type ProjectCategory = string; // 동적으로 관리되는 카테고리

// 카테고리 데이터 타입
export interface CategoryData {
  id: string;
  key: string; // 고유 키 (영문, 언더스코어)
  label_ko: string;
  label_en: string;
  icon: string; // 아이콘 이름 (lucide)
  order_index: number;
}

// 프로젝트 정보
export interface ProjectData {
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
  gallery: GalleryImage[];
  is_visible: boolean;
  order_index: number;
  category: ProjectCategory; // 카테고리: 전시, 웹/앱, 제안서
}

// 연락처 정보
export interface ContactData {
  title_ko: string;
  title_en: string;
  desc_ko: string;
  desc_en: string;
  cta_ko: string;
  cta_en: string;
}

// 인터뷰 Q&A
export interface InterviewData {
  id: string;
  question_ko: string;
  question_en: string;
  answer_ko: string;
  answer_en: string;
  order_index: number;
}

// 게스트 메시지
export interface GuestMessage {
  id: string;
  name: string;
  company?: string;  // 회사명
  email?: string;
  message: string;  // 원본 메시지 (한글)
  message_en?: string;  // 영문 번역 메시지
  allowNotification: boolean;
  isSecret: boolean;  // 비밀글 여부 (관리자만 볼 수 있음)
  createdAt: string;
  isRead: boolean;
  reply?: string;
  reply_en?: string;  // 영문 번역 답변
  replyAt?: string;
  isReplyLocked: boolean;
}

// 번역 유틸리티 함수 (MyMemory API 사용 - 무료)
export async function translateText(text: string, from: 'ko' | 'en', to: 'ko' | 'en'): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return text; // 실패시 원본 반환
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 에러시 원본 반환
  }
}

// ===== 기본 데이터 =====

export const DEFAULT_PROFILE: ProfileData = {
  name_ko: '윤지희',
  name_en: 'YUN JIHEE',
  phone: '010.5503.7807',
  email: 'jihee7772@naver.com',
  photo_url: '',
  subtitle_ko: 'Project Manager Portfolio',
  subtitle_en: 'Project Manager Portfolio',
  title1_ko: '방향을 제시하고,',
  title1_en: 'I Set Direction,',
  title2_ko: '끝까지 완수합니다.',
  title2_en: 'Deliver Results.',
  desc_ko: '사용자 흐름을 구조화하고, 실행 가능한 전략으로 연결하는 4년차 실무형 PM입니다.\n팀에 명확한 방향성을 제안하여 헤매지 않고, 일정 내에 움직일 수 있게 만듭니다.\n복잡한 문제를 함께 정리해주고 마감까지 끌고 가는 것이 저의 역할입니다.',
  desc_en: "A 4th-year practical PM who structures user flows and connects them to executable strategies.\nI provide clear direction to teams so they don't wander and can move within schedule.\nMy role is to organize complex problems together and carry them through to completion.",
  quote_ko: '"대체 불가한 인재가 되기 위해 매순간 지식과 실무능력을 축적하고 발산합니다."',
  quote_en: '"I accumulate and express knowledge and practical skills every moment to become an irreplaceable talent."',
  skills: ['Notion', 'Figma', 'Jira', 'Office 365', 'Slack', 'Adobe XD', 'Photoshop'],
};

export const DEFAULT_COMPETENCIES: CompetencyData[] = [
  {
    id: 'comp-1',
    icon: 'Target',
    title: 'Structure Master',
    subtitle_ko: '#구조적 기획력 #정리의 신',
    subtitle_en: '#Structural Planning #Organization Pro',
    desc_ko: '정보를 목적 및 목표와 연결하여 조사, 정리하고 실행 가능한 구조로 재구성합니다. 기획안의 기준을 잡아 커뮤니케이션 비용을 줄입니다.',
    desc_en: 'I research and organize information by connecting it to purposes and goals, reconstructing it into executable structures. I set standards for planning documents to reduce communication costs.',
  },
  {
    id: 'comp-2',
    icon: 'Zap',
    title: 'Fast Learner',
    subtitle_ko: '#학습력 #실무 적용',
    subtitle_en: '#Quick Learning #Practical Application',
    desc_ko: '낯선 영역도 빠르게 파악하고 실무에 적용하는 힘이 있습니다. Notion, Figma 등 새로운 툴을 빠르게 습득하여 내재화합니다.',
    desc_en: 'I have the ability to quickly understand unfamiliar areas and apply them to practice. I rapidly acquire and internalize new tools like Notion and Figma.',
  },
  {
    id: 'comp-3',
    icon: 'MessageCircle',
    title: 'Communication',
    subtitle_ko: '#소통의 신 #협업 중심',
    subtitle_en: '#Communication Pro #Collaboration Focus',
    desc_ko: '팀 간 이해관계를 조율하고 이슈를 해결합니다. 내부 팀원뿐 아니라 외주/클라이언트와 최고의 파트너십을 만듭니다.',
    desc_en: 'I coordinate interests between teams and resolve issues. I create the best partnerships not only with internal team members but also with outsourcing partners and clients.',
  },
  {
    id: 'comp-4',
    icon: 'Crosshair',
    title: 'Execution Power',
    subtitle_ko: '#추진력 #마감 준수',
    subtitle_en: '#Drive #Deadline Compliance',
    desc_ko: '기획부터 현장 감리까지 책임집니다. 변수가 생겨도 빠르게 대응하며 납기 준수와 성과 중심의 결과를 도출합니다.',
    desc_en: 'I take responsibility from planning to on-site supervision. Even when variables arise, I respond quickly and deliver deadline-compliant, results-oriented outcomes.',
  },
];

export const DEFAULT_EXPERIENCES: ExperienceData[] = [
  {
    id: 'exp-1',
    company_ko: '알마로꼬',
    company_en: 'Almarocco',
    position_ko: '플래닝팀 / 주임',
    position_en: 'Planning Team / Senior Staff',
    period: '2022.01 ~ 2025.05',
    highlights_ko: [
      '현대차, 과학관, 미술관 등 전시&디지털 프로젝트의 콘텐츠 및 UX 설계 총괄',
      '나라장터 제안서 작성 및 전략 수립, 12개월간 26건 이상 제안서 기획 (입찰금액 약 40억원 이상)',
      '연 매출 수십억 규모 프로젝트 총괄 운영',
      '슬릭 브랜드 전시 및 연계 어플리케이션 기획, 개인화 콘텐츠 구성',
    ],
    highlights_en: [
      'Led content and UX design for exhibition & digital projects including Hyundai Motor, science museums, and art museums',
      'Wrote government procurement proposals and developed strategies, planned 26+ proposals over 12 months (bid amount over 4 billion KRW)',
      'Managed projects worth tens of billions in annual revenue',
      'Planned SLICK brand exhibitions and linked applications, composed personalized content',
    ],
    order_index: 0,
  },
  {
    id: 'exp-2',
    company_ko: '루트사고력코딩학원',
    company_en: 'Root Coding Academy',
    position_ko: '교사',
    position_en: 'Instructor',
    period: '2022.01 ~ 2023.05',
    highlights_ko: [
      '파이썬 기초반 및 엔트리 자격증반 커리큘럼 구성 및 수업 진행',
      '학습 진도 체크, 개별 피드백 제공, 학부모 상담을 통한 학습 성과 공유',
      '정기적인 성취도 평가, 수업 일정 및 교재 준비 관리',
    ],
    highlights_en: [
      'Composed curricula and conducted classes for Python beginner and Entry certification courses',
      'Checked learning progress, provided individual feedback, shared learning outcomes through parent consultations',
      'Managed regular achievement assessments, class schedules, and textbook preparation',
    ],
    order_index: 1,
  },
];

export const DEFAULT_PROJECTS: ProjectData[] = [
  {
    id: 'proj-1',
    title_ko: '현대 IONIQ6 웹앱 글로벌 캠페인',
    title_en: 'Hyundai IONIQ6 Global Web/App Campaign',
    tags: ['Global Marketing', 'Web/App', 'AR/VR'],
    stat_ko: '사전 계약 47,000여 대 달성',
    stat_en: '47,000+ Pre-orders Achieved',
    thumb: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
    period: '2022.02 ~ 2022.08',
    team_ko: '내부 10명 (기획 4, 디자인 3, 공간 3)',
    team_en: '10 members (4 planners, 3 designers, 3 spatial)',
    project_ko: '4개국(아시아/북미/유럽 등)을 대상으로 IONIQ 6 출시에 맞춰 차량 USP를 AR/VR 콘텐츠로 경험하는 체험형 웹/앱 사이트입니다.',
    project_en: 'An experiential web/app site for 4 countries (Asia/North America/Europe) to experience vehicle USP through AR/VR content for IONIQ 6 launch.',
    role_ko: [
      '기획 100%, 외주 소통 80%, 클라이언트 소통 80% 주도',
      '80개 차량 기능 항목 직접 정리 및 콘텐츠화 기준 정의',
      '유저 플로우 및 화면 인터페이스 구조 설계, 화면설계서 버전 관리',
      '4개국 언어 대응 및 글로벌 런칭 QA 진행',
    ],
    role_en: [
      'Led 100% planning, 80% outsourcing communication, 80% client communication',
      'Organized 80 vehicle feature items and defined content criteria',
      'Designed user flow and screen interface structure, managed wireframe versions',
      'Supported 4 languages and conducted global launch QA',
    ],
    problem_ko: '외주 개발사 중도 이탈 가능성 및 2개월간 내부 개발 인력 미투입 상황',
    problem_en: 'Risk of outsourcing developer withdrawal and 2 months without internal development resources',
    solution_ko: '지속적인 외주사 소통으로 이탈 방지, 80여 개 기능 항목 직접 정리 후 전 팀 공유하여 개발 가속화.',
    solution_en: 'Prevented withdrawal through continuous communication, organized 80+ feature items and shared with all teams to accelerate development.',
    outcome_ko: [
      '정식 오픈 후 브랜드 홍보 성공, 아이오닉 6 브랜드 사전 계약 대수 47,000여 대 달성',
      '2022 iF 디자인 어워드 수상',
    ],
    outcome_en: [
      'Successful brand promotion after official launch, achieved 47,000+ IONIQ 6 pre-orders',
      '2022 iF Design Award Winner',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000', caption_ko: 'IONIQ 6 AR 기능 체험 화면', caption_en: 'IONIQ 6 AR Feature Experience Screen' },
      { src: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000', caption_ko: '360도 가상 스튜디오 체험', caption_en: '360° Virtual Studio Experience' },
    ],
    is_visible: true,
    order_index: 0,
    category: 'web_app',
  },
  {
    id: 'proj-2',
    title_ko: '울산현대자동차 기술교육원 전시',
    title_en: 'Ulsan Hyundai Motor Technical Training Center Exhibition',
    tags: ['Exhibition', 'Space Planning', 'UX/UI'],
    stat_ko: '전시관 체류시간 4배 증가',
    stat_en: '4x Increase in Dwell Time',
    thumb: 'https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d?q=80&w=1000&auto=format&fit=crop',
    period: '2023.07 ~ 2023.10',
    team_ko: '기획 및 총괄',
    team_en: 'Planning & Management',
    project_ko: '울산현대자동차 직원 및 교육생을 위한 전기차 기술 교육 및 체험 중심의 전시 콘텐츠 기획 프로젝트입니다.',
    project_en: 'Exhibition content planning project for EV technology education and experience for Ulsan Hyundai Motor employees and trainees.',
    role_ko: [
      '기획 100% / 총괄 100%',
      "'History-Current-Future' 서사 중심 3단 콘텐츠 구조 설계",
      '운영 매뉴얼, 유지보수 매뉴얼, 화면설계서, 결과보고서 등 산출물 표준화',
    ],
    role_en: [
      '100% Planning / 100% Management',
      "Designed 3-stage content structure based on 'History-Current-Future' narrative",
      'Standardized deliverables including operation manual, maintenance manual, wireframes, and reports',
    ],
    problem_ko: '기존 자료의 단편적 나열로 이해도 저하 및 콘텐츠 간 일관성 부족',
    problem_en: 'Decreased comprehension due to fragmented arrangement of existing materials and lack of consistency between contents',
    solution_ko: '서사 구조 설계를 통해 몰입도 강화. 초기 기획부터 회고까지 문서 템플릿화(운영 기준 정립)',
    solution_en: 'Enhanced immersion through narrative structure design. Templated documents from initial planning to retrospective (established operation standards)',
    outcome_ko: [
      '콘텐츠 총 8종 제작 및 설치 완료',
      '전시관 평균 체류시간 10분 → 40분 이상으로 4배 증가',
      "사내 타 부서 벤치마킹 대상이 되는 '운영 기준 프로젝트'로 평가",
    ],
    outcome_en: [
      'Completed production and installation of 8 types of content',
      'Average exhibition dwell time increased 4x from 10 min to 40+ min',
      "Evaluated as 'operation standard project' for benchmarking by other departments",
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000', caption_ko: '히스토리 월 및 전시관 전경', caption_en: 'History Wall and Exhibition Overview' },
    ],
    is_visible: true,
    order_index: 1,
    category: 'exhibition',
  },
  {
    id: 'proj-3',
    title_ko: "자체 전시 슬릭 라운지 & 스튜디오 (O2O App)",
    title_en: "SLICK Lounge & Studio Exhibition (O2O App)",
    tags: ['O2O Service', 'App Planning', 'AI'],
    stat_ko: '일 방문객 1,300명 달성',
    stat_en: '1,300 Daily Visitors',
    thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    period: '2023.06 ~ 2024.07',
    team_ko: '기획 80% / 총괄 90%',
    team_en: '80% Planning / 90% Management',
    project_ko: "롯데월드 내 자체 전시 '슬릭 스튜디오'와 연계된 어플리케이션 서비스 기획. '나르시시즘'을 주제로 AI 프로필 등 개인화 콘텐츠를 제공합니다.",
    project_en: "Application service planning linked with 'SLICK Studio' exhibition in Lotte World. Provides personalized content including AI profiles themed on 'Narcissism'.",
    role_ko: [
      '기획 80% / 총괄 90%',
      'AI 이미징 생성 및 QR 코드 기반 O2O 데이터 연동 설계',
      'Notion 기반 일정표, Figma 기반 산출물 관리로 협업 프로세스 구축',
    ],
    role_en: [
      '80% Planning / 90% Management',
      'Designed AI imaging generation and QR code-based O2O data integration',
      'Built collaboration process with Notion schedules and Figma deliverable management',
    ],
    problem_ko: '공간 시공은 완료되었으나 상세 콘텐츠 기획 부재, 온오프라인 연동 필요성 대두',
    problem_en: 'Space construction completed but lacking detailed content planning, need for online-offline integration emerged',
    solution_ko: '내부 10-12명 TFT 구성하여 콘텐츠 기획 주도. AI 키워드 생성 및 이미지 디스크립션 자동화 도입',
    solution_en: 'Led content planning with internal 10-12 member TFT. Introduced AI keyword generation and image description automation',
    outcome_ko: [
      '일 방문객 1,200~1,300명 달성 (기존 대비 증가)',
      'SNS 계정 팔로우 수 1일 만에 1,000명 증가',
      '유저 데이터 및 체험 데이터 웹앱 대비 30% 추가 확보',
    ],
    outcome_en: [
      'Achieved 1,200-1,300 daily visitors (increase from previous)',
      'SNS account followers increased by 1,000 in one day',
      'Secured 30% more user and experience data compared to web app',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000', caption_ko: 'AI 프로필 생성 앱 화면', caption_en: 'AI Profile Generation App Screen' },
      { src: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=1000', caption_ko: 'QR 코드 연동 체험', caption_en: 'QR Code Integration Experience' },
    ],
    is_visible: true,
    order_index: 2,
    category: 'exhibition',
  },
  {
    id: 'proj-4',
    title_ko: "자취생 커뮤니티 '하우스톡' (사이드 프로젝트)",
    title_en: "HouseStock - Community App (Side Project)",
    tags: ['Startup', 'Side Project', 'MVP'],
    stat_ko: 'MVP 완료 & 상표권 등록',
    stat_en: 'MVP Complete & Trademark',
    thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop',
    period: '2023.06 ~ Present',
    team_ko: '기획 100% / 사업 100%',
    team_en: '100% Planning / 100% Business',
    project_ko: '자취 초심자들을 위한 정보 탐색과 커뮤니티 기능을 통합한 모바일 애플리케이션 기획 프로젝트입니다.',
    project_en: 'Mobile application planning project integrating information search and community features for first-time renters.',
    role_ko: [
      '기획 100% / 사업 100% (참여율)',
      '350명 유저 설문조사 및 니즈 분석, 페르소나 정의',
      'MVP 기능 정의, 화면설계서, 기능 정의서 작성',
      '와디즈 펀딩 페이지 기획 및 상표권 등록 진행',
    ],
    role_en: [
      '100% Planning / 100% Business (participation rate)',
      'Conducted 350 user surveys and needs analysis, defined personas',
      'Defined MVP features, created wireframes and functional specifications',
      'Planned Wadiz funding page and processed trademark registration',
    ],
    problem_ko: '초기 기능 과다로 인한 작업 지연 및 펀딩 실패',
    problem_en: 'Work delays and funding failure due to excessive initial features',
    solution_ko: '설문 데이터 기반으로 기능 우선순위 재조정(MVP), 오프라인 스프린트 회의로 개발 가속화',
    solution_en: 'Reprioritized features based on survey data (MVP), accelerated development through offline sprint meetings',
    outcome_ko: [
      '실제 런칭 가능한 수준의 MVP 화면 설계 및 개발 완료',
      '상표권 등록 완료, 사업계획서 작성 경험 확보',
    ],
    outcome_en: [
      'Completed MVP screen design and development ready for actual launch',
      'Completed trademark registration, gained business plan writing experience',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1000', caption_ko: '하우스톡 앱 메인 화면', caption_en: 'HouseStock App Main Screen' },
    ],
    is_visible: true,
    order_index: 3,
    category: 'web_app',
  },
  {
    id: 'proj-5',
    title_ko: 'B2G 정부과제 입찰 제안 전략',
    title_en: 'B2G Government Project Bidding Strategy',
    tags: ['B2G', 'Strategy', 'Proposal'],
    stat_ko: '누적 수주 55억 원',
    stat_en: '5.5B KRW Won',
    thumb: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000',
    period: '2024.01 ~ 2025.03',
    team_ko: '기획 100%',
    team_en: '100% Planning',
    project_ko: '예술, 역사, 과학 등 다양한 분야의 정부과제(B2G) 입찰 제안서를 작성하고 수주를 목표로 하는 프로젝트입니다.',
    project_en: 'Project aimed at writing government project (B2G) bidding proposals in various fields including art, history, and science.',
    role_ko: [
      '기획 100% (RFP 분석, 전략 수립, 제안서 작성)',
      '페이지네이션 템플릿화를 통한 작성 시간 30% 단축',
      'AI 도구(GPT, Perplexity)를 활용한 초기 시장/정책 자료 조사 효율화',
    ],
    role_en: [
      '100% Planning (RFP analysis, strategy development, proposal writing)',
      'Reduced writing time by 30% through pagination templating',
      'Improved initial market/policy research efficiency using AI tools (GPT, Perplexity)',
    ],
    problem_ko: '단기 병행 업무로 인한 일정 압박 및 리소스 부족',
    problem_en: 'Schedule pressure and resource shortage due to short-term parallel tasks',
    solution_ko: 'Notion 기반 일자별 업무 관리 및 제안서 템플릿(규격화) 구축으로 효율성 극대화',
    solution_en: 'Maximized efficiency with Notion-based daily task management and standardized proposal templates',
    outcome_ko: [
      '총 26건 입찰 중 9건 수주 (수주율 23%)',
      '누적 입찰 수주 금액 약 55억 원 달성',
    ],
    outcome_en: [
      'Won 9 out of 26 total bids (23% win rate)',
      'Achieved cumulative bid winning amount of approximately 5.5 billion KRW',
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000', caption_ko: '제안서 전략 장표 예시', caption_en: 'Proposal Strategy Slide Example' },
    ],
    is_visible: true,
    order_index: 4,
    category: 'proposal',
  },
];

export const DEFAULT_CONTACT: ContactData = {
  title_ko: "함께 일해요",
  title_en: "Let's Work Together",
  desc_ko: '새로운 기회에 대해 이야기 나누고 싶으시다면 언제든 연락 주세요.',
  desc_en: "Feel free to reach out if you'd like to discuss new opportunities.",
  cta_ko: '이메일 보내기',
  cta_en: 'Send Email',
};

// PPT 기반 인터뷰 데이터
export const DEFAULT_INTERVIEWS: InterviewData[] = [
  {
    id: 'int-1',
    question_ko: 'Q. 왜 기획, PM 일을 선택하게 되었나요?',
    question_en: 'Q. Why did you choose planning and PM work?',
    answer_ko: '처음에는 게임 프로그래머를 꿈꿨지만, 공모전을 계기로 기획에 흥미를 느끼게 됐습니다.\n\n아이디어를 직접 실현해보는 과정이 재미있었고, 이후 실무에서 자연스럽게 PM 역할까지 맡게 되었습니다.\n\n어린 나이에 PM을 맡아 우려도 있었지만, 사용자·클라이언트·팀원 모두의 관점을 고려하며 소통했고 점차 인정받을 수 있었습니다.\n\n지금은 기획, 디자인, 개발을 아우르며 팀의 방향을 하나로 모으는 PM의 역할에서 큰 보람을 느낍니다.',
    answer_en: 'I initially dreamed of becoming a game programmer, but I became interested in planning through a competition.\n\nThe process of realizing ideas was fun, and I naturally took on PM roles in practice.\n\nAlthough there were concerns about being a young PM, I communicated while considering the perspectives of users, clients, and team members, and gradually gained recognition.\n\nNow I find great fulfillment in the role of PM, bringing together planning, design, and development to unify the team\'s direction.',
    order_index: 0,
  },
  {
    id: 'int-2',
    question_ko: 'Q. 어떤 순간에 가장 몰입하나요?',
    question_en: 'Q. When do you feel most immersed?',
    answer_ko: '단순할 수도 있겠지만, 일할 때 가장 몰입합니다. 일을 가장 좋아합니다.\n\n취미가 무엇이냐고 묻는 질문에 언제나 일이라고만 답할 수 있었습니다.\n\n주말이 지루해서 사이드 프로젝트를 하고, 네트워킹에 나가면서 개인 역량을 높이는 것에 몰입합니다.\n\n물론 언제나 일이 즐겁기만 한 것은 아니지만, 여전히 일을 할 때면 설렙니다. 일은 저에게 몰입 그 자체입니다.',
    answer_en: 'It might sound simple, but I\'m most immersed when working. I love work the most.\n\nWhenever asked about my hobbies, I could only answer with work.\n\nI do side projects on weekends because I get bored, and I immerse myself in improving my capabilities through networking.\n\nOf course, work isn\'t always enjoyable, but I still get excited when working. Work is immersion itself for me.',
    order_index: 1,
  },
  {
    id: 'int-3',
    question_ko: 'Q. PM으로서 가장 중요하게 생각하는 건 뭔가요?',
    question_en: 'Q. What do you consider most important as a PM?',
    answer_ko: '사람과 사람이 일을 하는 곳에서 중요한 건 소통이라고 생각합니다.\n\n서로 말을 안 하면 아무것도 모르듯, 감정이 상하면 더이상 보기 싫은 것이 인간관계이듯 일도 동일하다고 생각합니다.\n\n하나의 이야기를 전달하고, 서로의 입장을 고려하여 조율하고, 같은 방향과 목적을 위해 달리는 팀이라고 느낄 수 있도록 계속된 소통과 협의, 확인하며 나아갑니다.\n\nPM은 프로젝트에 참여하는 팀원들이 하나로 나아갈 수 있도록 하는 것, 그 첫 시작엔 소통이 있다고 생각합니다.',
    answer_en: 'I believe communication is the most important thing when people work together.\n\nJust as you don\'t know anything if you don\'t talk to each other, and just as you don\'t want to see someone anymore when feelings are hurt, work is the same.\n\nI move forward through continuous communication, coordination, and confirmation - conveying a single story, coordinating while considering each other\'s positions, and making the team feel like they\'re running toward the same direction and purpose.\n\nI believe communication is the first step for a PM to help team members move forward as one.',
    order_index: 2,
  },
  {
    id: 'int-4',
    question_ko: 'Q. 앞으로 어떤 PM이 되고 싶나요?',
    question_en: 'Q. What kind of PM do you want to become?',
    answer_ko: '업계에서 정말 유능한 PM이 되고 싶습니다.\n\n누구와 함께해도 소통이 잘 되고, 어떤 프로젝트든 함께하면 해낼 수 있을 것 같은 사람.\n\n리스크는 사전에 파악하고, 변수가 생겨도 빠르게 대응하며, 그 안에서 사람들을 이해하고 조율할 수 있는 PM이 되고 싶습니다.\n\nPM은 혼자서 성과를 낼 수 있는 직군도 아니고, 혼자만 잘났다고 할 수 있는 직군도 아니기에 모두를 아우르고 이해하며 나아갈 수 있는 그런 PM이 되겠습니다.',
    answer_en: 'I want to become a truly competent PM in the industry.\n\nSomeone who communicates well with anyone, and makes people feel like any project can be accomplished together.\n\nI want to become a PM who identifies risks in advance, responds quickly to variables, and can understand and coordinate people within that context.\n\nSince PM is not a role where you can achieve results alone or claim to be the only one who\'s capable, I will become a PM who encompasses and understands everyone while moving forward.',
    order_index: 3,
  },
];

// ===== 로컬 스토리지 키 =====
export const STORAGE_KEYS = {
  PROFILE: 'site_profile',
  COMPETENCIES: 'site_competencies',
  EXPERIENCES: 'site_experiences',
  PROJECTS: 'site_projects',
  CONTACT: 'site_contact',
  MESSAGES: 'guestbook_messages',
  CATEGORIES: 'site_categories',
  INTERVIEWS: 'site_interviews',
};

// 기본 카테고리 데이터
export const DEFAULT_CATEGORIES: CategoryData[] = [
  { id: 'cat-1', key: 'exhibition', label_ko: '전시', label_en: 'Exhibition', icon: 'Layers', order_index: 0 },
  { id: 'cat-2', key: 'web_app', label_ko: '웹/앱', label_en: 'Web/App', icon: 'Monitor', order_index: 1 },
  { id: 'cat-3', key: 'proposal', label_ko: '제안서', label_en: 'Proposal', icon: 'FileText', order_index: 2 },
];

// ===== Supabase 헬퍼 함수 =====

// Supabase에서 데이터 로드
async function loadFromSupabase<T>(key: string): Promise<T | null> {
  if (!isSupabaseAvailable() || !supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // 'PGRST116' = 데이터 없음
        console.warn(`Supabase load error for ${key}:`, error);
      }
      return null;
    }
    return data?.data as T;
  } catch (err) {
    console.warn(`Supabase load failed for ${key}:`, err);
    return null;
  }
}

// Supabase에 데이터 저장
async function saveToSupabase<T>(key: string, data: T): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;
  
  try {
    const { error } = await supabase.rpc('upsert_site_content', {
      p_key: key,
      p_data: data,
    });
    
    if (error) {
      // RPC 함수가 없으면 직접 upsert
      const { error: upsertError } = await supabase
        .from('site_content')
        .upsert({
          key,
          data,
          updated_at: new Date().toISOString(),
        });
      
      if (upsertError) {
        console.warn(`Supabase save error for ${key}:`, upsertError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn(`Supabase save failed for ${key}:`, err);
    return false;
  }
}

// 로컬 스토리지에서 데이터 로드
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

// 커스텀 이벤트 이름 (같은 탭 내 데이터 동기화용)
export const SITE_DATA_UPDATED_EVENT = 'siteDataUpdated';

// 커스텀 이벤트 타입
export interface SiteDataUpdatedEvent extends CustomEvent {
  detail: {
    key: string;
    data: unknown;
  };
}

// 로컬 스토리지에 데이터 저장 및 이벤트 발생
function saveToLocalStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  const jsonData = JSON.stringify(data);
  localStorage.setItem(key, jsonData);
  
  // 다른 탭용 StorageEvent
  window.dispatchEvent(new StorageEvent('storage', {
    key,
    newValue: jsonData,
  }));
  
  // 같은 탭용 CustomEvent (StorageEvent는 같은 탭에서 발생하지 않음)
  window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
    detail: { key, data }
  }));
}

// 캐시 객체 (Supabase 데이터 로컬 캐싱)
const dataCache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_TTL = 5000; // 5초

function getCachedData<T>(key: string): T | null {
  const cached = dataCache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  dataCache[key] = { data, timestamp: Date.now() };
}

// ===== 데이터 로드/저장 함수 (하이브리드) =====

// 프로필
export function getProfile(): ProfileData {
  // 먼저 로컬 스토리지에서 로드 (빠른 응답)
  const local = loadFromLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  
  // 백그라운드에서 Supabase 동기화
  if (typeof window !== 'undefined' && isSupabaseAvailable()) {
    loadFromSupabase<ProfileData>(STORAGE_KEYS.PROFILE).then(remote => {
      if (remote) {
        saveToLocalStorage(STORAGE_KEYS.PROFILE, remote);
      }
    });
  }
  
  return local;
}

export async function saveProfile(data: ProfileData): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // 로컬 스토리지에 먼저 저장 (빠른 반영)
  saveToLocalStorage(STORAGE_KEYS.PROFILE, data);
  
  // Supabase에 동기화
  await saveToSupabase(STORAGE_KEYS.PROFILE, data);
}

// 역량
export function getCompetencies(): CompetencyData[] {
  const local = loadFromLocalStorage(STORAGE_KEYS.COMPETENCIES, DEFAULT_COMPETENCIES);
  
  if (typeof window !== 'undefined' && isSupabaseAvailable()) {
    loadFromSupabase<CompetencyData[]>(STORAGE_KEYS.COMPETENCIES).then(remote => {
      if (remote) {
        saveToLocalStorage(STORAGE_KEYS.COMPETENCIES, remote);
      }
    });
  }
  
  return local;
}

export async function saveCompetencies(data: CompetencyData[]): Promise<void> {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.COMPETENCIES, data);
  await saveToSupabase(STORAGE_KEYS.COMPETENCIES, data);
}

// 경력
export function getExperiences(): ExperienceData[] {
  const local = loadFromLocalStorage<ExperienceData[]>(STORAGE_KEYS.EXPERIENCES, DEFAULT_EXPERIENCES);
  
  // 마이그레이션: order_index가 없는 기존 데이터 처리
  const migrated = local.map((exp, index) => ({
    ...exp,
    order_index: exp.order_index ?? index,
  }));
  
  // 백그라운드에서 Supabase 동기화
  if (typeof window !== 'undefined' && isSupabaseAvailable()) {
    loadFromSupabase<ExperienceData[]>(STORAGE_KEYS.EXPERIENCES).then(remote => {
      if (remote) {
        const remoteMigrated = remote.map((exp, index) => ({
          ...exp,
          order_index: exp.order_index ?? index,
        }));
        saveToLocalStorage(STORAGE_KEYS.EXPERIENCES, remoteMigrated);
      }
    });
  }
  
  return migrated.sort((a, b) => a.order_index - b.order_index);
}

export async function saveExperiences(data: ExperienceData[]): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const withOrderIndex = data.map((exp, index) => ({
    ...exp,
    order_index: exp.order_index ?? index,
  }));
  
  saveToLocalStorage(STORAGE_KEYS.EXPERIENCES, withOrderIndex);
  await saveToSupabase(STORAGE_KEYS.EXPERIENCES, withOrderIndex);
}

// 프로젝트
export function getProjects(): ProjectData[] {
  const local = loadFromLocalStorage<ProjectData[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
  
  if (typeof window !== 'undefined' && isSupabaseAvailable()) {
    loadFromSupabase<ProjectData[]>(STORAGE_KEYS.PROJECTS).then(remote => {
      if (remote) {
        saveToLocalStorage(STORAGE_KEYS.PROJECTS, remote);
      }
    });
  }
  
  return local.sort((a, b) => a.order_index - b.order_index);
}

export async function saveProjects(data: ProjectData[]): Promise<void> {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.PROJECTS, data);
  await saveToSupabase(STORAGE_KEYS.PROJECTS, data);
}

// 연락처
export function getContact(): ContactData {
  return loadFromLocalStorage(STORAGE_KEYS.CONTACT, DEFAULT_CONTACT);
}

export async function saveContact(data: ContactData): Promise<void> {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.CONTACT, data);
  await saveToSupabase(STORAGE_KEYS.CONTACT, data);
}

// 메시지
export function getMessages(): GuestMessage[] {
  return loadFromLocalStorage<GuestMessage[]>(STORAGE_KEYS.MESSAGES, []);
}

export async function saveMessages(data: GuestMessage[]): Promise<void> {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.MESSAGES, data);
  await saveToSupabase(STORAGE_KEYS.MESSAGES, data);
}

// 카테고리
export function getCategories(): CategoryData[] {
  const local = loadFromLocalStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  
  if (typeof window !== 'undefined' && isSupabaseAvailable()) {
    loadFromSupabase<CategoryData[]>(STORAGE_KEYS.CATEGORIES).then(remote => {
      if (remote) {
        saveToLocalStorage(STORAGE_KEYS.CATEGORIES, remote);
      }
    });
  }
  
  return local;
}

export async function saveCategories(data: CategoryData[]): Promise<void> {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.CATEGORIES, data);
  await saveToSupabase(STORAGE_KEYS.CATEGORIES, data);
}

// 인터뷰
export function getInterviews(): InterviewData[] {
  const local = loadFromLocalStorage(STORAGE_KEYS.INTERVIEWS, DEFAULT_INTERVIEWS);
  
  if (typeof window !== 'undefined' && isSupabaseAvailable()) {
    loadFromSupabase<InterviewData[]>(STORAGE_KEYS.INTERVIEWS).then(remote => {
      if (remote) {
        saveToLocalStorage(STORAGE_KEYS.INTERVIEWS, remote);
      }
    });
  }
  
  return local;
}

export async function saveInterviews(data: InterviewData[]): Promise<void> {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.INTERVIEWS, data);
  await saveToSupabase(STORAGE_KEYS.INTERVIEWS, data);
}

// Supabase 연결 여부 확인
export function isCloudSyncEnabled(): boolean {
  return isSupabaseAvailable();
}

// Supabase에서 모든 데이터 동기화 (페이지 로드 시 호출)
export async function syncFromCloud(): Promise<void> {
  if (!isSupabaseAvailable() || !supabase) return;
  
  const keys = [
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.COMPETENCIES,
    STORAGE_KEYS.EXPERIENCES,
    STORAGE_KEYS.PROJECTS,
    STORAGE_KEYS.CATEGORIES,
    STORAGE_KEYS.INTERVIEWS,
  ];
  
  for (const key of keys) {
    const remote = await loadFromSupabase(key);
    if (remote) {
      saveToLocalStorage(key, remote);
    }
  }
}

// 로컬 스토리지를 Supabase에 업로드 (마이그레이션)
export async function uploadToCloud(): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase가 설정되지 않았습니다.');
    return false;
  }
  
  const data = {
    [STORAGE_KEYS.PROFILE]: getProfile(),
    [STORAGE_KEYS.COMPETENCIES]: getCompetencies(),
    [STORAGE_KEYS.EXPERIENCES]: getExperiences(),
    [STORAGE_KEYS.PROJECTS]: getProjects(),
    [STORAGE_KEYS.CATEGORIES]: getCategories(),
    [STORAGE_KEYS.INTERVIEWS]: getInterviews(),
  };
  
  let success = true;
  for (const [key, value] of Object.entries(data)) {
    const result = await saveToSupabase(key, value);
    if (!result) success = false;
  }
  
  return success;
}

// 데이터 초기화 (기본값으로 리셋)
export async function resetAllData(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  saveToLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  saveToLocalStorage(STORAGE_KEYS.COMPETENCIES, DEFAULT_COMPETENCIES);
  saveToLocalStorage(STORAGE_KEYS.EXPERIENCES, DEFAULT_EXPERIENCES);
  saveToLocalStorage(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
  saveToLocalStorage(STORAGE_KEYS.CONTACT, DEFAULT_CONTACT);
  saveToLocalStorage(STORAGE_KEYS.INTERVIEWS, DEFAULT_INTERVIEWS);
  
  // Supabase에도 초기화
  if (isSupabaseAvailable()) {
    await saveToSupabase(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    await saveToSupabase(STORAGE_KEYS.COMPETENCIES, DEFAULT_COMPETENCIES);
    await saveToSupabase(STORAGE_KEYS.EXPERIENCES, DEFAULT_EXPERIENCES);
    await saveToSupabase(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    await saveToSupabase(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    await saveToSupabase(STORAGE_KEYS.INTERVIEWS, DEFAULT_INTERVIEWS);
  }
}

// Supabase 실시간 구독 설정
export function subscribeToChanges(callback: (key: string) => void): (() => void) | null {
  if (!isSupabaseAvailable() || !supabase) return null;
  
  const channel = supabase
    .channel('site_content_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_content',
      },
      (payload) => {
        const key = (payload.new as { key?: string })?.key;
        if (key) {
          // 원격 데이터로 로컬 업데이트
          loadFromSupabase(key).then(data => {
            if (data) {
              saveToLocalStorage(key, data);
              callback(key);
            }
          });
        }
      }
    )
    .subscribe();
  
  // 구독 해제 함수 반환
  return () => {
    supabase?.removeChannel(channel);
  };
}

