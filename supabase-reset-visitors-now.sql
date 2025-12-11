-- =====================================================
-- 방문자 데이터 초기화 스크립트 (현재 시점 기준)
-- 이 SQL 실행 시점 이전의 모든 방문자 데이터 삭제
-- =====================================================

-- 기존 방문자 데이터 모두 삭제
DELETE FROM visitors;

-- 방문자 카운트를 0으로 초기화
UPDATE visitor_count 
SET count = 0, updated_at = NOW()
WHERE id = 'global';

-- 결과 확인
SELECT 
  (SELECT COUNT(*) FROM visitors) as visitor_records,
  (SELECT count FROM visitor_count WHERE id = 'global') as visitor_count,
  NOW() as reset_time;


