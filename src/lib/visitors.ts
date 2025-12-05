// 방문자 수 관리 유틸리티
// Supabase를 우선 사용, 폴백으로 localStorage

import { api, isSupabaseAvailable } from './supabase';

const VISITOR_COUNT_KEY = 'portfolio_visitor_count';
const VISITOR_ID_KEY = 'portfolio_visitor_id';
const SESSION_COUNTED_KEY = 'portfolio_session_counted';

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

// 방문자 수 가져오기 (Supabase 우선)
export async function getVisitorCountAsync(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  // Supabase 사용 가능하면 전역 카운터 조회
  if (isSupabaseAvailable()) {
    try {
      const count = await api.getVisitorCount();
      if (count > 0) {
        // 로컬에도 캐시
        localStorage.setItem(VISITOR_COUNT_KEY, count.toString());
        return count;
      }
    } catch (error) {
      console.warn('Supabase 방문자 수 조회 실패:', error);
    }
  }
  
  // 폴백: localStorage
  const count = localStorage.getItem(VISITOR_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

// 동기 버전 (캐시된 값 사용)
export function getVisitorCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(VISITOR_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

// 방문자 수 증가 (새로운 방문자만)
export async function incrementVisitorCountAsync(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  // 이미 이 세션에서 카운트했는지 확인
  const alreadyCounted = sessionStorage.getItem(SESSION_COUNTED_KEY);
  if (alreadyCounted) {
    return getVisitorCount();
  }
  
  // Supabase 사용 가능하면 전역 카운터 증가
  if (isSupabaseAvailable()) {
    try {
      const newCount = await api.incrementVisitorCount();
      if (newCount > 0) {
        localStorage.setItem(VISITOR_COUNT_KEY, newCount.toString());
        sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
        return newCount;
      }
    } catch (error) {
      console.warn('Supabase 방문자 수 증가 실패:', error);
    }
  }
  
  // 폴백: localStorage
  const count = localStorage.getItem(VISITOR_COUNT_KEY);
  const localCount = count ? parseInt(count, 10) : 0;
  const newLocalCount = localCount + 1;
  localStorage.setItem(VISITOR_COUNT_KEY, newLocalCount.toString());
  sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
  return newLocalCount;
}

// 동기 버전 (localStorage만 사용)
export function incrementVisitorCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const sessionKey = 'portfolio_session_counted';
  const alreadyCounted = sessionStorage.getItem(sessionKey);
  
  if (!alreadyCounted) {
    const count = localStorage.getItem(VISITOR_COUNT_KEY);
    const localCount = count ? parseInt(count, 10) : 0;
    const newLocalCount = localCount + 1;
    localStorage.setItem(VISITOR_COUNT_KEY, newLocalCount.toString());
    sessionStorage.setItem(sessionKey, 'true');
    return newLocalCount;
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
