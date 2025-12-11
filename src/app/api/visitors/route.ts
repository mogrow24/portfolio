import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 간단한 환경 감지 (복잡한 검증 제거)
function getEnvironment(): string {
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VERCEL_URL) return 'vercel';
      if (process.env.NODE_ENV === 'development') return 'local';
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// 방문자 수를 서버에서 관리하여 배포 간에도 유지
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서비스 롤 키가 없을 때도 동작하도록 익명 키를 폴백으로 사용
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export async function GET() {
  try {
    const env = getEnvironment();
    
    // Supabase 클라이언트 확인
    if (!supabase) {
      const errorMsg = 'Supabase 환경 변수가 없습니다.';
      console.error('❌ Supabase 클라이언트 초기화 실패:', errorMsg);
      // 500 대신 200 반환 (에러 정보는 포함하되 클라이언트가 처리할 수 있도록)
      return NextResponse.json(
        { 
          success: false, 
          count: 1, 
          error: errorMsg,
          environment: env,
          debug: {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
        },
        { status: 200 },
      );
    }

    console.log('📊 방문자 수 조회 시작...');
    const { data, error } = await supabase
      .from('visitor_count')
      .select('count, created_at')
      .eq('id', 'global')
      .maybeSingle(); // 데이터 없을 때 에러 방지

    if (error) {
      console.error('❌ 방문자 수 조회 실패:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        environment: env,
      });
      
      // 데이터가 없으면 생성 시도 (하지만 기존 방문자 수는 유지)
      if (error.code === 'PGRST116') {
        console.log('⚠️ visitor_count 테이블에 데이터가 없습니다. 기존 값 유지...');
        // 초기화하지 않고 기존 값 유지 (방문자 수 보존)
        // 최소한 1명은 표시 (현재 방문자 포함)
        return NextResponse.json({
          success: true,
          count: 1, // 초기화하지 않고 최소값 표시
          startDate: null,
          environment: env,
          warning: '데이터가 없지만 기존 방문자 수는 유지됩니다.',
        });
      }
      
      // 에러가 발생해도 기존 값 유지 (0으로 초기화하지 않음)
      console.warn('⚠️ 방문자 수 조회 에러, 기존 값 유지:', error.message);
      return NextResponse.json({
        success: true,
        count: 1, // 초기화하지 않고 최소값 표시
        startDate: null,
        environment: env,
        error: error.message,
        warning: '기존 방문자 수는 유지됩니다.',
      });
    }

    // 데이터 검증 (0으로 초기화하지 않음)
    const count = data?.count;
    const isValidCount = typeof count === 'number' && count >= 0;
    // 유효하지 않으면 최소 1명 표시 (초기화하지 않음)
    const finalCount = isValidCount ? count : 1;

    // 시작일자 계산 (created_at이 있으면 그것을 사용, 없으면 null)
    let startDate: string | null = null;
    if (data?.created_at) {
      try {
        const date = new Date(data.created_at);
        if (!isNaN(date.getTime())) {
          startDate = date.toISOString().split('T')[0];
        }
      } catch (dateError) {
        console.warn('시작일자 파싱 실패:', dateError);
      }
    }

    console.log(`✅ 방문자 수 조회 성공: ${finalCount}명 (환경: ${env})`);
    return NextResponse.json({
      success: true,
      count: finalCount,
      startDate: startDate,
      environment: env,
    });
  } catch (error: any) {
    // 예외 발생 시에도 500이 아닌 200 반환 (클라이언트가 처리할 수 있도록)
    const errorMessage = error?.message || String(error) || '알 수 없는 오류';
    console.error('❌ 방문자 수 GET 예외:', {
      message: errorMessage,
      stack: error?.stack,
    });
    return NextResponse.json({
      success: false,
      count: 1, // 초기화하지 않음
      startDate: null,
      environment: 'unknown',
      error: errorMessage,
    }, { status: 200 });
  }
}

export async function POST() {
  try {
    const env = getEnvironment();
    
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
      // 500 대신 200 반환
      return NextResponse.json(
        { 
          success: false, 
          count: 1, // 초기화하지 않음
          error: 'Supabase 환경 변수가 없습니다.',
          environment: env,
        },
        { status: 200 },
      );
    }

    console.log('📈 방문자 수 증가 시작...');
    // 1차: RPC로 원자적 증가
    const { data: rpcData, error: rpcError } = await supabase.rpc('increment_visitor_count');

    if (!rpcError && typeof rpcData === 'number' && rpcData > 0) {
      console.log(`✅ RPC로 방문자 수 증가 성공: ${rpcData}명 (환경: ${env})`);
      // 시작일자 조회
      try {
        const { data: countData } = await supabase
          .from('visitor_count')
          .select('created_at')
          .eq('id', 'global')
          .maybeSingle();
        
        // created_at이 있으면 그것을 사용, 없으면 null (서비스 시작 전)
        let startDate: string | null = null;
        if (countData?.created_at) {
          try {
            const date = new Date(countData.created_at);
            if (!isNaN(date.getTime())) {
              startDate = date.toISOString().split('T')[0];
            }
          } catch (dateError) {
            console.warn('⚠️ 시작일자 파싱 실패:', dateError);
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          count: rpcData,
          startDate: startDate,
          environment: env,
        });
      } catch (queryError) {
        console.warn('⚠️ 시작일자 조회 실패 (RPC 성공):', queryError);
        return NextResponse.json({ 
          success: true, 
          count: rpcData,
          startDate: null,
          environment: env,
        });
      }
    } else if (rpcError) {
      console.warn('⚠️ RPC 실패, 직접 upsert 시도:', {
        error: rpcError.message,
        code: rpcError.code,
        environment: env,
      });
    }

    // 2차: RPC 실패 시 직접 upsert (기존 값 유지)
    let currentCount = 1; // 기본값을 1로 설정 (초기화 방지)
    let existingCreatedAt: string | null = null;
    
    try {
      // 현재 데이터 조회 (count와 created_at 모두)
      const { data: current, error: fetchError } = await supabase
        .from('visitor_count')
        .select('count, created_at')
        .eq('id', 'global')
        .maybeSingle(); // 데이터 없을 때 에러 방지

      if (fetchError) {
        console.warn('현재 방문자 수 조회 실패, 기존 값 유지:', fetchError);
        // 에러 발생 시 기존 값 유지 (초기화하지 않음)
      } else if (current) {
        if (typeof current.count === 'number' && current.count >= 0) {
          currentCount = current.count; // 기존 값 사용
        }
        if (current.created_at) {
          existingCreatedAt = current.created_at;
        }
      } else {
        // 데이터가 없어도 초기화하지 않고 최소값 유지
        console.warn('⚠️ 방문자 수 데이터 없음, 기존 값 유지');
        currentCount = 1; // 최소값 유지
      }
    } catch (fetchException) {
      console.warn('현재 방문자 수 조회 예외, 기존 값 유지:', fetchException);
      // 예외 발생 시에도 기존 값 유지
    }

    // 기존 값에 1 추가 (초기화하지 않음)
    const newCount = currentCount + 1;

    const upsertData: any = {
      id: 'global',
      count: newCount,
      updated_at: new Date().toISOString(),
    };

    // created_at이 없을 때만 설정 (첫 방문자일 때만)
    // 이미 created_at이 있으면 절대 변경하지 않음
    if (!existingCreatedAt) {
      // 첫 방문자이고 created_at이 없을 때만 설정
      upsertData.created_at = new Date().toISOString();
      console.log('✅ 첫 방문자 - created_at 설정:', upsertData.created_at);
    }

    const { error: upsertError, data: upsertedData } = await supabase
      .from('visitor_count')
      .upsert(upsertData, { onConflict: 'id' });

    if (upsertError) {
      console.error('❌ 방문자 수 upsert 실패:', {
        error: upsertError.message,
        code: upsertError.code,
        details: upsertError.details,
        environment: env,
      });
      // upsert 실패해도 현재 카운트 반환 시도 (500 대신 200)
      return NextResponse.json(
        { 
          success: false, 
          count: newCount, // 최소한 증가된 값 반환
          error: upsertError.message,
          environment: env,
        },
        { status: 200 },
      );
    }
    
    console.log(`✅ 방문자 수 upsert 성공: ${newCount}명 (환경: ${env})`);

    // 시작일자 조회
    let startDate: string | null = null;
    try {
      const { data: countData } = await supabase
        .from('visitor_count')
        .select('created_at')
        .eq('id', 'global')
        .maybeSingle();
      
      if (countData?.created_at) {
        try {
          const date = new Date(countData.created_at);
          if (!isNaN(date.getTime())) {
            startDate = date.toISOString().split('T')[0];
          }
        } catch (dateError) {
          console.warn('시작일자 파싱 실패:', dateError);
        }
      }
    } catch (queryError) {
      console.warn('시작일자 조회 실패:', queryError);
    }

    return NextResponse.json({ 
      success: true, 
      count: newCount,
      startDate: startDate,
      environment: env,
    });
  } catch (error: any) {
    // 예외 발생 시에도 500이 아닌 200 반환
    const errorMessage = error?.message || String(error) || '서버 오류가 발생했습니다.';
    console.error('❌ 방문자 수 POST 예외:', {
      message: errorMessage,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        success: false, 
        count: 1, // 초기화하지 않음
        error: errorMessage,
        environment: 'unknown',
      },
      { status: 200 },
    );
  }
}



