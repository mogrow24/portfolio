'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';

export default function LanguageToggle() {
  const { locale, setLocale, isLoaded } = useLocale();

  const toggleLanguage = () => {
    const newLocale = locale === 'ko' ? 'en' : 'ko';
    setLocale(newLocale);
  };

  // 초기 로딩 시 깜빡임 방지
  if (!isLoaded) {
    return (
      <div className="w-16 h-8 rounded-full bg-[--bg-tertiary] border border-[--border-color]" />
    );
  }

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative w-16 h-8 rounded-full bg-[--bg-tertiary] border border-[--border-color] flex items-center px-1 cursor-pointer transition-all hover:border-[--accent-color]"
      whileTap={{ scale: 0.95 }}
    >
      {/* 슬라이더 */}
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-[--accent-color] shadow-lg"
        animate={{ x: locale === 'ko' ? 0 : 30 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      
      {/* 라벨 */}
      <span className={`absolute left-2 text-[10px] font-bold transition-colors ${locale === 'ko' ? 'text-black' : 'text-[--text-secondary]'}`}>
        KO
      </span>
      <span className={`absolute right-2 text-[10px] font-bold transition-colors ${locale === 'en' ? 'text-black' : 'text-[--text-secondary]'}`}>
        EN
      </span>
    </motion.button>
  );
}
