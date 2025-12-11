/**
 * Guestbook API 라우트 테스트
 * 
 * 테스트 케이스:
 * 1. 정상 케이스: 공개글/비밀글 작성 성공
 * 2. 경계 케이스: 필수 항목 누락, 빈 문자열
 * 3. 오류 케이스: Supabase 연결 실패, 잘못된 요청 형식
 */

import { POST } from '../route'

// NextRequest 모킹 헬퍼
function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as any
}

// Supabase 모킹
const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockSingle = jest.fn()

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: mockInsert,
    })),
  })),
}))

describe('Guestbook API Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    }
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('POST - 게스트북 메시지 작성', () => {
    const validMessage = {
      name: '테스트 사용자',
      message: '테스트 메시지입니다.',
      company: '테스트 회사',
      email: 'test@example.com',
      is_secret: false,
      allow_notification: true,
    }

    it('공개글 작성 성공', async () => {
      const mockData = {
        id: 'test-id',
        ...validMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        is_reply_locked: false,
      }

      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      })

      const request = createMockRequest(validMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.name).toBe(validMessage.name)
    })

    it('비밀글 작성 성공', async () => {
      const secretMessage = {
        ...validMessage,
        is_secret: true,
      }

      const mockData = {
        id: 'test-id',
        ...secretMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        is_reply_locked: true,
      }

      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      })

      const request = createMockRequest(secretMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.is_secret).toBe(true)
      expect(data.data.is_reply_locked).toBe(true)
    })

    it('이름 누락 시 에러 반환', async () => {
      const invalidMessage = {
        message: '테스트 메시지',
        // name 누락
      }

      const request = createMockRequest(invalidMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('이름과 메시지는 필수입니다.')
    })

    it('메시지 누락 시 에러 반환', async () => {
      const invalidMessage = {
        name: '테스트 사용자',
        // message 누락
      }

      const request = createMockRequest(invalidMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('이름과 메시지는 필수입니다.')
    })

    it('빈 문자열 처리', async () => {
      const invalidMessage = {
        name: '   ',
        message: '   ',
      }

      const request = createMockRequest(invalidMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('이름과 메시지는 필수입니다.')
    })

    it('잘못된 JSON 형식 처리', async () => {
      // 잘못된 JSON은 json() 메서드에서 에러 발생
      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('잘못된 요청 형식입니다.')
    })

    it('Supabase 설정 누락 시 에러', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co'

      const request = createMockRequest(validMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Supabase 설정')
    })

    it('Supabase 에러 처리 (중복 키)', async () => {
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: {
              code: '23505',
              message: 'duplicate key value',
            },
          }),
        }),
      })

      const request = createMockRequest(validMessage)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('중복된 메시지입니다.')
      expect(data.code).toBe('23505')
    })
  })
})

