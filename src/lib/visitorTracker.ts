/**
 * 방문자 추적 유틸리티
 * 개인정보를 저장하지 않고 통계 데이터만 수집합니다.
 */

export interface VisitorData {
  id: string; // 고유 ID (익명)
  referrer: string | null; // 유입 경로
  userAgent: string; // 브라우저/디바이스 정보
  visitCount: number; // 방문 횟수
  firstVisit: string; // 첫 방문 시간
  lastVisit: string; // 마지막 방문 시간
  totalDuration: number; // 총 체류 시간 (초)
  currentSessionStart: string; // 현재 세션 시작 시간
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'; // 디바이스 타입
  browser: string; // 브라우저 타입
}

// 로컬 스토리지 키
const VISITOR_ID_KEY = 'visitor_anonymous_id';
const VISITOR_DATA_KEY = 'visitor_data';
const SESSION_ID_KEY = 'visitor_session_id';

/**
 * 익명 방문자 ID 생성 또는 가져오기
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

/**
 * 디바이스 타입 감지
 */
function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  if (/desktop|windows|mac|linux/i.test(userAgent)) {
    return 'desktop';
  }
  return 'unknown';
}

/**
 * 브라우저 타입 감지 (더 정확한 감지)
 */
function detectBrowser(userAgent: string): string {
  if (!userAgent || userAgent.length === 0) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  
  // Edge를 먼저 체크 (Chrome과 함께 사용되는 경우가 있음)
  if (ua.includes('edg/') || ua.includes('edge/')) return 'Edge';
  
  // Opera (Chrome 기반이지만 먼저 체크)
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
  
  // Chrome (Safari보다 먼저 체크)
  if (ua.includes('chrome/') && !ua.includes('edg') && !ua.includes('opr')) {
    // Chrome Mobile도 구분
    if (ua.includes('mobile')) return 'Chrome Mobile';
    return 'Chrome';
  }
  
  // Safari (Chrome이 아닌 경우만)
  if (ua.includes('safari/') && !ua.includes('chrome') && !ua.includes('edg')) {
    if (ua.includes('mobile')) return 'Safari Mobile';
    return 'Safari';
  }
  
  // Firefox
  if (ua.includes('firefox/')) {
    if (ua.includes('mobile')) return 'Firefox Mobile';
    return 'Firefox';
  }
  
  // Samsung Internet
  if (ua.includes('samsungbrowser')) return 'Samsung Internet';
  
  // 네이버 웨일
  if (ua.includes('whale')) return 'Naver Whale';
  
  // 카카오톡 브라우저
  if (ua.includes('kakaotalk')) return 'KakaoTalk Browser';
  
  // 모바일 브라우저들
  if (ua.includes('micromessenger')) return 'WeChat Browser';
  if (ua.includes('qqbrowser')) return 'QQ Browser';
  
  // 기본값
  return 'Unknown';
}

/**
 * 방문자 데이터 로드
 */
export function loadVisitorData(): VisitorData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(VISITOR_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('방문자 데이터 로드 실패:', e);
  }
  return null;
}

/**
 * 방문자 데이터 저장
 */
export function saveVisitorData(data: VisitorData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(VISITOR_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('방문자 데이터 저장 실패:', e);
  }
}

/**
 * 세션 ID 가져오기 또는 생성
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * 새로운 방문 기록 생성
 * 같은 세션(같은 날짜)에서는 방문 횟수를 증가시키지 않음
 * 다른 날짜에 재방문 시 방문 횟수 증가
 */
export function createVisitorRecord(): VisitorData {
  const visitorId = getVisitorId();
  const now = new Date().toISOString();
  const userAgent = navigator.userAgent;
  
  const existing = loadVisitorData();
  
  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // 같은 날짜에 방문했는지 체크 (localStorage 사용하여 브라우저 재시작해도 유지)
  const lastVisitDateKey = `last_visit_date_${visitorId}`;
  const lastVisitDate = localStorage.getItem(lastVisitDateKey);
  
  if (existing && existing.id === visitorId) {
    // 기존 방문자 확인
    // 다른 날짜에 재방문한 경우 방문 횟수 증가
    const isDifferentDay = lastVisitDate !== today;
    
    // 다른 날짜이거나 첫 방문인 경우 방문 횟수 증가
    if (isDifferentDay || !lastVisitDate) {
      localStorage.setItem(lastVisitDateKey, today);
    }
    
    return {
      ...existing,
      visitCount: isDifferentDay && lastVisitDate ? existing.visitCount + 1 : existing.visitCount,
      lastVisit: now,
      currentSessionStart: now,
      referrer: document.referrer || null,
    };
  }
  
  // 신규 방문자
  localStorage.setItem(lastVisitDateKey, today);
  
  return {
    id: visitorId,
    referrer: document.referrer || null,
    userAgent,
    visitCount: 1,
    firstVisit: now,
    lastVisit: now,
    totalDuration: 0,
    currentSessionStart: now,
    deviceType: detectDeviceType(userAgent),
    browser: detectBrowser(userAgent),
  };
}

/**
 * 세션 종료 시 체류 시간 업데이트
 */
export function updateSessionDuration(): void {
  const data = loadVisitorData();
  if (!data) return;
  
  const sessionStart = new Date(data.currentSessionStart).getTime();
  const now = Date.now();
  const sessionDuration = Math.floor((now - sessionStart) / 1000); // 초 단위
  
  const updated: VisitorData = {
    ...data,
    totalDuration: data.totalDuration + sessionDuration,
  };
  
  saveVisitorData(updated);
}

/**
 * 서버에 방문 기록 전송 (관리자는 전송하지 않음)
 */
export async function sendVisitorRecord(data: VisitorData): Promise<void> {
  // 관리자 체크 - 관리자면 전송하지 않음
  if (typeof window !== 'undefined') {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const hasAdminToken = localStorage.getItem('admin_auth_token');
    
    if (isAdminPath || hasAdminToken) {
      // 관리자는 방문 기록 전송하지 않음
      return;
    }
  }

  try {
    await fetch('/api/visitors/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.id,
        referrer: data.referrer,
        userAgent: data.userAgent,
        visitCount: data.visitCount,
        firstVisit: data.firstVisit,
        lastVisit: data.lastVisit,
        totalDuration: data.totalDuration,
        deviceType: data.deviceType,
        browser: data.browser,
      }),
    });
  } catch (e) {
    console.error('방문 기록 전송 실패:', e);
  }
}

