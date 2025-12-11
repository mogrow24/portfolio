/**
 * Auth API 라우트 테스트
 * 
 * 테스트 케이스:
 * 1. 정상 케이스: 올바른 코드로 로그인 성공
 * 2. 경계 케이스: 잘못된 코드로 로그인 실패
 * 3. 오류 케이스: 코드 누락, 세션 검증, 로그아웃
 */

import { POST, DELETE } from '../route'

// 환경 변수 설정
process.env.ADMIN_SECRET_CODE = '7807'

// NextRequest 모킹 헬퍼
function createMockRequest(body: any, method: string = 'POST') {
  return {
    json: async () => body,
    method,
  } as any
}

describe('Auth API Route', () => {
  beforeEach(() => {
    // 각 테스트 전에 fetch 모킹 초기화
    jest.clearAllMocks()
  })

  describe('POST - 로그인', () => {
    it('올바른 코드로 로그인 성공', async () => {
      const request = createMockRequest({ code: '7807' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.token).toBeDefined()
      expect(typeof data.token).toBe('string')
      expect(data.token.length).toBeGreaterThan(0)
    })

    it('잘못된 코드로 로그인 실패', async () => {
      const request = createMockRequest({ code: 'wrong-code' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('잘못된 코드입니다.')
    })

    it('코드 누락 시 에러 반환', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('코드를 입력해주세요.')
    })

    it('세션 검증 성공', async () => {
      // 먼저 로그인하여 토큰 획득
      const loginRequest = createMockRequest({ code: '7807' })

      const loginResponse = await POST(loginRequest)
      const loginData = await loginResponse.json()
      const token = loginData.token

      // 세션 검증
      const verifyRequest = createMockRequest({ action: 'verify', token })

      const verifyResponse = await POST(verifyRequest)
      const verifyData = await verifyResponse.json()

      expect(verifyResponse.status).toBe(200)
      expect(verifyData.success).toBe(true)
      expect(verifyData.valid).toBe(true)
    })

    it('세션 검증 실패 (토큰 없음)', async () => {
      const request = createMockRequest({ action: 'verify' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Token required')
    })
  })

  describe('DELETE - 로그아웃', () => {
    it('토큰으로 로그아웃 성공', async () => {
      // 먼저 로그인
      const loginRequest = createMockRequest({ code: '7807' })

      const loginResponse = await POST(loginRequest)
      const loginData = await loginResponse.json()
      const token = loginData.token

      // 로그아웃
      const logoutRequest = createMockRequest({ token }, 'DELETE')

      const logoutResponse = await DELETE(logoutRequest)
      const logoutData = await logoutResponse.json()

      expect(logoutResponse.status).toBe(200)
      expect(logoutData.success).toBe(true)
      expect(logoutData.message).toBe('로그아웃 되었습니다.')
    })

    it('토큰 없이도 로그아웃 성공 (에러 없음)', async () => {
      const request = createMockRequest({}, 'DELETE')

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

