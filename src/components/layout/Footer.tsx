'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Users, Sparkles } from 'lucide-react';
import SecretAccess from '@/components/ui/SecretAccess';
import { incrementVisitorCount, getVisitorCount } from '@/lib/visitors';
import { useLocale } from '@/context/LocaleContext';

const content = {
  ko: {
    visitors: '명이 방문했습니다',
    copyright: '© 2025 윤지희. All rights reserved.',
    aiNote: 'AI를 활용하여 만든 포트폴리오 사이트입니다.',
  },
  en: {
    visitors: 'visitors',
    copyright: '© 2025 YUN JIHEE. All Rights Reserved.',
    aiNote: 'This portfolio site was created using AI.',
  },
};

export default function Footer() {
  const { locale } = useLocale();
  const t = content[locale as keyof typeof content] ?? content.ko;
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 방문자 수 증가 및 가져오기
    const count = incrementVisitorCount();
    setVisitorCount(count);
  }, []);

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
          <div className="absolute left-1/2 -translate-x-1/2 -top-5">
            <motion.button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-[--bg-secondary] border border-[--border-color] flex items-center justify-center hover:border-[--accent-color] hover:text-[--accent-color] transition-all"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>

          {/* 방문자 수 */}
          {isClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[--bg-tertiary] border border-[--border-color]">
                <Users className="w-3.5 h-3.5 text-[--accent-color]" />
                <span className="text-xs text-[--text-secondary]">
                  <span className="text-[--accent-color] font-bold">{visitorCount.toLocaleString()}</span>
                  {' '}{t.visitors}
                </span>
              </div>
            </motion.div>
          )}

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
            YUN JIHEE
          </motion.button>
          
          <p className="text-[#444] text-xs md:text-sm mb-4">
            {t.copyright}
          </p>

          {/* AI 활용 문구 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] text-[--text-secondary]/50"
          >
            <Sparkles className="w-3 h-3" />
            {t.aiNote}
          </motion.p>
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
