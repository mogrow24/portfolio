import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 어드민용 게스트북 조회 API
 * Service Role Key를 사용하여 비밀글을 포함한 모든 메시지를 조회합니다.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // 어드민 인증 확인 (선택적 - 필요시 활성화)
    // const token = request.headers.get('x-admin-token');
    // if (!token) {
    //   return NextResponse.json(
    //     { error: '인증이 필요합니다.' },
    //     { status: 401 }
    //   );
    // }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase 설정 누락:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceKey,
        url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '없음',
      });
      return NextResponse.json(
        { error: 'Supabase 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      );
    }

    // Service Role Key를 사용하여 RLS 우회
    const supabase = createClient(supabaseUrl, serviceKey);

    // 비밀글을 포함한 모든 메시지 조회
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게스트북 조회 실패:', error);
      return NextResponse.json(
        { error: '메시지 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error('게스트북 조회 예외:', err);
    return NextResponse.json(
      { error: err?.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

