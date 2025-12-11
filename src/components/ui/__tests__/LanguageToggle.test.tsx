/**
 * LanguageToggle 컴포넌트 테스트
 * 
 * 테스트 케이스:
 * 1. 정상 케이스: 언어 토글 기능, 초기 상태 렌더링
 * 2. 경계 케이스: 로딩 상태 처리
 * 3. 사용자 인터랙션: 클릭 이벤트 처리
 */

import { render, screen, fireEvent } from '@testing-library/react'
import LanguageToggle from '../LanguageToggle'
import { LocaleProvider } from '@/context/LocaleContext'

// LocaleContext 모킹
jest.mock('@/context/LocaleContext', () => {
  const React = require('react')
  const { createContext, useContext, useState, useEffect } = React
  
  const LocaleContext = createContext({
    locale: 'ko',
    setLocale: jest.fn(),
    isLoaded: true,
  })

  const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
    const [locale, setLocale] = useState('ko')
    const [isLoaded, setIsLoaded] = useState(true)

    useEffect(() => {
      // 컴포넌트 마운트 시 로딩 완료 시뮬레이션
      const timer = setTimeout(() => setIsLoaded(true), 0)
      return () => clearTimeout(timer)
    }, [])

    return (
      <LocaleContext.Provider value={{ locale, setLocale, isLoaded }}>
        {children}
      </LocaleContext.Provider>
    )
  }

  const useLocale = () => useContext(LocaleContext)

  return {
    LocaleContext,
    LocaleProvider,
    useLocale,
  }
})

describe('LanguageToggle', () => {
  it('초기 상태에서 한국어(KO)가 활성화되어 렌더링됨', () => {
    render(
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    )

    const koLabel = screen.getByText('KO')
    const enLabel = screen.getByText('EN')

    expect(koLabel).toBeInTheDocument()
    expect(enLabel).toBeInTheDocument()
  })

  it('언어 토글 버튼 클릭 시 영어로 변경', () => {
    const { useLocale } = require('@/context/LocaleContext')
    const mockSetLocale = jest.fn()

    // 모킹된 useLocale 반환값 설정
    jest.spyOn(require('@/context/LocaleContext'), 'useLocale').mockReturnValue({
      locale: 'ko',
      setLocale: mockSetLocale,
      isLoaded: true,
    })

    render(
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    )

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)

    expect(mockSetLocale).toHaveBeenCalledWith('en')
  })

  it('영어 상태에서 한국어로 토글', () => {
    const { useLocale } = require('@/context/LocaleContext')
    const mockSetLocale = jest.fn()

    jest.spyOn(require('@/context/LocaleContext'), 'useLocale').mockReturnValue({
      locale: 'en',
      setLocale: mockSetLocale,
      isLoaded: true,
    })

    render(
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    )

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)

    expect(mockSetLocale).toHaveBeenCalledWith('ko')
  })

  it('로딩 중일 때 플레이스홀더 렌더링', () => {
    jest.spyOn(require('@/context/LocaleContext'), 'useLocale').mockReturnValue({
      locale: 'ko',
      setLocale: jest.fn(),
      isLoaded: false,
    })

    render(
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    )

    // 로딩 중에는 버튼 텍스트가 보이지 않아야 함
    expect(screen.queryByText('KO')).not.toBeInTheDocument()
    expect(screen.queryByText('EN')).not.toBeInTheDocument()
  })

  it('버튼이 클릭 가능한 상태로 렌더링됨', () => {
    jest.spyOn(require('@/context/LocaleContext'), 'useLocale').mockReturnValue({
      locale: 'ko',
      setLocale: jest.fn(),
      isLoaded: true,
    })

    render(
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    )

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeInTheDocument()
    expect(toggleButton).not.toBeDisabled()
  })
})

