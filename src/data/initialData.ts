import { LocalProject, LocalProfile, LocalExperience, LocalSiteSettings } from '@/types/admin';

// 초기 프로젝트 데이터
export const initialProjects: LocalProject[] = [
  {
    id: '1',
    title_ko: '현대 IONIQ6 웹앱 글로벌 캠페인',
    title_en: 'Hyundai IONIQ6 Global Web/App Campaign',
    tags: ['Global Marketing', 'Web/App', 'AR/VR'],
    stat_ko: '사전 계약 47,000여 대 달성',
    stat_en: '47,000+ Pre-orders Achieved',
    thumb: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
    period: '2022.02 ~ 2022.08',
    team_ko: '내부 10명 (기획 4, 디자인 3, 공간 3)',
    team_en: '10 members (4 planners, 3 designers, 3 spatial)',
    desc: {
      project_ko: '4개국(아시아/북미/유럽 등)을 대상으로 IONIQ 6 출시에 맞춰 차량 USP를 AR/VR 콘텐츠로 경험하는 체험형 웹/앱 사이트입니다.',
      project_en: 'An experiential web/app site for 4 countries (Asia/North America/Europe) to experience vehicle USP through AR/VR content for IONIQ 6 launch.',
      role_ko: [
        '기획 100%, 외주 소통 80%, 클라이언트 소통 80% 주도',
        '80개 차량 기능 항목 직접 정리 및 콘텐츠화 기준 정의',
        '유저 플로우 및 화면 인터페이스 구조 설계, 화면설계서 버전 관리',
        '4개국 언어 대응 및 글로벌 런칭 QA 진행'
      ],
      role_en: [
        'Led 100% planning, 80% outsourcing communication, 80% client communication',
        'Organized 80 vehicle feature items and defined content criteria',
        'Designed user flow and screen interface structure, managed wireframe versions',
        'Supported 4 languages and conducted global launch QA'
      ],
      problem_ko: '외주 개발사 중도 이탈 가능성 및 2개월간 내부 개발 인력 미투입 상황',
      problem_en: 'Risk of outsourcing developer withdrawal and 2 months without internal development resources',
      solution_ko: '지속적인 외주사 소통으로 이탈 방지, 80여 개 기능 항목 직접 정리 후 전 팀 공유하여 개발 가속화.',
      solution_en: 'Prevented withdrawal through continuous communication, organized 80+ feature items and shared with all teams to accelerate development.',
      outcome_ko: [
        '정식 오픈 후 브랜드 홍보 성공, 아이오닉 6 브랜드 사전 계약 대수 47,000여 대 달성',
        '2022 iF 디자인 어워드 수상'
      ],
      outcome_en: [
        'Successful brand promotion after official launch, achieved 47,000+ IONIQ 6 pre-orders',
        '2022 iF Design Award Winner'
      ]
    },
    gallery: [
      { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000', caption_ko: 'IONIQ 6 AR 기능 체험 화면', caption_en: 'IONIQ 6 AR Feature Experience Screen' },
      { src: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000', caption_ko: '360도 가상 스튜디오 체험', caption_en: '360° Virtual Studio Experience' }
    ],
    is_visible: true,
    order_index: 1,
  },
  {
    id: '2',
    title_ko: '울산현대자동차 기술교육원 전시',
    title_en: 'Ulsan Hyundai Motor Technical Training Center Exhibition',
    tags: ['Exhibition', 'Space Planning', 'UX/UI'],
    stat_ko: '전시관 체류시간 4배 증가',
    stat_en: '4x Increase in Dwell Time',
    thumb: 'https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d?q=80&w=1000&auto=format&fit=crop',
    period: '2023.07 ~ 2023.10',
    team_ko: '기획 및 총괄',
    team_en: 'Planning & Management',
    desc: {
      project_ko: '울산현대자동차 직원 및 교육생을 위한 전기차 기술 교육 및 체험 중심의 전시 콘텐츠 기획 프로젝트입니다.',
      project_en: 'Exhibition content planning project for EV technology education and experience for Ulsan Hyundai Motor employees and trainees.',
      role_ko: [
        '기획 100% / 총괄 100%',
        "'History-Current-Future' 서사 중심 3단 콘텐츠 구조 설계",
        '운영 매뉴얼, 유지보수 매뉴얼, 화면설계서, 결과보고서 등 산출물 표준화'
      ],
      role_en: [
        '100% Planning / 100% Management',
        "Designed 3-stage content structure based on 'History-Current-Future' narrative",
        'Standardized deliverables including operation manual, maintenance manual, wireframes, and reports'
      ],
      problem_ko: '기존 자료의 단편적 나열로 이해도 저하 및 콘텐츠 간 일관성 부족',
      problem_en: 'Decreased comprehension due to fragmented arrangement of existing materials and lack of consistency between contents',
      solution_ko: '서사 구조 설계를 통해 몰입도 강화. 초기 기획부터 회고까지 문서 템플릿화(운영 기준 정립)',
      solution_en: 'Enhanced immersion through narrative structure design. Templated documents from initial planning to retrospective (established operation standards)',
      outcome_ko: [
        '콘텐츠 총 8종 제작 및 설치 완료',
        '전시관 평균 체류시간 10분 → 40분 이상으로 4배 증가',
        "사내 타 부서 벤치마킹 대상이 되는 '운영 기준 프로젝트'로 평가"
      ],
      outcome_en: [
        'Completed production and installation of 8 types of content',
        'Average exhibition dwell time increased 4x from 10 min to 40+ min',
        "Evaluated as 'operation standard project' for benchmarking by other departments"
      ]
    },
    gallery: [
      { src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000', caption_ko: '히스토리 월 및 전시관 전경', caption_en: 'History Wall and Exhibition Overview' }
    ],
    is_visible: true,
    order_index: 2,
  },
  {
    id: '3',
    title_ko: "자체 전시 슬릭 라운지 & 스튜디오 (O2O App)",
    title_en: "SLICK Lounge & Studio Exhibition (O2O App)",
    tags: ['O2O Service', 'App Planning', 'AI'],
    stat_ko: '일 방문객 1,300명 달성',
    stat_en: '1,300 Daily Visitors',
    thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    period: '2023.06 ~ 2024.07',
    team_ko: '기획 80% / 총괄 90%',
    team_en: '80% Planning / 90% Management',
    desc: {
      project_ko: "롯데월드 내 자체 전시 '슬릭 스튜디오'와 연계된 어플리케이션 서비스 기획. '나르시시즘'을 주제로 AI 프로필 등 개인화 콘텐츠를 제공합니다.",
      project_en: "Application service planning linked with 'SLICK Studio' exhibition in Lotte World. Provides personalized content including AI profiles themed on 'Narcissism'.",
      role_ko: [
        '기획 80% / 총괄 90%',
        'AI 이미징 생성 및 QR 코드 기반 O2O 데이터 연동 설계',
        'Notion 기반 일정표, Figma 기반 산출물 관리로 협업 프로세스 구축'
      ],
      role_en: [
        '80% Planning / 90% Management',
        'Designed AI imaging generation and QR code-based O2O data integration',
        'Built collaboration process with Notion schedules and Figma deliverable management'
      ],
      problem_ko: '공간 시공은 완료되었으나 상세 콘텐츠 기획 부재, 온오프라인 연동 필요성 대두',
      problem_en: 'Space construction completed but lacking detailed content planning, need for online-offline integration emerged',
      solution_ko: '내부 10-12명 TFT 구성하여 콘텐츠 기획 주도. AI 키워드 생성 및 이미지 디스크립션 자동화 도입',
      solution_en: 'Led content planning with internal 10-12 member TFT. Introduced AI keyword generation and image description automation',
      outcome_ko: [
        '일 방문객 1,200~1,300명 달성 (기존 대비 증가)',
        'SNS 계정 팔로우 수 1일 만에 1,000명 증가',
        '유저 데이터 및 체험 데이터 웹앱 대비 30% 추가 확보'
      ],
      outcome_en: [
        'Achieved 1,200-1,300 daily visitors (increase from previous)',
        'SNS account followers increased by 1,000 in one day',
        'Secured 30% more user and experience data compared to web app'
      ]
    },
    gallery: [
      { src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000', caption_ko: 'AI 프로필 생성 앱 화면', caption_en: 'AI Profile Generation App Screen' },
      { src: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=1000', caption_ko: 'QR 코드 연동 체험', caption_en: 'QR Code Integration Experience' }
    ],
    is_visible: true,
    order_index: 3,
  },
  {
    id: '4',
    title_ko: "자취생 커뮤니티 '하우스톡' (사이드 프로젝트)",
    title_en: "HouseStock - Community App (Side Project)",
    tags: ['Startup', 'Side Project', 'MVP'],
    stat_ko: 'MVP 완료 & 상표권 등록',
    stat_en: 'MVP Complete & Trademark',
    thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop',
    period: '2023.06 ~ Present',
    team_ko: '기획 100% / 사업 100%',
    team_en: '100% Planning / 100% Business',
    desc: {
      project_ko: '자취 초심자들을 위한 정보 탐색과 커뮤니티 기능을 통합한 모바일 애플리케이션 기획 프로젝트입니다.',
      project_en: 'Mobile application planning project integrating information search and community features for first-time renters.',
      role_ko: [
        '기획 100% / 사업 100% (참여율)',
        '350명 유저 설문조사 및 니즈 분석, 페르소나 정의',
        'MVP 기능 정의, 화면설계서, 기능 정의서 작성',
        '와디즈 펀딩 페이지 기획 및 상표권 등록 진행'
      ],
      role_en: [
        '100% Planning / 100% Business (participation rate)',
        'Conducted 350 user surveys and needs analysis, defined personas',
        'Defined MVP features, created wireframes and functional specifications',
        'Planned Wadiz funding page and processed trademark registration'
      ],
      problem_ko: '초기 기능 과다로 인한 작업 지연 및 펀딩 실패',
      problem_en: 'Work delays and funding failure due to excessive initial features',
      solution_ko: '설문 데이터 기반으로 기능 우선순위 재조정(MVP), 오프라인 스프린트 회의로 개발 가속화',
      solution_en: 'Reprioritized features based on survey data (MVP), accelerated development through offline sprint meetings',
      outcome_ko: [
        '실제 런칭 가능한 수준의 MVP 화면 설계 및 개발 완료',
        '상표권 등록 완료, 사업계획서 작성 경험 확보'
      ],
      outcome_en: [
        'Completed MVP screen design and development ready for actual launch',
        'Completed trademark registration, gained business plan writing experience'
      ]
    },
    gallery: [
      { src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1000', caption_ko: '하우스톡 앱 메인 화면', caption_en: 'HouseStock App Main Screen' }
    ],
    is_visible: true,
    order_index: 4,
  },
  {
    id: '5',
    title_ko: 'B2G 정부과제 입찰 제안 전략',
    title_en: 'B2G Government Project Bidding Strategy',
    tags: ['B2G', 'Strategy', 'Proposal'],
    stat_ko: '누적 수주 55억 원',
    stat_en: '5.5B KRW Won',
    thumb: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000',
    period: '2024.01 ~ 2025.03',
    team_ko: '기획 100%',
    team_en: '100% Planning',
    desc: {
      project_ko: '예술, 역사, 과학 등 다양한 분야의 정부과제(B2G) 입찰 제안서를 작성하고 수주를 목표로 하는 프로젝트입니다.',
      project_en: 'Project aimed at writing government project (B2G) bidding proposals in various fields including art, history, and science.',
      role_ko: [
        '기획 100% (RFP 분석, 전략 수립, 제안서 작성)',
        '페이지네이션 템플릿화를 통한 작성 시간 30% 단축',
        'AI 도구(GPT, Perplexity)를 활용한 초기 시장/정책 자료 조사 효율화'
      ],
      role_en: [
        '100% Planning (RFP analysis, strategy development, proposal writing)',
        'Reduced writing time by 30% through pagination templating',
        'Improved initial market/policy research efficiency using AI tools (GPT, Perplexity)'
      ],
      problem_ko: '단기 병행 업무로 인한 일정 압박 및 리소스 부족',
      problem_en: 'Schedule pressure and resource shortage due to short-term parallel tasks',
      solution_ko: 'Notion 기반 일자별 업무 관리 및 제안서 템플릿(규격화) 구축으로 효율성 극대화',
      solution_en: 'Maximized efficiency with Notion-based daily task management and standardized proposal templates',
      outcome_ko: [
        '총 26건 입찰 중 9건 수주 (수주율 23%)',
        '누적 입찰 수주 금액 약 55억 원 달성'
      ],
      outcome_en: [
        'Won 9 out of 26 total bids (23% win rate)',
        'Achieved cumulative bid winning amount of approximately 5.5 billion KRW'
      ]
    },
    gallery: [
      { src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000', caption_ko: '제안서 전략 장표 예시', caption_en: 'Proposal Strategy Slide Example' }
    ],
    is_visible: true,
    order_index: 5,
  },
];

// 초기 프로필 데이터
export const initialProfile: LocalProfile = {
  id: '1',
  name_ko: '윤지희',
  name_en: 'Jihee Yoon',
  title_ko: 'PM · 서비스 콘텐츠 기획자',
  title_en: 'PM · Service Content Planner',
  bio_ko: '사용자의 니즈를 파악하고 비즈니스 목표와 조화시키는 것에 열정을 가진 기획자입니다. 복잡한 문제를 단순하게 풀어내고, 팀과의 원활한 커뮤니케이션을 통해 프로젝트를 성공적으로 이끌어갑니다.',
  bio_en: 'A passionate planner who identifies user needs and harmonizes them with business objectives. I simplify complex problems and lead projects to success through smooth communication with teams.',
  email: 'jihee.yoon@example.com',
  phone: '',
  linkedin: '',
  github: '',
  profile_image: '',
};

// 초기 경력 데이터
export const initialExperiences: LocalExperience[] = [
  {
    id: '1',
    company_ko: '테크 스타트업 A',
    company_en: 'Tech Startup A',
    position_ko: 'Product Manager',
    position_en: 'Product Manager',
    description_ko: '모바일 앱 서비스 기획 및 운영, 사용자 리서치 수행, 데이터 기반 서비스 개선',
    description_en: 'Mobile app service planning and operation, user research, data-driven service improvement',
    start_date: '2023-01',
    end_date: '',
    is_current: true,
    order_index: 1,
  },
  {
    id: '2',
    company_ko: '디지털 에이전시 B',
    company_en: 'Digital Agency B',
    position_ko: '서비스 기획자',
    position_en: 'Service Planner',
    description_ko: '다양한 클라이언트의 웹/앱 서비스 기획, 와이어프레임 및 프로토타입 제작',
    description_en: 'Web/app service planning for various clients, wireframe and prototype creation',
    start_date: '2021-03',
    end_date: '2022-12',
    is_current: false,
    order_index: 2,
  },
];

// 초기 사이트 설정 데이터
export const initialSiteSettings: LocalSiteSettings = {
  hero_title_ko: '안녕하세요',
  hero_title_en: 'Hello',
  hero_subtitle_ko: '사용자 경험을 중심으로 생각하고, 데이터 기반의 의사결정으로 서비스를 성장시킵니다.',
  hero_subtitle_en: 'I think user experience-first and grow services through data-driven decisions.',
  about_description_ko: '사용자의 니즈를 파악하고 비즈니스 목표와 조화시키는 것에 열정을 가진 기획자입니다.',
  about_description_en: 'A passionate planner who identifies user needs and harmonizes them with business objectives.',
  contact_email: 'jihee.yoon@example.com',
  social_linkedin: '',
  social_github: '',
};

