// 사이트 콘텐츠 데이터 스토어
// 로컬 스토리지 기반으로 모든 사이트 콘텐츠를 중앙 관리

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
}

// 프로젝트 갤러리 이미지
export interface GalleryImage {
  src: string;
  caption_ko: string;
  caption_en: string;
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

// 게스트 메시지
export interface GuestMessage {
  id: string;
  name: string;
  company?: string;  // 회사명
  email?: string;
  message: string;
  allowNotification: boolean;
  isSecret: boolean;  // 비밀글 여부 (관리자만 볼 수 있음)
  createdAt: string;
  isRead: boolean;
  reply?: string;
  replyAt?: string;
  isReplyLocked: boolean;
}

// ===== 기본 데이터 =====

export const DEFAULT_PROFILE: ProfileData = {
  name_ko: '윤지희',
  name_en: 'YUN JI HEE',
  phone: '010.5503.7807',
  email: 'jihee7772@naver.com',
  photo_url: '',
  subtitle_ko: 'Product Manager Portfolio',
  subtitle_en: 'Product Manager Portfolio',
  title1_ko: '문제를 정의하고',
  title1_en: 'Define Problems',
  title2_ko: '실행을 설계합니다.',
  title2_en: 'Design Execution.',
  desc_ko: '사용자 흐름을 구조화하고, 실행 가능한 전략으로 연결하는 4년차 실무형 PM입니다. 팀에 명확한 방향성을 제안하여 헤매지 않고, 일정 내에 움직일 수 있게 만듭니다. 복잡한 문제를 함께 정리해주고 마감까지 끌고 가는 것이 저의 역할입니다.',
  desc_en: "A 4th-year practical PM who structures user flows and connects them to executable strategies. I provide clear direction to teams so they don't wander and can move within schedule. My role is to organize complex problems together and carry them through to completion.",
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
  },
];

export const DEFAULT_CONTACT: ContactData = {
  title_ko: "Let's build something meaningful.",
  title_en: "Let's build something meaningful.",
  desc_ko: '팀의 방향성을 제시하고 마감까지 끌고 가는 사람, 윤지희입니다.',
  desc_en: "I'm Jihee Yoon, someone who provides team direction and carries projects through to completion.",
  cta_ko: '이메일 보내기',
  cta_en: 'Send Email',
};

// ===== 로컬 스토리지 키 =====
const STORAGE_KEYS = {
  PROFILE: 'site_profile',
  COMPETENCIES: 'site_competencies',
  EXPERIENCES: 'site_experiences',
  PROJECTS: 'site_projects',
  CONTACT: 'site_contact',
  MESSAGES: 'guestbook_messages',
};

// ===== 데이터 로드/저장 함수 =====

// 프로필
export function getProfile(): ProfileData {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
}

export function saveProfile(data: ProfileData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
}

// 역량
export function getCompetencies(): CompetencyData[] {
  if (typeof window === 'undefined') return DEFAULT_COMPETENCIES;
  const saved = localStorage.getItem(STORAGE_KEYS.COMPETENCIES);
  return saved ? JSON.parse(saved) : DEFAULT_COMPETENCIES;
}

export function saveCompetencies(data: CompetencyData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(data));
}

// 경력
export function getExperiences(): ExperienceData[] {
  if (typeof window === 'undefined') return DEFAULT_EXPERIENCES;
  const saved = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
  return saved ? JSON.parse(saved) : DEFAULT_EXPERIENCES;
}

export function saveExperiences(data: ExperienceData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(data));
}

// 프로젝트
export function getProjects(): ProjectData[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS;
  const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
}

export function saveProjects(data: ProjectData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
}

// 연락처
export function getContact(): ContactData {
  if (typeof window === 'undefined') return DEFAULT_CONTACT;
  const saved = localStorage.getItem(STORAGE_KEYS.CONTACT);
  return saved ? JSON.parse(saved) : DEFAULT_CONTACT;
}

export function saveContact(data: ContactData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(data));
}

// 메시지
export function getMessages(): GuestMessage[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return saved ? JSON.parse(saved) : [];
}

export function saveMessages(data: GuestMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data));
}

// 데이터 초기화 (기본값으로 리셋)
export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  localStorage.setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(DEFAULT_COMPETENCIES));
  localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(DEFAULT_EXPERIENCES));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(DEFAULT_CONTACT));
}

