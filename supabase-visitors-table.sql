-- =====================================================
-- 방문자 추적 테이블 생성 스크립트
-- Supabase SQL Editor에서 이 스크립트를 실행하세요
-- =====================================================

-- 8. 방문자 추적 테이블
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id VARCHAR(200) PRIMARY KEY,
  referrer TEXT,
  user_agent TEXT,
  visit_count INTEGER DEFAULT 1,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_duration INTEGER DEFAULT 0, -- 총 체류 시간 (초)
  device_type VARCHAR(50) DEFAULT 'unknown',
  browser VARCHAR(100) DEFAULT 'Unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 방문자 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_visit_count ON visitors(visit_count DESC);

-- 방문자 테이블 RLS (어드민만 조회 가능하도록 설정)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- 누구나 방문 기록 삽입 가능
CREATE POLICY "Anyone can insert visitor records"
  ON visitors FOR INSERT
  WITH CHECK (true);

-- 누구나 방문 기록 업데이트 가능 (upsert용)
CREATE POLICY "Anyone can update visitor records"
  ON visitors FOR UPDATE
  USING (true);

-- 조회는 Service Role Key를 통한 API에서만 가능 (어드민)
-- 일반 사용자는 조회 불가


