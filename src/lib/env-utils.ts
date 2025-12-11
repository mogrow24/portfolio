/**
 * 환경 변수 검증 및 환경 감지 유틸리티
 * 테스트 서버와 실 서버를 구분하고 환경 변수를 검증합니다.
 */

export type Environment = 'local' | 'vercel' | 'unknown';

/**
 * 현재 실행 환경 감지
 * 서버 사이드와 클라이언트 사이드 모두에서 안전하게 작동
 */
export function detectEnvironment(): Environment {
  try {
    // 클라이언트 사이드
    if (typeof window !== 'undefined') {
      try {
        const hostname = window.location?.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'local';
        }
        if (hostname?.includes('vercel.app') || hostname?.includes('vercel.com')) {
          return 'vercel';
        }
        return 'unknown';
      } catch (e) {
        // window.location 접근 실패 시 서버 사이드 로직 사용
      }
    }
    
    // 서버 사이드
    try {
      const vercelUrl = process.env.VERCEL_URL;
      const nodeEnv = process.env.NODE_ENV;
      
      if (vercelUrl) {
        return 'vercel';
      }
      if (nodeEnv === 'development') {
        return 'local';
      }
    } catch (e) {
      // process.env 접근 실패 시
    }
    
    return 'unknown';
  } catch (e) {
    // 모든 예외 처리
    return 'unknown';
  }
}

/**
 * Supabase 환경 변수 검증
 */
export interface EnvValidationResult {
  valid: boolean;
  env: Environment;
  errors: string[];
  warnings: string[];
}

export function validateSupabaseEnv(): EnvValidationResult {
  try {
    const env = detectEnvironment();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 서버 사이드에서만 환경 변수 접근 (클라이언트에서는 undefined)
    const supabaseUrl = typeof process !== 'undefined' && process.env 
      ? process.env.NEXT_PUBLIC_SUPABASE_URL 
      : undefined;
    const serviceKey = typeof process !== 'undefined' && process.env 
      ? process.env.SUPABASE_SERVICE_ROLE_KEY 
      : undefined;
    const anonKey = typeof process !== 'undefined' && process.env 
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      : undefined;
  
  // 필수 환경 변수 검증
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  } else if (supabaseUrl === 'https://your-project.supabase.co') {
    errors.push('NEXT_PUBLIC_SUPABASE_URL이 기본값으로 설정되어 있습니다.');
  }
  
  if (!serviceKey && !anonKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  }
  
  // 경고: 서비스 롤 키가 없으면 익명 키 사용 (권한 제한 가능)
  if (!serviceKey && anonKey) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY가 없어 익명 키를 사용합니다. 일부 기능이 제한될 수 있습니다.');
  }
  
  // 환경별 추가 검증
  if (env === 'vercel' && !supabaseUrl) {
    errors.push('Vercel 배포 환경에서 Supabase URL이 설정되지 않았습니다.');
  }
  
    return {
      valid: errors.length === 0,
      env,
      errors,
      warnings,
    };
  } catch (e) {
    // 예외 발생 시 기본값 반환
    return {
      valid: false,
      env: 'unknown',
      errors: ['환경 변수 검증 중 오류가 발생했습니다.'],
      warnings: [],
    };
  }
}

/**
 * 환경 변수 검증 결과 로깅
 * 서버 사이드에서도 안전하게 작동하도록 console.group 대신 일반 로그 사용
 */
export function logEnvValidation(result: EnvValidationResult): void {
  try {
    const { valid, env, errors, warnings } = result;
    
    // 서버 사이드에서 console.group이 문제를 일으킬 수 있으므로 일반 로그 사용
    // 서버 사이드에서만 로깅 (클라이언트에서는 조용히 처리)
    if (typeof window === 'undefined') {
      console.log(`🔍 환경 변수 검증 (환경: ${env})`);
      
      if (valid) {
        console.log('✅ 모든 환경 변수가 올바르게 설정되었습니다.');
      } else {
        console.error('❌ 환경 변수 검증 실패:');
        errors.forEach(error => console.error(`  - ${error}`));
      }
      
      if (warnings.length > 0) {
        console.warn('⚠️ 경고:');
        warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
    }
  } catch (e) {
    // 로깅 실패 시 조용히 처리
  }
}

