const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공하여 next.config.js와 .env 파일을 로드합니다
  dir: './',
})

// Jest에 전달할 커스텀 설정을 추가합니다
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  // API 라우트 테스트는 Next.js 환경 문제로 일시 제외
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    // '/src/app/api/', // 필요시 주석 해제하여 API 테스트 제외
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

// createJestConfig는 이렇게 내보내는 것이 Next.js의 비동기 로딩과 호환되도록 보장합니다
module.exports = createJestConfig(customJestConfig)

