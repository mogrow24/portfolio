/**
 * Email API 라우트 테스트
 * 
 * 테스트 케이스:
 * 1. 정상 케이스: 올바른 이메일 발송 요청
 * 2. 경계 케이스: 필수 항목 누락, 잘못된 이메일 형식
 * 3. 오류 케이스: 환경 변수 누락, 이메일 발송 실패
 */

import { POST } from '../route'

// NextRequest 모킹 헬퍼
function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as any
}

// nodemailer 모킹
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
    }),
  })),
}))

describe('Email API Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('POST - 이메일 발송', () => {
    const validEmailRequest = {
      to: 'test@example.com',
      name: '테스트 사용자',
      question: '테스트 질문입니다.',
      answer: '테스트 답변입니다.',
      isLocked: false,
    }

    it('올바른 요청으로 이메일 발송 성공 (프로덕션 환경)', async () => {
      process.env.GMAIL_USER = 'test@gmail.com'
      process.env.GMAIL_APP_PASSWORD = 'test-app-password'
      process.env.NODE_ENV = 'production'

      const request = createMockRequest(validEmailRequest)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.messageId).toBeDefined()
    })

    it('개발 환경에서 이메일 시뮬레이션', async () => {
      process.env.NODE_ENV = 'development'
      // Gmail 환경 변수 없음

      const request = createMockRequest(validEmailRequest)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.simulated).toBe(true)
    })

    it('필수 항목 누락 시 에러 반환', async () => {
      const invalidRequest = {
        to: 'test@example.com',
        // name, question, answer 누락
      }

      const request = createMockRequest(invalidRequest)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('필수 항목이 누락되었습니다.')
    })

    it('잘못된 이메일 형식 검증', async () => {
      const invalidEmailRequest = {
        ...validEmailRequest,
        to: 'invalid-email',
      }

      const request = createMockRequest(invalidEmailRequest)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('올바른 이메일 형식이 아닙니다.')
    })

    it('프로덕션 환경에서 환경 변수 누락 시 에러', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.GMAIL_USER
      delete process.env.GMAIL_APP_PASSWORD

      const request = createMockRequest(validEmailRequest)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('이메일 서버가 설정되지 않았습니다.')
    })

    it('비공개 답변 포함 이메일 발송', async () => {
      process.env.GMAIL_USER = 'test@gmail.com'
      process.env.GMAIL_APP_PASSWORD = 'test-app-password'
      process.env.NODE_ENV = 'production'

      const lockedRequest = {
        ...validEmailRequest,
        isLocked: true,
      }

      const request = createMockRequest(lockedRequest)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

