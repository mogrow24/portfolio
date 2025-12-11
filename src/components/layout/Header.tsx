'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LanguageToggle from '../ui/LanguageToggle';
import { useLocale } from '@/context/LocaleContext';

const navContent = {
  ko: {
    about: '소개',
    projects: '프로젝트',
    experience: '경력',
    interview: '인터뷰',
    qna: 'Q&A',
  },
  en: {
    about: 'About',
    projects: 'Projects',
    experience: 'Experience',
    interview: 'Interview',
    qna: 'Q&A',
  },
};

export default function Header() {
  const { locale } = useLocale();
  const t = navContent[locale as keyof typeof navContent] ?? navContent.ko;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(70);
  const [activeSection, setActiveSection] = useState('');
  const headerRef = useRef<HTMLElement>(null);

  // 헤더 높이 동적 측정 - ResizeObserver 사용
  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // 초기 높이 설정
    updateHeaderHeight();

    // ResizeObserver로 헤더 높이 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    resizeObserver.observe(headerRef.current);

    // 스크롤 시에도 높이 확인 (isScrolled로 인한 높이 변화)
    window.addEventListener('scroll', updateHeaderHeight);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateHeaderHeight);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [isScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // 현재 활성 섹션 감지 (모바일 메뉴용)
      const sections = navItems.map(item => item.href.replace('#', ''));
      const scrollPosition = window.scrollY + headerHeight + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(`#${sections[i]}`);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerHeight]);

  // 모바일 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: '#about', label: t.about },
    { href: '#projects', label: t.projects },
    { href: '#experience', label: t.experience },
    { href: '#interview', label: t.interview },
    { href: '#guest-book', label: t.qna },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      // 모바일 메뉴 닫기
      setIsMobileMenuOpen(false);
      
      // 헤더 높이 동적 계산 (ref 사용)
      const currentHeaderHeight = headerRef.current?.offsetHeight || headerHeight;
      
      // 스크롤 위치 계산
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const offsetPosition = absoluteElementTop - currentHeaderHeight - 10; // 여유 공간 10px 추가

      // 약간의 지연을 두어 모바일 메뉴 애니메이션이 완료된 후 스크롤
      setTimeout(() => {
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }, 150);
    }
  };

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-[rgba(17,17,17,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)]' 
          : 'py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* 로고 */}
          <motion.a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-lg md:text-xl font-extrabold tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            YUN <span className="text-[--accent-color]">JIHEE</span>
          </motion.a>

          {/* 데스크탑 네비게이션 */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="text-sm font-medium text-[--text-secondary] hover:text-[--accent-color] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <LanguageToggle />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg glass hover:bg-[--bg-tertiary] transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label="메뉴 열기/닫기"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[--accent-color]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </nav>
      </div>

      {/* 모바일 메뉴 - 개선된 UI */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            />
            {/* 메뉴 리스트 - 헤더 높이에 따라 동적 위치 조정 */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="fixed left-0 right-0 z-50 md:hidden"
              style={{ top: `${headerHeight}px` }}
            >
              <div className="mx-4 mb-4">
                <div className="glass rounded-2xl overflow-hidden border border-[--border-color] shadow-2xl">
                  <div className="py-1">
                    {navItems.map((item, index) => {
                      const isActive = activeSection === item.href;
                      return (
                        <motion.button
                          key={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(item.href);
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                          }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left px-6 py-4 text-base font-medium transition-all duration-200 relative ${
                            isActive
                              ? 'text-[--accent-color] bg-[--bg-tertiary]'
                              : 'text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]'
                          }`}
                        >
                          {/* 활성 표시 바 */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-[--accent-color] rounded-r-full"
                              initial={false}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
