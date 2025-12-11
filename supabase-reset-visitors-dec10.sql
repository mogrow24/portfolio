-- =====================================================
-- 방문자 데이터 초기화 스크립트
-- 2024년 12월 10일 배포 이후 데이터만 유지
-- =====================================================

-- 12월 10일 이전 데이터 모두 삭제
DELETE FROM visitors 
WHERE first_visit < '2024-12-10T00:00:00Z';

-- 방문자 카운트를 0으로 초기화
UPDATE visitor_count 
SET count = 0, updated_at = NOW()
WHERE id = 'global';

-- 결과 확인
SELECT 
  (SELECT COUNT(*) FROM visitors) as visitor_records,
  (SELECT count FROM visitor_count WHERE id = 'global') as visitor_count,
  (SELECT COUNT(DISTINCT visitor_id) FROM visitors) as unique_visitors,
  (SELECT SUM(visit_count) FROM visitors) as total_visits,
  '2024-12-10T00:00:00Z' as cutoff_date;


