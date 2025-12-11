-- =====================================================
-- 게스트북 RLS 정책 수정 (확인된 정책 이름 사용)
-- =====================================================

-- 기존 SELECT 정책 삭제 (확인된 정책 이름)
DROP POLICY IF EXISTS "Anyone can view public" ON guestbook;
DROP POLICY IF EXISTS "Anyone can view public guestbook" ON guestbook;

-- 새로운 정책 생성: 모든 게스트북 메시지 조회 가능 (비밀글 포함)
CREATE POLICY "Anyone can view all guestbook messages"
  ON guestbook FOR SELECT
  USING (true);

-- 확인: 정책이 제대로 생성되었는지 확인
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'guestbook' AND cmd = 'SELECT';


