// 이메일 발송 클라이언트 유틸리티

interface EmailResult {
  success: boolean;
  error?: string;
  simulated?: boolean;
}

interface ReplyEmailParams {
  to: string;           // 수신자 이메일
  name: string;         // 질문자 이름
  question: string;     // 원본 질문
  answer: string;       // 답변 내용
  isLocked: boolean;    // 비공개 여부
}

/**
 * 답변 알림 이메일 발송
 * @param params 이메일 발송 파라미터
 * @returns 발송 결과
 */
export async function sendReplyEmail(params: ReplyEmailParams): Promise<EmailResult> {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    return { success: false, error: '이메일 발송 요청 실패' };
  }
}


