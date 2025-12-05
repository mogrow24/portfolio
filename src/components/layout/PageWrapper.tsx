'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroAnimation from '@/components/ui/IntroAnimation';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    // 인트로가 완전히 사라진 후 콘텐츠 표시
    setTimeout(() => setContentReady(true), 100);
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

