// 방문자 수 관리 유틸리티
// Supabase + 서버 API를 사용하여 누적 카운트 유지 (배포 후에도 지속)

import { supabase, isSupabaseAvailable } from './supabase';

const LOCAL_VISITOR_COUNT_KEY = 'portfolio_visitor_count';
const VISITOR_ID_KEY = 'portfolio_visitor_id';
const SESSION_COUNTED_KEY = 'portfolio_session_counted';
const VISITOR_API_ENDPOINT = '/api/visitors';

// 고유 방문자 ID 생성 또는 가져오기
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    console.log('✅ 방문자 ID 생성:', visitorId);
  }
  return visitorId;
}

import { detectEnvironment } from './env-utils';

// API를 통해 서버 사이드 카운트 조회/증가 (배포 후에도 유지)
async function fetchCountFromApi(
  method: 'GET' | 'POST',
): Promise<{ count: number; startDate: string | null; environment?: string } | null> {
  if (typeof window === 'undefined') return null;

  const env = detectEnvironment();
  const endpoint = VISITOR_API_ENDPOINT;
  
  try {
    console.log(`📡 방문자 수 API 호출 시작 (${method}):`, {
      endpoint,
      environment: env,
    });
    
    // 타임아웃 설정 (10초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(endpoint, {
      method,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ 방문자 수 API ${method} 실패:`, {
        status: response.status,
        statusText: response.statusText,
        environment: env,
        endpoint,
      });
      return null;
    }

    try {
      const data = await response.json();
      
      // success가 false여도 count가 있으면 사용
      if (data && typeof data.count === 'number' && data.count >= 0) {
        console.log(`✅ 방문자 수 API ${method} 성공:`, {
          count: data.count,
          success: data.success,
          environment: data.environment || env,
          endpoint,
        });
        return {
          count: data.count,
          startDate: data.startDate || null,
          environment: data.environment || env,
        };
      } else if (data && data.success === false && data.error) {
        // 에러가 있지만 count가 있는 경우 사용
        console.warn(`⚠️ 방문자 수 API ${method} 에러 (count 사용 시도):`, {
          error: data.error,
          count: data.count,
          environment: env,
        });
        if (typeof data.count === 'number' && data.count >= 0) {
          return {
            count: data.count,
            startDate: data.startDate || null,
            environment: data.environment || env,
          };
        }
      }
      
      console.error('❌ 방문자 수 API 응답 형식 오류:', {
        data,
        environment: env,
        endpoint,
      });
      return null;
    } catch (parseError) {
      console.error('❌ 방문자 수 API JSON 파싱 실패:', {
        error: parseError,
        environment: env,
        endpoint,
      });
      return null;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ 방문자 수 API 호출 타임아웃:', {
        endpoint,
        environment: env,
      });
    } else {
      console.error('❌ 방문자 수 API 호출 실패:', {
        error: error.message || String(error),
        name: error.name,
        environment: env,
        endpoint,
      });
    }
    return null;
  }
}

// Supabase에서 방문자 수 가져오기 (클라이언트 직접 접근용 폴백)
async function getCountFromSupabase(): Promise<number | null> {
  if (!isSupabaseAvailable() || !supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 'global')
      .maybeSingle(); // 데이터 없을 때 에러 방지
    
    if (error) {
      if (error.code !== 'PGRST116') { // 데이터 없음이 아닌 에러
        console.warn('Supabase 방문자 수 조회 실패:', error);
      }
      return null;
    }
    
    if (data && typeof data.count === 'number' && data.count >= 0) {
      return data.count;
    }
    return null;
  } catch (err) {
    console.warn('Supabase 방문자 수 조회 예외:', err);
    return null;
  }
}

// Supabase에 방문자 수 저장 (클라이언트 폴백)
async function saveCountToSupabase(count: number): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) return false;
  
  try {
    const { error } = await supabase
      .from('visitor_count')
      .upsert({
        id: 'global',
        count,
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.warn('Supabase 방문자 수 저장 실패:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase 방문자 수 저장 예외:', err);
    return false;
  }
}

// 방문자 수 가져오기 (Supabase 우선, 로컬 캐시 사용)
export async function getVisitorCountAsync(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  // 1. 서버 API에서 조회 (배포 간에도 유지)
  const apiResult = await fetchCountFromApi('GET');
  if (apiResult !== null) {
    localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, apiResult.count.toString());
    if (apiResult.startDate) {
      localStorage.setItem('visitor_count_start_date', apiResult.startDate);
    }
    return apiResult.count;
  }

  // 2. Supabase 직접 조회 폴백
  const supabaseCount = await getCountFromSupabase();
  if (supabaseCount !== null && supabaseCount >= 0) {
    localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, supabaseCount.toString());
    return supabaseCount;
  }
  
  // 3. 로컬 스토리지에서 가져오기
  const localCount = localStorage.getItem(LOCAL_VISITOR_COUNT_KEY);
  return localCount ? parseInt(localCount, 10) : 0;
}

// 동기 버전 (캐시된 값 사용)
export function getVisitorCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(LOCAL_VISITOR_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

// 방문자 수 증가 (세션당 1회만)
export async function incrementVisitorCountAsync(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  // 이미 이 세션에서 카운트했는지 확인
  const alreadyCounted = sessionStorage.getItem(SESSION_COUNTED_KEY);
  if (alreadyCounted) {
    // 이미 카운트됨 - 로컬 스토리지에서 현재 값 반환 (서버 호출 최소화)
    const cachedCount = getVisitorCount();
    if (cachedCount > 0) {
      return cachedCount;
    }
    // 로컬 캐시가 0이면 서버에서 가져오기 시도 (단, 타임아웃 짧게)
    try {
      const apiResult = await fetchCountFromApi('GET');
      if (apiResult !== null && apiResult.count > 0) {
        try {
          localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, apiResult.count.toString());
          if (apiResult.startDate) {
            localStorage.setItem('visitor_count_start_date', apiResult.startDate);
          }
        } catch {
          // 저장 실패해도 값 반환
        }
        return apiResult.count;
      }
    } catch {
      // 실패해도 계속 진행
    }
    return cachedCount; // 최소한 캐시된 값 반환
  }
  
  // 서버 API 우선 증가 (POST)
  const apiResult = await fetchCountFromApi('POST');
  if (apiResult !== null && typeof apiResult.count === 'number' && apiResult.count >= 0) {
    // count가 0이어도 유효한 값 (첫 방문자일 수 있음)
    try {
      localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, apiResult.count.toString());
      if (apiResult.startDate) {
        localStorage.setItem('visitor_count_start_date', apiResult.startDate);
      }
      sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
      console.log('✅ 방문자 수 증가 성공:', apiResult.count);
      return apiResult.count;
    } catch (storageError) {
      console.warn('로컬 스토리지 저장 실패:', storageError);
      // 저장 실패해도 카운트는 반환
      sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
      return apiResult.count;
    }
  }

  // 서버 API 실패 시 폴백: 로컬에서 증가
  console.warn('⚠️ 서버 API 실패, 로컬 폴백 사용');
  const cached = getVisitorCount();
  const newCount = cached + 1;
  
  try {
    localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, newCount.toString());
    sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
    console.log('✅ 로컬 폴백으로 방문자 수 증가:', newCount);
    
    // Supabase 저장은 백그라운드에서 (실패해도 계속 진행)
    saveCountToSupabase(newCount).catch(err => {
      console.warn('Supabase 저장 실패 (무시):', err);
    });
    
    return newCount;
  } catch (storageError) {
    console.error('로컬 스토리지 저장 실패:', storageError);
    // 저장 실패해도 최소한 세션에 표시
    sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
    return newCount;
  }
}

// 동기 버전 (localStorage만 사용)
export function incrementVisitorCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const alreadyCounted = sessionStorage.getItem(SESSION_COUNTED_KEY);
  
  if (!alreadyCounted) {
    const count = localStorage.getItem(LOCAL_VISITOR_COUNT_KEY);
    const localCount = count ? parseInt(count, 10) : 0;
    const newLocalCount = localCount + 1;
    localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, newLocalCount.toString());
    sessionStorage.setItem(SESSION_COUNTED_KEY, 'true');
    
    // 백그라운드에서 Supabase 동기화
    saveCountToSupabase(newLocalCount);
    
    return newLocalCount;
  }
  
  return getVisitorCount();
}

// 방문자 수 초기화 (관리자용)
export async function resetVisitorCount(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_VISITOR_COUNT_KEY, '0');
  await saveCountToSupabase(0);
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
