'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroAnimation from '@/components/ui/IntroAnimation';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  // 페이지 로드 시 스크롤을 맨 위로 (강제)
  useEffect(() => {
    // 브라우저 스크롤 복원 비활성화
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // 즉시 스크롤을 맨 위로
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    // 인트로가 완전히 사라진 후 콘텐츠 표시
    setTimeout(() => {
      setContentReady(true);
      // 콘텐츠 표시 후에도 한번 더 스크롤 리셋
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  return (
    <>
      {/* 인트로 애니메이션 */}
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* 메인 콘텐츠 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}

