// jest-dom의 커스텀 매처를 추가합니다
import '@testing-library/jest-dom'

// Web API polyfills for Node.js
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Request/Response polyfill - Next.js가 자체적으로 제공하므로 제거
// Next.js의 NextRequest를 사용하는 테스트는 별도 처리 필요

// 환경 변수 모킹
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.ADMIN_SECRET_CODE = '7807'
process.env.GMAIL_USER = 'test@example.com'
process.env.GMAIL_APP_PASSWORD = 'test-password'

// 전역 모킹 설정
global.fetch = jest.fn()

// Next.js 라우터 모킹
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// next-intl 모킹
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'ko',
}))

