import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface VisitorRecord {
  visitor_id: string;
  referrer: string | null;
  user_agent: string;
  visit_count: number;
  first_visit: string;
  last_visit: string;
  total_duration: number;
  device_type: string;
  browser: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 관리자 요청 체크 (헤더에서 admin_auth_token 확인)
    const adminToken = req.headers.get('x-admin-auth-token') || req.headers.get('authorization');
    if (adminToken) {
      // 관리자 요청은 무시
      return NextResponse.json({ success: true, message: 'Admin request ignored' });
    }

    // visitor_id에 관리자/테스트 패턴이 포함되어 있는지 체크 (추가 안전장치)
    if (body.id && (
      body.id.includes('admin') || 
      body.id.includes('test') ||
      body.id.includes('localhost') ||
      body.id.includes('127.0.0.1') ||
      body.id.includes('dev') ||
      body.id.includes('local')
    )) {
      return NextResponse.json({ success: true, message: 'Admin/test visitor ignored' });
    }
    
    // 환경 변수에서 사용자 기기 ID 가져오기 (테스트 제외용)
    const userDeviceId = process.env.USER_DEVICE_ID;
    if (userDeviceId && body.id === userDeviceId) {
      return NextResponse.json({ success: true, message: 'User device ID ignored' });
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Supabase가 설정되어 있으면 DB에 저장
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);

      // 기존 방문자 조회 (first_visit 유지하기 위해)
      const { data: existing } = await supabase
        .from('visitors')
        .select('first_visit, visit_count')
        .eq('visitor_id', body.id)
        .single();

      // 클라이언트가 보낸 visit_count 사용
      // 기존 방문자가 있고 클라이언트의 visit_count가 더 크거나 같으면 클라이언트 값 사용
      // (재방문으로 증가된 경우 반영)
      const visitCount = existing 
        ? Math.max(existing.visit_count, body.visitCount || 1)
        : (body.visitCount || 1);

      const record: VisitorRecord = {
        visitor_id: body.id,
        referrer: body.referrer || null,
        user_agent: body.userAgent || '',
        visit_count: visitCount,
        first_visit: existing?.first_visit || body.firstVisit || new Date().toISOString(),
        last_visit: body.lastVisit || new Date().toISOString(),
        total_duration: body.totalDuration || 0,
        device_type: body.deviceType || 'unknown',
        browser: body.browser || 'Unknown',
      };

      // 기존 방문자 업데이트 또는 신규 삽입
      const { error } = await supabase
        .from('visitors')
        .upsert(record, {
          onConflict: 'visitor_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('방문자 기록 저장 실패:', error);
        // 에러가 있어도 클라이언트에는 성공 응답 (로컬 스토리지 폴백)
      }

      return NextResponse.json({ success: true });
    }

    // Supabase가 없으면 성공 응답만 (로컬 스토리지 사용)
    return NextResponse.json({ success: true, message: 'Local storage fallback' });
  } catch (err: any) {
    console.error('방문자 추적 오류:', err);
    return NextResponse.json(
      { success: false, error: err?.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

