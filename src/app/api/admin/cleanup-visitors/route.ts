import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Supabase 환경 변수가 없습니다.' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { userVisitorId } = body;

    console.log('🧹 테스트 데이터 정리 시작...');

    // 1. 사용자의 visitor_id 삭제
    if (userVisitorId) {
      const { error: deleteUserError } = await supabase
        .from('visitors')
        .delete()
        .eq('visitor_id', userVisitorId);

      if (deleteUserError) {
        console.error('❌ 사용자 방문 기록 삭제 실패:', deleteUserError);
      } else {
        console.log('✅ 사용자 방문 기록 삭제 완료');
      }
    }

    // 2. 테스트 관련 visitor_id 삭제 (localhost, test, admin 포함)
    const { error: deleteTestError } = await supabase
      .from('visitors')
      .delete()
      .or(
        'visitor_id.ilike.%localhost%,visitor_id.ilike.%test%,visitor_id.ilike.%admin%,visitor_id.ilike.%127.0.0.1%',
      );

    if (deleteTestError) {
      console.error('❌ 테스트 방문 기록 삭제 실패:', deleteTestError);
    } else {
      console.log('✅ 테스트 방문 기록 삭제 완료');
    }

    // 3. visitor_count 재계산
    const { data: uniqueVisitors, error: uniqueError } = await supabase
      .from('visitors')
      .select('visitor_id', { count: 'exact' });

    if (uniqueError) {
      console.error('❌ 고유 방문자 수 계산 실패:', uniqueError);
      return NextResponse.json(
        { success: false, error: '방문자 수 계산 실패' },
        { status: 500 },
      );
    }

    const actualCount = uniqueVisitors?.length || 0;
    console.log(`📈 실제 고유 방문자 수: ${actualCount}명`);

    // visitor_count의 created_at 유지 (이미 있으면)
    const { data: existingCount } = await supabase
      .from('visitor_count')
      .select('created_at')
      .eq('id', 'global')
      .maybeSingle();

    const { error: updateError } = await supabase
      .from('visitor_count')
      .upsert({
        id: 'global',
        count: actualCount,
        created_at:
          existingCount?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error('❌ visitor_count 업데이트 실패:', updateError);
      return NextResponse.json(
        { success: false, error: 'visitor_count 업데이트 실패' },
        { status: 500 },
      );
    }

    console.log('✅ visitor_count 업데이트 완료');
    console.log(`   새로운 count: ${actualCount}`);

    return NextResponse.json({
      success: true,
      message: '테스트 데이터 정리 완료',
      newCount: actualCount,
      startDate: existingCount?.created_at
        ? new Date(existingCount.created_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 },
    );
  }
}

