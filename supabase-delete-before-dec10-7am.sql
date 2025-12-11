-- =====================================================
-- 방문자 데이터 삭제 스크립트 (12월 10일 오전 7시 이전)
-- 한국 시간 2024-12-10 07:00:00 = UTC 2024-12-09 22:00:00
-- =====================================================

-- 12월 10일 오전 7시 이전 데이터 모두 삭제
DELETE FROM visitors
WHERE first_visit < '2024-12-09T22:00:00Z';

-- 관리자/테스트 방문자도 삭제 (visitor_id에 admin 또는 test 포함)
DELETE FROM visitors
WHERE visitor_id LIKE '%admin%' OR visitor_id LIKE '%test%';

-- 방문자 카운트를 0으로 초기화 (있다면)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitor_count') THEN
    UPDATE visitor_count
    SET count = 0, updated_at = NOW()
    WHERE id = 'global';
  END IF;
END $$;


