// 방문자 수 관리 유틸리티
// localStorage를 사용한 간단한 방문자 카운터

const VISITOR_COUNT_KEY = 'portfolio_visitor_count';
const VISITOR_ID_KEY = 'portfolio_visitor_id';

// 고유 방문자 ID 생성 또는 가져오기
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

// 방문자 수 가져오기
export function getVisitorCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const count = localStorage.getItem(VISITOR_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

// 방문자 수 증가 (새로운 방문자만)
export function incrementVisitorCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const sessionKey = 'portfolio_session_counted';
  const alreadyCounted = sessionStorage.getItem(sessionKey);
  
  if (!alreadyCounted) {
    const currentCount = getVisitorCount();
    const newCount = currentCount + 1;
    localStorage.setItem(VISITOR_COUNT_KEY, newCount.toString());
    sessionStorage.setItem(sessionKey, 'true');
    return newCount;
  }
  
  return getVisitorCount();
}

// 방문자 수 초기화 (관리자용)
export function resetVisitorCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VISITOR_COUNT_KEY, '0');
}

// 방문 기록 저장 (선택적)
export interface VisitRecord {
  id: string;
  timestamp: string;
  page: string;
}

const VISIT_RECORDS_KEY = 'portfolio_visit_records';

export function recordVisit(page: string = '/'): void {
  if (typeof window === 'undefined') return;
  
  const records = getVisitRecords();
  const newRecord: VisitRecord = {
    id: getVisitorId(),
    timestamp: new Date().toISOString(),
    page,
  };
  
  // 최근 100개 기록만 유지
  const updatedRecords = [newRecord, ...records].slice(0, 100);
  localStorage.setItem(VISIT_RECORDS_KEY, JSON.stringify(updatedRecords));
}

export function getVisitRecords(): VisitRecord[] {
  if (typeof window === 'undefined') return [];
  
  const records = localStorage.getItem(VISIT_RECORDS_KEY);
  return records ? JSON.parse(records) : [];
}


