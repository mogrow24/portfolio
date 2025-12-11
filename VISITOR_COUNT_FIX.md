# 방문자 수 문제 해결 가이드

## 🔍 문제 요약

방문자 수 추적 시스템에서 반복적으로 발생하던 문제들을 해결했습니다:

1. **환경 변수 검증 부재**: 테스트 서버와 실 서버를 구분하지 못함
2. **에러 핸들링 미흡**: 에러 발생 시 조용히 넘어가서 문제 파악 어려움
3. **로깅 부족**: 어떤 환경에서 실행 중인지, 어떤 에러가 발생하는지 불명확

## ✅ 해결 내용

### 1. 환경 변수 검증 시스템 추가

**새 파일**: `src/lib/env-utils.ts`

- 환경 감지 함수 (`detectEnvironment`)
- Supabase 환경 변수 검증 함수 (`validateSupabaseEnv`)
- 검증 결과 로깅 함수 (`logEnvValidation`)

**주요 기능**:
- 테스트 서버(localhost)와 실 서버(vercel) 자동 구분
- 필수 환경 변수 검증 및 상세 에러 메시지
- 환경별 경고 메시지 제공

### 2. API 엔드포인트 개선

**수정 파일**: `src/app/api/visitors/route.ts`

**개선 사항**:
- 모든 API 호출 시 환경 정보 로깅
- 상세한 에러 메시지 및 스택 트레이스
- 환경 변수 검증 통합
- 응답에 환경 정보 포함

**로깅 예시**:
```
🔍 환경 변수 검증 (환경: vercel)
✅ 모든 환경 변수가 올바르게 설정되었습니다.
📊 방문자 수 조회 시작...
✅ 방문자 수 조회 성공: 123명 (환경: vercel)
```

### 3. 클라이언트 사이드 개선

**수정 파일**: `src/lib/visitors.ts`

**개선 사항**:
- 환경 감지 통합
- API 호출 시 상세 로깅
- 에러 발생 시 환경 정보 포함

### 4. 테스트 스크립트 개선

**수정 파일**: `scripts/test-visitor-count.js`

**개선 사항**:
- 환경 변수 검증 추가
- 테스트 서버/실 서버 자동 감지
- 상세한 테스트 결과 출력

## 🧪 테스트 방법

### 로컬 테스트

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 다른 터미널에서 테스트 스크립트 실행
node scripts/test-visitor-count.js
```

### Vercel 테스트

```bash
# 환경 변수 설정
export API_BASE_URL=https://your-project.vercel.app

# 테스트 스크립트 실행
node scripts/test-visitor-count.js
```

## 📋 확인 사항

### 1. 환경 변수 설정 확인

**로컬 환경** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Vercel 환경**:
- Vercel 대시보드 → Settings → Environment Variables
- 위 환경 변수들을 Production, Preview, Development에 모두 설정

### 2. 서버 로그 확인

**정상 작동 시**:
```
🔍 환경 변수 검증 (환경: vercel)
✅ 모든 환경 변수가 올바르게 설정되었습니다.
📊 방문자 수 조회 시작...
✅ 방문자 수 조회 성공: 123명 (환경: vercel)
```

**문제 발생 시**:
```
🔍 환경 변수 검증 (환경: vercel)
❌ 환경 변수 검증 실패:
  - NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.
  - SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.
```

### 3. 브라우저 콘솔 확인

**정상 작동 시**:
```
📡 방문자 수 API 호출 시작 (GET): { endpoint: '/api/visitors', environment: 'vercel' }
✅ 방문자 수 API GET 성공: { count: 123, environment: 'vercel', endpoint: '/api/visitors' }
✅ 방문자 수 로드 완료: 123
```

**문제 발생 시**:
```
❌ 방문자 수 API GET 실패: { status: 500, statusText: 'Internal Server Error', environment: 'vercel', endpoint: '/api/visitors' }
```

## 🔧 문제 해결 체크리스트

### 환경 변수 문제

- [ ] `.env.local` 파일이 존재하는가?
- [ ] Vercel 대시보드에 환경 변수가 설정되어 있는가?
- [ ] 환경 변수 이름이 정확한가? (대소문자 구분)
- [ ] `NEXT_PUBLIC_` 접두사가 올바르게 사용되었는가?

### Supabase 연결 문제

- [ ] Supabase 프로젝트가 활성화되어 있는가?
- [ ] `visitor_count` 테이블이 존재하는가?
- [ ] RLS 정책이 올바르게 설정되어 있는가?
- [ ] `increment_visitor_count` RPC 함수가 존재하는가?

### 네트워크 문제

- [ ] 인터넷 연결이 정상인가?
- [ ] Supabase 서비스가 정상 작동 중인가?
- [ ] 방화벽이나 프록시가 요청을 차단하지 않는가?

## 📊 모니터링

### 서버 로그 모니터링

Vercel 대시보드에서 Functions 로그를 확인하여:
- 환경 변수 검증 결과
- API 호출 성공/실패
- 에러 메시지 및 스택 트레이스

### 클라이언트 로그 모니터링

브라우저 개발자 도구 콘솔에서:
- API 호출 시작/완료 로그
- 에러 메시지 및 환경 정보
- 방문자 수 로드 상태

## 🚀 다음 단계

1. **환경 변수 설정 확인**: 로컬 및 Vercel 환경 모두 확인
2. **테스트 실행**: `test-visitor-count.js` 스크립트 실행
3. **로그 확인**: 서버 및 클라이언트 로그에서 환경 정보 확인
4. **문제 발생 시**: 위 체크리스트를 따라 문제 해결

## 📝 변경 사항 요약

### 새로 추가된 파일
- `src/lib/env-utils.ts`: 환경 변수 검증 유틸리티

### 수정된 파일
- `src/app/api/visitors/route.ts`: 환경 변수 검증 및 로깅 추가
- `src/lib/visitors.ts`: 환경 감지 및 로깅 개선
- `scripts/test-visitor-count.js`: 테스트 스크립트 개선

### 주요 개선 사항
- ✅ 환경 변수 자동 검증
- ✅ 테스트/실 서버 자동 구분
- ✅ 상세한 에러 로깅
- ✅ 환경 정보 포함 응답
- ✅ 문제 진단 용이성 향상

