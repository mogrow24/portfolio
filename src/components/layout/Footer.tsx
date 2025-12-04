'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import SecretAccess from '@/components/ui/SecretAccess';

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 로고를 5번 클릭하면 비밀 코드 입력창 열기
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowSecret(true);
      setClickCount(0);
    }
    
    // 2초 후 카운트 리셋
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <>
      <footer className="py-8 md:py-10 text-center relative">
        <div className="max-w-6xl mx-auto px-4">
          {/* 맨 위로 버튼 */}
          <motion.button
            onClick={scrollToTop}
            className="absolute left-1/2 -translate-x-1/2 -top-5 w-10 h-10 rounded-full bg-[--bg-secondary] border border-[--border-color] flex items-center justify-center hover:border-[--accent-color] hover:text-[--accent-color] transition-all"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>

          {/* 로고 - 5번 클릭 시 관리자 접근 */}
          <motion.button
            onClick={handleLogoClick}
            className={`text-lg md:text-xl font-extrabold inline-block mb-3 tracking-tight transition-colors ${
              clickCount > 0 ? 'text-[--accent-color]' : 'text-[--accent-color]'
            }`}
            whileHover={{ scale: 1.05 }}
            style={{
              opacity: clickCount > 0 ? 0.5 + (clickCount * 0.1) : 1
            }}
          >
            YUN JI HEE
          </motion.button>
          
          <p className="text-[#444] text-xs md:text-sm">
            © 2025 YUN JI HEE. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* 비밀 코드 입력 모달 */}
      <SecretAccess
        isOpen={showSecret}
        onClose={() => setShowSecret(false)}
      />
    </>
  );
}
