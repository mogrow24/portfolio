# 윤지희 포트폴리오 웹사이트

PM · 서비스 콘텐츠 기획자 윤지희의 포트폴리오 웹사이트입니다.

## ✨ 주요 기능

- 🎨 **세련된 다크 테마** - 그라데이션과 글래스모피즘 효과
- 📱 **완전 반응형** - 모바일, 태블릿, 데스크탑 지원
- 🌐 **다국어 지원** - 한국어/영어 전환
- ⚡ **부드러운 애니메이션** - Framer Motion 활용
- 🔐 **어드민 페이지** - 콘텐츠 관리 (프로젝트 CRUD, 숨기기)
- 🗄️ **Supabase 연동** - 실시간 데이터베이스

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **i18n**: next-intl

## 🚀 시작하기

### 1. 의존성 설치

```bash
cd portfolio
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 참고하여 `.env.local` 파일을 생성하세요:

```bash
cp env.example .env.local
```

필요한 환경 변수:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행
3. Authentication에서 이메일 인증 활성화
4. 어드민 계정 생성

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
portfolio/
├── src/
│   ├── app/
│   │   ├── admin/           # 어드민 페이지
│   │   ├── globals.css      # 글로벌 스타일
│   │   ├── layout.tsx       # 루트 레이아웃
│   │   └── page.tsx         # 메인 페이지
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── sections/        # Hero, About, Projects, Experience, Contact
│   │   └── ui/              # 재사용 컴포넌트
│   ├── lib/
│   │   └── supabase.ts      # Supabase 클라이언트
│   ├── i18n/
│   │   └── request.ts       # 다국어 설정
│   └── messages/
│       ├── ko.json          # 한국어 번역
│       └── en.json          # 영어 번역
├── supabase-schema.sql      # DB 스키마
└── env.example              # 환경 변수 예시
```

## 🌐 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에서 새 프로젝트 import
2. 환경 변수 설정
3. 배포!

```bash
npm run build
```

## 🔑 어드민 접근

1. `/admin` 페이지로 이동
2. Supabase Auth에 등록된 계정으로 로그인
3. 프로젝트, 프로필, 경력 정보 관리

## 📝 라이센스

MIT License

---

Made with ❤️ by 윤지희







