-- =====================================================
-- 게스트북 RLS 정책 수정 (안전한 방법)
-- =====================================================

-- 1. 먼저 기존 정책 확인
-- SELECT * FROM pg_policies WHERE tablename = 'guestbook';

-- 2. 기존 정책이 있다면 삭제 (정책 이름 확인 후 실행)
-- DROP POLICY IF EXISTS "Public or authenticated can view guestbook" ON guestbook;
-- DROP POLICY IF EXISTS "Anyone can view all guestbook messages" ON guestbook;

-- 3. 새로운 정책 생성 (모든 메시지 조회 가능)
CREATE POLICY IF NOT EXISTS "Anyone can view all guestbook messages"
  ON guestbook FOR SELECT
  USING (true);

-- 만약 위에서 오류가 나면, 기존 정책을 먼저 확인하고 삭제한 후 실행하세요.


