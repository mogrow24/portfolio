import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 환경 변수에서 비밀번호 가져오기 (서버 사이드에서만 접근 가능)
// .env.local에 ADMIN_SECRET_CODE=7807 형태로 설정
const SECRET_CODE = process.env.ADMIN_SECRET_CODE || '7807';

// 간단한 해시 함수로 응답 토큰 생성
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 세션 저장소 (실제 프로덕션에서는 Redis 등 사용 권장)
const sessions = new Map<string, { createdAt: number }>();

// 만료된 세션 정리 (24시간)
function cleanExpiredSessions() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24시간
  
  sessions.forEach((value, key) => {
    if (now - value.createdAt > maxAge) {
      sessions.delete(key);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, action } = body;

    // 세션 검증 요청
    if (action === 'verify') {
      const token = body.token;
      if (!token) {
        return NextResponse.json({ success: false, error: 'Token required' }, { status: 401 });
      }

      cleanExpiredSessions();
      const session = sessions.get(token);
      
      if (session) {
        const elapsed = Date.now() - session.createdAt;
        if (elapsed < 24 * 60 * 60 * 1000) {
          return NextResponse.json({ success: true, valid: true });
        }
        sessions.delete(token);
      }
      
      return NextResponse.json({ success: true, valid: false });
    }

    // 로그인 요청
    if (!code) {
      return NextResponse.json(
        { success: false, error: '코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 브루트포스 공격 방지를 위한 약간의 지연
    await new Promise(resolve => setTimeout(resolve, 500));

    // 비밀번호 검증 (서버 사이드에서만 비교)
    if (code === SECRET_CODE) {
      cleanExpiredSessions();
      
      const token = generateToken();
      sessions.set(token, { createdAt: Date.now() });

      return NextResponse.json({
        success: true,
        token,
        message: '인증 성공'
      });
    }

    return NextResponse.json(
      { success: false, error: '잘못된 코드입니다.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 로그아웃
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (token) {
      sessions.delete(token);
    }

    return NextResponse.json({ success: true, message: '로그아웃 되었습니다.' });
  } catch {
    return NextResponse.json({ success: true });
  }
}


