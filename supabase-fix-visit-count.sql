-- =====================================================
-- 방문자 visit_count를 모두 1로 수정
-- 고유 방문자 = 방문자 수가 동일하도록
-- =====================================================

-- 모든 방문자의 visit_count를 1로 업데이트
UPDATE visitors 
SET visit_count = 1
WHERE visit_count > 1;

-- 결과 확인
SELECT 
  COUNT(*) as total_visitors,
  SUM(visit_count) as total_visits,
  CASE 
    WHEN COUNT(*) = SUM(visit_count) THEN '✅ 일치'
    ELSE '❌ 불일치'
  END as status
FROM visitors;


