'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

// 글리치 텍스트 컴포넌트
const GlitchText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <div className={`glitch-wrapper ${className}`}>
      <span className="glitch-text" data-text={text}>{text}</span>
    </div>
  );
};

// 개별 문자 애니메이션
const AnimatedLetter = ({ 
  letter, 
  index 
}: { 
  letter: string; 
  index: number;
}) => (
  <motion.span
    initial={{ opacity: 0, y: 50, rotateX: -90 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.6,
      delay: index * 0.08,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="inline-block"
    style={{ transformStyle: 'preserve-3d' }}
  >
    {letter === ' ' ? '\u00A0' : letter}
  </motion.span>
);

// 로딩 바 컴포넌트
const LoadingBar = ({ progress }: { progress: number }) => (
  <div className="w-48 h-[2px] bg-[var(--border-color)] rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-[var(--accent-color)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)]"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3, ease: 'linear' }}
    />
  </div>
);

// 파티클 컴포넌트
const Particles = ({ count = 30 }: { count?: number }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[var(--accent-color)]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -100],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'exit'>('loading');
  const [progress, setProgress] = useState(0);
  const name = 'JIHEE YUN';
  const title = 'PM · SERVICE PLANNER';

  // 로딩 진행
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 페이즈 전환
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setPhase('reveal'), 300);
      setTimeout(() => setPhase('exit'), 2000);
      setTimeout(() => onComplete(), 2800);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-primary)]"
          exit={{ 
            clipPath: 'circle(0% at 50% 50%)',
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
        >
          {/* 배경 그리드 */}
          <div className="absolute inset-0 intro-grid-bg opacity-20" />
          
          {/* 파티클 */}
          <Particles count={40} />
          
          {/* 그라디언트 오브 */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, var(--accent-color) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* 두 번째 오브 */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)',
              filter: 'blur(80px)',
              left: '20%',
              top: '60%',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          {/* 스캔라인 효과 */}
          <div className="absolute inset-0 scanlines pointer-events-none" />

          <div className="relative z-10 text-center">
            {phase === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-8"
              >
                {/* 로고/이니셜 */}
                <motion.div
                  className="relative"
                  animate={{
                    boxShadow: [
                      '0 0 20px var(--accent-glow)',
                      '0 0 60px var(--accent-glow)',
                      '0 0 20px var(--accent-glow)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-secondary)] flex items-center justify-center">
                    <span className="text-4xl font-bold text-[var(--bg-primary)]">JY</span>
                  </div>
                </motion.div>

                {/* 로딩 텍스트 */}
                <div className="space-y-4">
                  <motion.p 
                    className="font-mono text-xs text-[var(--text-secondary)] tracking-[0.3em] uppercase"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Initializing Portfolio
                  </motion.p>
                  <LoadingBar progress={Math.min(progress, 100)} />
                  <p className="font-mono text-xs text-[var(--accent-color)]">
                    {Math.min(Math.round(progress), 100)}%
                  </p>
                </div>
              </motion.div>
            )}

            {phase === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* 메인 이름 - 글리치 효과 */}
                <div className="overflow-hidden">
                  <GlitchText 
                    text={name} 
                    className="text-5xl md:text-7xl font-black tracking-tight"
                  />
                </div>

                {/* 타이틀 - 문자별 애니메이션 */}
                <div className="overflow-hidden">
                  <motion.p 
                    className="font-mono text-sm md:text-base text-[var(--text-secondary)] tracking-[0.2em]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {title.split('').map((letter, index) => (
                      <AnimatedLetter key={index} letter={letter} index={index} />
                    ))}
                  </motion.p>
                </div>

                {/* 서브라인 */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent mx-auto max-w-xs"
                />
              </motion.div>
            )}
          </div>

          {/* 코너 데코레이션 */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[var(--accent-color)]/30" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[var(--accent-color)]/30" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[var(--accent-color)]/30" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[var(--accent-color)]/30" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


