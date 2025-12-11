-- =====================================================
-- 게스트북 RLS 정책 수정
-- 비밀글도 프론트엔드에서 조회 가능하도록 변경
-- (내용은 프론트엔드에서 블러 처리)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public or authenticated can view guestbook" ON guestbook;

-- 새로운 정책: 모든 게스트북 메시지 조회 가능 (비밀글 포함)
-- 프론트엔드에서 블러 처리하여 표시
CREATE POLICY "Anyone can view all guestbook messages"
  ON guestbook FOR SELECT
  USING (true);

-- 기존 정책은 유지
-- 인증된 사용자만 수정/삭제 가능
-- (이미 존재하는 정책이므로 재생성 불필요)


