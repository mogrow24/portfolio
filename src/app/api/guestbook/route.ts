import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 비밀글은 익명 사용자 SELECT가 막히므로 서버 사이드(Service Role)에서 삽입 처리
export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 환경 변수 확인 (더 명확한 체크)
    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase 설정 누락:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceKey,
        url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '없음',
        keyLength: serviceKey ? serviceKey.length : 0,
      });
      return NextResponse.json(
        { error: 'Supabase 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      );
    }

    // 기본값 체크 (로컬 개발 환경에서만 경고)
    if (supabaseUrl.includes('your-project.supabase.co') && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase URL이 기본값입니다. 환경 변수를 설정해주세요.');
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('요청 본문 파싱 실패:', parseError);
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const name = (body?.name || '').trim();
    const message = (body?.message || '').trim();

    if (!name || !message) {
      return NextResponse.json(
        { error: '이름과 메시지는 필수입니다.' },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = createClient(supabaseUrl, serviceKey);
    } catch (clientError: any) {
      console.error('Supabase 클라이언트 생성 실패:', clientError);
      return NextResponse.json(
        { error: '데이터베이스 연결에 실패했습니다.' },
        { status: 500 }
      );
    }

    const payload = {
      name,
      company: body?.company?.trim() || null,
      email: body?.email?.trim() || null,
      message,
      message_en: body?.message_en?.trim() || null,
      allow_notification: !!body?.allow_notification,
      is_secret: !!body?.is_secret,
      is_read: false,
      is_reply_locked: !!body?.is_secret, // 비밀글이면 답변도 비공개로 설정
      visitor_id: body?.visitor_id || null, // 방문자 ID 추가
    };

    // 비밀글의 경우: Service Role을 사용하므로 RLS를 우회하여 select 가능
    // insert 후 select로 데이터 반환하여 프론트에서 표시 가능하도록 함
    if (payload.is_secret) {
      const { data, error } = await supabase
        .from('guestbook')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('비밀글 insert 실패:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        
        let userMessage = '메시지 저장에 실패했습니다.';
        if (error.code === '23505') {
          userMessage = '중복된 메시지입니다.';
        } else if (error.code === '23503') {
          userMessage = '데이터베이스 제약 조건 오류가 발생했습니다.';
        } else if (error.message) {
          userMessage = error.message;
        }
        
        return NextResponse.json(
          { error: userMessage, code: error.code },
          { status: 500 }
        );
      }

      // 비밀글도 데이터 반환 (Service Role이므로 가능)
      console.log('✅ 비밀글 저장 및 반환 성공:', {
        id: data?.id,
        name: data?.name,
        is_secret: data?.is_secret,
        message_length: data?.message?.length
      });
      
      return NextResponse.json({
        success: true,
        data,
        is_secret: true,
      });
    }

    // 공개글의 경우: insert 후 select로 데이터 반환
    const { data, error } = await supabase
      .from('guestbook')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('공개글 insert 실패:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      let userMessage = '메시지 저장에 실패했습니다.';
      if (error.code === '23505') {
        userMessage = '중복된 메시지입니다.';
      } else if (error.code === '23503') {
        userMessage = '데이터베이스 제약 조건 오류가 발생했습니다.';
      } else if (error.message) {
        userMessage = error.message;
      }
      
      return NextResponse.json(
        { error: userMessage, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('guestbook insert 예외:', err);
    return NextResponse.json(
      { error: err?.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
