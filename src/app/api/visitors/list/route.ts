import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, data: [], error: 'Supabase 설정이 필요합니다.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 오늘 오전 7시(KST) 이후 데이터만 조회
    // 한국 시간 오늘 07:00:00 = UTC 어제 22:00:00 (KST는 UTC+9)
    const today = new Date();
    const todayKST = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    todayKST.setHours(7, 0, 0, 0); // 오늘 오전 7시 KST
    
    // UTC로 변환 (KST - 9시간)
    const cutoffDateUTC = new Date(todayKST.getTime() - 9 * 60 * 60 * 1000);
    const cutoffDate = cutoffDateUTC.toISOString();
    
    // 방문자 목록 조회 (오늘 오전 7시 이후만)
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .gte('first_visit', cutoffDate) // 오늘 오전 7시 이후 첫 방문 데이터만
      .not('visitor_id', 'like', '%admin%') // 관리자 방문자 제외
      .not('visitor_id', 'like', '%test%') // 테스트 방문자 제외
      .order('last_visit', { ascending: false });

    if (error) {
      console.error('방문자 목록 조회 실패:', error);
      // 에러가 발생해도 빈 배열 반환 (데이터 없음으로 처리)
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error('방문자 목록 조회 예외:', err);
    return NextResponse.json(
      { success: false, data: [], error: err?.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

