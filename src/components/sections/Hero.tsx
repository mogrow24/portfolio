'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getProfile, type ProfileData, DEFAULT_PROFILE } from '@/lib/siteData';

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

// 플로팅 파티클 컴포넌트
const FloatingParticles = ({ count = 15 }: { count?: number }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    color: ['var(--accent-color)', 'var(--accent-secondary)', 'var(--accent-tertiary)'][Math.floor(Math.random() * 3)],
  }));

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

  useEffect(() => {
    setIsClient(true);
    setProfile(getProfile());
  }, []);

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
          
          {/* 메인 타이틀 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight"
          >
            <span className="block mb-2">{content.title1}</span>
            <span className="hero-text-gradient block">{content.title2}</span>
          </motion.h1>
          
          {/* 설명 */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base md:text-lg text-[var(--text-secondary)] mb-10 leading-relaxed max-w-2xl mx-auto"
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
              <ArrowRight className="w-5 h-5" />
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
