-- =====================================================
-- 방문자 데이터 확인 및 삭제 스크립트
-- 2024년 12월 10일 오전 7시(KST) 이전 데이터 모두 삭제
-- 한국 시간 2024-12-10 07:00:00 = UTC 2024-12-09 22:00:00
-- =====================================================

-- 1단계: 삭제 전 확인
SELECT 
  '삭제 전 데이터' as status,
  COUNT(*) as total_visitors,
  COUNT(*) FILTER (WHERE first_visit < '2024-12-09T22:00:00Z') as will_be_deleted,
  MIN(first_visit) as earliest_visit,
  MAX(last_visit) as latest_visit
FROM visitors;

-- 2단계: 12월 10일 오전 7시 이전 데이터 삭제
DELETE FROM visitors
WHERE first_visit < '2024-12-09T22:00:00Z';

-- 3단계: 관리자/테스트 방문자 삭제
DELETE FROM visitors
WHERE visitor_id LIKE '%admin%' OR visitor_id LIKE '%test%';

-- 4단계: 방문자 카운트 초기화 (있다면)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitor_count') THEN
    UPDATE visitor_count
    SET count = 0, updated_at = NOW()
    WHERE id = 'global';
  END IF;
END $$;

-- 5단계: 삭제 후 확인
SELECT 
  '삭제 후 데이터' as status,
  COUNT(*) as total_visitors,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  SUM(visit_count) as total_visits,
  MIN(first_visit) as earliest_visit,
  MAX(last_visit) as latest_visit
FROM visitors;


