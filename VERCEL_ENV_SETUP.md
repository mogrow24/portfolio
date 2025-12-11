# Vercel 환경 변수 설정 가이드

## 문제
Vercel 배포 환경에서 Supabase API 호출이 실패하고 있습니다.
에러: `Supabase 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.`

## 해결 방법

### 1. Vercel 대시보드에서 환경 변수 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables 이동**

3. **다음 환경 변수 추가:**

   ```
   NEXT_PUBLIC_SUPABASE_URL
   값: https://your-project-id.supabase.co
   (실제 Supabase 프로젝트 URL)
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   값: your-anon-key
   (Supabase Dashboard → Settings → API → anon public key)
   
   SUPABASE_SERVICE_ROLE_KEY
   값: your-service-role-key
   (Supabase Dashboard → Settings → API → service_role secret key)
   ```

4. **환경 선택:**
   - Production ✅
   - Preview ✅
   - Development ✅
   (모두 선택 권장)

5. **저장 후 재배포**
   - Settings 페이지 하단의 "Redeploy" 버튼 클릭
   - 또는 새로운 커밋 푸시

### 2. 환경 변수 확인 방법

배포 후 브라우저 콘솔에서 확인:
- `✅ Supabase 저장 성공:` 로그가 나와야 함
- `💾 로컬스토리지 저장 완료:` 로그가 나오면 환경 변수 미설정

### 3. Supabase 키 찾는 방법

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Settings → API 이동**

3. **필요한 키:**
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`에 사용 (⚠️ 비공개)

### 4. 추가 확인 사항

- 환경 변수 이름이 정확한지 확인 (대소문자 구분)
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서도 접근 가능
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용 (비공개)

### 5. 재배포 후 테스트

1. 비밀글 작성
2. 브라우저 콘솔 확인:
   - `✅ Supabase 저장 성공:` 로그 확인
   - `✅ 새 메시지 추가:` 로그 확인
3. 프론트엔드에서 비밀글이 블러 처리되어 표시되는지 확인
4. 어드민에서 비밀글이 표시되는지 확인


