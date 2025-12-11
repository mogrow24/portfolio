-- =====================================================
-- 게스트북 테이블에 visitor_id 컬럼 추가
-- 기존 테이블이 있는 경우 이 스크립트만 실행하면 됩니다
-- =====================================================

-- visitor_id 컬럼 추가 (없는 경우만)
ALTER TABLE guestbook 
ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(200);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_guestbook_visitor_id ON guestbook(visitor_id);


