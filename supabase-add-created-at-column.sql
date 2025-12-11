-- visitor_count 테이블에 created_at 컬럼 추가 (기존 데이터베이스 마이그레이션용)
-- 이미 created_at이 있으면 실행하지 않아도 됩니다.

-- 컬럼 추가 (이미 있으면 에러 발생하지 않음)
ALTER TABLE visitor_count 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 기존 데이터에 created_at이 없으면 updated_at 값을 사용하여 설정
UPDATE visitor_count 
SET created_at = updated_at 
WHERE created_at IS NULL;

-- 기본값 설정
ALTER TABLE visitor_count 
ALTER COLUMN created_at SET DEFAULT NOW();

