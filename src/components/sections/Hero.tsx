'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { type ProfileData, DEFAULT_PROFILE, STORAGE_KEYS, SITE_DATA_UPDATED_EVENT } from '@/lib/siteData';

const heroContent = {
  ko: {
    scroll: '스크롤',
  },
  en: {
    scroll: 'Scroll',
  },
};

// 타이핑 텍스트 컴포넌트
const TypewriterText = ({ 
  text, 
  className = '', 
  delay = 0,
  speed = 50
}: { 
  text: string; 
  className?: string; 
  delay?: number;
  speed?: number;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, started, speed]);

  return (
    <span className={className}>
      {displayText}
      {started && displayText.length < text.length && (
        <span className="typing-cursor">|</span>
      )}
    </span>
  );
};

// 자동 크기 조정 텍스트 컴포넌트 (무한 루프 완전 방지)
const AutoFitText = ({ 
  text, 
  className = '', 
  maxLines = 2 
}: { 
  text: string; 
  className?: string; 
  maxLines?: number;
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const hasCalculatedRef = useRef(false); // 계산 완료 플래그

  useEffect(() => {
    // 이미 계산이 완료되었으면 재계산하지 않음
    if (hasCalculatedRef.current || !textRef.current || !containerRef.current || !text) {
      return;
    }

    const container = containerRef.current;
    const textElement = textRef.current;
    
    // 초기 크기 설정 (반응형 기준)
    const getBaseSize = () => {
      if (typeof window === 'undefined') return 64;
      const width = window.innerWidth;
      if (width >= 1024) return 64; // lg
      if (width >= 768) return 48;  // md
      if (width >= 640) return 40;  // sm
      return 32; // mobile
    };
    
    let baseSize = getBaseSize();
    let currentSize = baseSize;
    let animationFrameId: number | null = null;

    // 텍스트가 영역에 맞을 때까지 크기 줄이기 (한 번만 실행)
    const checkFit = () => {
      if (hasCalculatedRef.current) return;
      
      const fitCheck = () => {
        if (!textRef.current || !containerRef.current || hasCalculatedRef.current) {
          return;
        }

        const containerWidth = container.offsetWidth || container.clientWidth;
        if (!containerWidth) {
          animationFrameId = requestAnimationFrame(fitCheck);
          return;
        }

        // 임시 스타일 적용하여 크기 측정
        const originalDisplay = textElement.style.display;
        textElement.style.display = 'block';
        textElement.style.visibility = 'hidden';
        textElement.style.position = 'absolute';
        textElement.style.width = `${containerWidth}px`;
        textElement.style.fontSize = `${currentSize}px`;
        textElement.style.lineHeight = '1.1';
        textElement.style.whiteSpace = 'normal';
        
        // 실제 렌더링된 크기 확인
        const lineHeight = parseFloat(getComputedStyle(textElement).lineHeight) || currentSize * 1.1;
        const textHeight = textElement.scrollHeight;
        const maxHeight = lineHeight * maxLines;
        const textWidth = textElement.scrollWidth;
        
        // 원래 스타일 복원
        textElement.style.display = originalDisplay;
        textElement.style.visibility = '';
        textElement.style.position = '';
        textElement.style.width = '';
        textElement.style.whiteSpace = '';
        
        // 크기 조정 필요 여부 확인
        if ((textHeight > maxHeight || textWidth > containerWidth) && currentSize > 24) {
          currentSize -= 1;
          animationFrameId = requestAnimationFrame(fitCheck);
        } else {
          const finalSize = Math.max(24, currentSize);
          setFontSize(finalSize);
          hasCalculatedRef.current = true; // 계산 완료 표시
        }
      };

      // 레이아웃 완료 후 시작
      setTimeout(() => {
        fitCheck();
      }, 100);
    };

    // 초기 체크 (한 번만 실행)
    checkFit();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [text, maxLines]); // text나 maxLines가 변경될 때만 재계산

  return (
    <div ref={containerRef} className="w-full">
      <span
        ref={textRef}
        className={className}
        style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
      >
        {text}
      </span>
    </div>
  );
};

// 플로팅 파티클 컴포넌트 (hydration 경고 방지)
const FloatingParticles = ({ count = 15 }: { count?: number }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
  }>>([]);

  // 클라이언트에서만 파티클 생성 (hydration 경고 방지)
  useEffect(() => {
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      color: ['var(--accent-color)', 'var(--accent-secondary)', 'var(--accent-tertiary)'][Math.floor(Math.random() * 3)],
    })));
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            y: [-20, -60, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function Hero() {
  const { locale, isLoaded } = useLocale();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isClient, setIsClient] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const heroT = heroContent[locale as keyof typeof heroContent] ?? heroContent.ko;

  // 로컬 스토리지에서 직접 데이터 로드
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const data: ProfileData = JSON.parse(stored);
        setProfile(data);
      }
    } catch (e) {
      console.error('프로필 데이터 로드 실패:', e);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadData();

    // 로컬 스토리지 변경 감지 (다른 탭에서 저장 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROFILE || e.key === null) {
        loadData();
      }
    };

    // 커스텀 이벤트 감지 (같은 탭 어드민에서 저장 시 실시간 반영)
    const handleSiteDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: unknown }>;
      if (customEvent.detail.key === STORAGE_KEYS.PROFILE) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SITE_DATA_UPDATED_EVENT, handleSiteDataUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SITE_DATA_UPDATED_EVENT, handleSiteDataUpdate);
    };
  }, [loadData]);

  // 로케일에 따른 콘텐츠
  const content = isClient ? {
    subtitle: locale === 'en' ? profile.subtitle_en : profile.subtitle_ko,
    title1: locale === 'en' ? profile.title1_en : profile.title1_ko,
    title2: locale === 'en' ? profile.title2_en : profile.title2_ko,
    desc: locale === 'en' ? profile.desc_en : profile.desc_ko,
    cta: locale === 'en' ? 'Explore Projects' : '프로젝트 보기',
  } : {
    subtitle: DEFAULT_PROFILE.subtitle_ko,
    title1: DEFAULT_PROFILE.title1_ko,
    title2: DEFAULT_PROFILE.title2_ko,
    desc: DEFAULT_PROFILE.desc_ko,
    cta: '프로젝트 보기',
  };

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-32"
    >
      {/* 배경 레이어 */}
      <div className="absolute inset-0 hero-grid-bg opacity-50" />
      <div className="hero-noise-overlay opacity-30" />
      
      {/* 파티클 배경 */}
      <FloatingParticles count={20} />
      
      {/* 그라디언트 오브 - 더 은은하게 */}
      <div className="hero-gradient-orb primary opacity-20" />
      <div className="hero-gradient-orb secondary opacity-15" />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 section-container py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 서브타이틀 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-[var(--accent-color)] animate-pulse" />
              <TypewriterText 
                text={content.subtitle}
                className="font-mono text-xs tracking-wider text-[var(--accent-color)]"
                delay={0.3}
                speed={40}
              />
            </span>
          </motion.div>
          
          {/* 메인 타이틀 - 자동 크기 조정 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6"
          >
            <AutoFitText
              text={content.title1}
              className="block mb-2 text-white font-extrabold leading-[1.1] tracking-tight"
              maxLines={2}
            />
            <AutoFitText
              text={content.title2}
              className="hero-text-gradient block font-extrabold leading-[1.1] tracking-tight"
              maxLines={2}
            />
          </motion.div>
          
          {/* 설명 */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base md:text-lg text-[var(--text-secondary)] mb-10 leading-snug max-w-2xl mx-auto whitespace-pre-line"
          >
            {content.desc}
          </motion.p>
          
          {/* CTA 버튼 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-center mb-12"
          >
            <button
              onClick={scrollToProjects}
              className="btn-hero group"
            >
              <span>{content.cta}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </motion.div>

          {/* 스킬 태그 - 강조된 디자인 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="pb-28 md:pb-32" // 스크롤 인디케이터와 겹치지 않도록 하단 여백 추가
          >
            <p className="text-xs text-[var(--text-secondary)] mb-4 uppercase tracking-wider">
              {isClient && locale === 'en' ? 'Tools & Skills' : '사용 도구'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {(isClient ? profile.skills : DEFAULT_PROFILE.skills).map((skill, index) => (
                <motion.span 
                  key={skill}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + index * 0.05 }}
                  className="px-4 py-2 rounded-full bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-[var(--text-secondary)] text-xs md:text-sm font-medium hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all cursor-default backdrop-blur-sm"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20"
        onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-2">
            {heroT.scroll}
          </span>
          <div className="w-5 h-8 rounded-full border-2 border-[var(--accent-color)]/50 flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-1 rounded-full bg-[var(--accent-color)]"
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* 하단 그라데이션 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent pointer-events-none" />
    </section>
  );
}
