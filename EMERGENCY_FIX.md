# 🚨 방문자 수 긴급 수정 가이드

## 문제 진단 방법

### 1. 로컬에서 테스트

```bash
# 개발 서버 실행
npm run dev

# 다른 터미널에서 진단 스크립트 실행
node scripts/diagnose-visitor-count.js
```

### 2. Vercel에서 테스트

```bash
# 환경 변수 설정
$env:API_BASE_URL="https://your-project.vercel.app"
node scripts/diagnose-visitor-count.js
```

## 확인 사항

### ✅ 환경 변수 확인

**로컬 (.env.local)**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Vercel**:
- Settings → Environment Variables에서 확인
- Production, Preview, Development 모두 설정되어 있는지 확인

### ✅ Supabase 확인

1. **테이블 존재 확인**:
   ```sql
   SELECT * FROM visitor_count WHERE id = 'global';
   ```

2. **RPC 함수 확인**:
   ```sql
   SELECT increment_visitor_count();
   ```

3. **RLS 정책 확인**:
   - `visitor_count` 테이블의 RLS가 올바르게 설정되어 있는지 확인

### ✅ 실제 문제 파악

**브라우저 콘솔에서 확인**:
1. F12 → Console 탭
2. 페이지 새로고침
3. 다음 로그 확인:
   - `📡 방문자 수 API 호출 시작`
   - `✅ 방문자 수 API GET 성공` 또는 `❌ 방문자 수 API GET 실패`

**서버 로그 확인 (Vercel)**:
1. Vercel 대시보드 → Functions
2. `/api/visitors` 함수 로그 확인
3. 에러 메시지 확인

## 즉시 해결 방법

### 문제 1: 방문자 수가 0으로만 표시됨

**원인**: `visitor_count` 테이블에 초기 데이터가 없음

**해결**:
```sql
INSERT INTO visitor_count (id, count) 
VALUES ('global', 0) 
ON CONFLICT (id) DO NOTHING;
```

### 문제 2: API 호출 실패

**원인**: 환경 변수 미설정

**해결**:
1. `.env.local` 파일 확인
2. Vercel 환경 변수 확인
3. 재배포

### 문제 3: RPC 함수 오류

**원인**: `increment_visitor_count` 함수가 없음

**해결**: `supabase-schema.sql`의 RPC 함수 생성 부분 실행

## 빠른 테스트

브라우저 콘솔에서 직접 실행:

```javascript
// 1. GET 테스트
fetch('/api/visitors')
  .then(r => r.json())
  .then(d => console.log('GET 결과:', d));

// 2. POST 테스트 (실제로 증가시킴)
fetch('/api/visitors', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log('POST 결과:', d));
```

## 연락처

문제가 계속되면 다음 정보를 제공해주세요:
1. 브라우저 콘솔 에러 메시지
2. Vercel Functions 로그
3. 진단 스크립트 실행 결과

