-- =====================================================
-- 게스트북 RLS 정책 완전 수정 (에러 해결)
-- =====================================================

-- 1단계: 모든 SELECT 정책 확인
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'guestbook' AND cmd = 'SELECT';

-- 2단계: 기존 SELECT 정책 모두 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Anyone can view public" ON guestbook;
DROP POLICY IF EXISTS "Anyone can view public guestbook" ON guestbook;
DROP POLICY IF EXISTS "Anyone can view all guestbook messages" ON guestbook;
DROP POLICY IF EXISTS "Public or authenticated can view guestbook" ON guestbook;

-- 3단계: 새로운 정책 생성 (OR REPLACE 사용)
DROP POLICY IF EXISTS "Anyone can view all guestbook messages" ON guestbook;
CREATE POLICY "Anyone can view all guestbook messages"
  ON guestbook FOR SELECT
  USING (true);

-- 4단계: 최종 확인
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'guestbook' AND cmd = 'SELECT';

-- 결과: "Anyone can view all guestbook messages" 하나만 있어야 합니다.


