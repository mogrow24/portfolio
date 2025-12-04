import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Gmail SMTP 이메일 발송 API
// 환경 변수 설정 필요:
// - GMAIL_USER: Gmail 주소
// - GMAIL_APP_PASSWORD: Gmail 앱 비밀번호 (16자리)

interface EmailRequest {
  to: string;           // 수신자 이메일
  name: string;         // 질문자 이름
  question: string;     // 원본 질문
  answer: string;       // 답변 내용
  isLocked: boolean;    // 비공개 여부
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { to, name, question, answer, isLocked } = body;

    // 입력 검증
    if (!to || !name || !question || !answer) {
      return NextResponse.json(
        { success: false, error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 환경 변수 확인
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      console.warn('Gmail 환경 변수가 설정되지 않았습니다.');
      
      // 개발 환경에서는 시뮬레이션
      if (process.env.NODE_ENV === 'development') {
        console.log('=== 이메일 발송 시뮬레이션 ===');
        console.log(`수신자: ${to}`);
        console.log(`제목: [윤지희 포트폴리오] 질문에 대한 답변이 도착했습니다`);
        console.log('===========================');
        
        return NextResponse.json({
          success: true,
          message: '개발 환경: 이메일 발송이 시뮬레이션되었습니다.',
          simulated: true,
        });
      }
      
      return NextResponse.json(
        { success: false, error: '이메일 서버가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Gmail SMTP 트랜스포터 생성
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // 이메일 발송
    const info = await transporter.sendMail({
      from: `윤지희 포트폴리오 <${gmailUser}>`,
      to: to,
      subject: '[윤지희 포트폴리오] 질문에 대한 답변이 도착했습니다',
      html: generateEmailHTML(name, question, answer, isLocked),
    });

    console.log('이메일 발송 성공:', info.messageId);

    return NextResponse.json({
      success: true,
      message: '이메일이 발송되었습니다.',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('이메일 발송 에러:', error);
    return NextResponse.json(
      { success: false, error: '이메일 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 이메일 HTML 생성
function generateEmailHTML(name: string, question: string, answer: string, isLocked: boolean): string {
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
          <!-- 헤더 -->
          <tr>
            <td style="background: linear-gradient(135deg, #00dfc0 0%, #00b89c 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">
                💬 답변이 도착했습니다
              </h1>
            </td>
          </tr>
          
          <!-- 인사말 -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                안녕하세요, ${name}님!
              </p>
              <p style="margin: 10px 0 0; color: #999; font-size: 14px;">
                남겨주신 질문에 대한 답변을 드립니다.
              </p>
            </td>
          </tr>
          
          <!-- 질문 섹션 -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background-color: #252525; border-radius: 12px; padding: 20px; border-left: 4px solid #666;">
                <p style="margin: 0 0 10px; color: #00dfc0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  📝 내 질문
                </p>
                <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${question}</p>
              </div>
            </td>
          </tr>
          
          <!-- 답변 섹션 -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: rgba(0, 223, 192, 0.1); border-radius: 12px; padding: 20px; border-left: 4px solid #00dfc0;">
                <p style="margin: 0 0 10px; color: #00dfc0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  💡 답변 ${isLocked ? '(비공개)' : '(공개)'}
                </p>
                <p style="margin: 0; color: #fff; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${answer}</p>
              </div>
            </td>
          </tr>
          
          <!-- CTA 버튼 -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-portfolio.com'}#guest-book" 
                 style="display: inline-block; background-color: #00dfc0; color: #000; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 14px;">
                포트폴리오에서 확인하기 →
              </a>
            </td>
          </tr>
          
          <!-- 푸터 -->
          <tr>
            <td style="background-color: #151515; padding: 25px 30px; border-top: 1px solid #2a2a2a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #666; font-size: 12px;">
                      이 메일은 <strong style="color: #00dfc0;">윤지희 포트폴리오</strong> Guest Book에서 발송되었습니다.
                    </p>
                    <p style="margin: 8px 0 0; color: #555; font-size: 11px;">
                      발송일: ${currentDate}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- 하단 안내 -->
        <p style="margin: 20px 0 0; color: #555; font-size: 11px; text-align: center;">
          본 메일은 발신 전용입니다. 추가 문의는 포트폴리오 사이트를 이용해주세요.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
