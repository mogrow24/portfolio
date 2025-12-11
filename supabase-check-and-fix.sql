-- =====================================================
-- 1단계: 현재 게스트북 정책 확인
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'guestbook';

-- =====================================================
-- 2단계: 기존 SELECT 정책 삭제 (위에서 확인한 정책 이름 사용)
-- =====================================================
-- 예시: 정책 이름이 "Public or authenticated can view guestbook"인 경우
-- DROP POLICY IF EXISTS "Public or authenticated can view guestbook" ON guestbook;

-- 또는 모든 SELECT 정책 삭제 (주의: 다른 정책도 삭제될 수 있음)
-- DO $$
-- DECLARE
--   r RECORD;
-- BEGIN
--   FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'guestbook' AND cmd = 'SELECT'
--   LOOP
--     EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON guestbook';
--   END LOOP;
-- END $$;

-- =====================================================
-- 3단계: 새로운 정책 생성 (모든 메시지 조회 가능)
-- =====================================================
-- 기존 정책이 있으면 먼저 삭제하고 실행
DROP POLICY IF EXISTS "Anyone can view all guestbook messages" ON guestbook;

CREATE POLICY "Anyone can view all guestbook messages"
  ON guestbook FOR SELECT
  USING (true);


