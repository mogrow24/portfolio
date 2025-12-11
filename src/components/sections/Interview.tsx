'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { type InterviewData, DEFAULT_INTERVIEWS, STORAGE_KEYS, SITE_DATA_UPDATED_EVENT } from '@/lib/siteData';

const content = {
  ko: {
    subtitle: 'Interview',
    title: '더 알아보기',
  },
  en: {
    subtitle: 'Interview',
    title: 'Get to Know Me',
  },
};

// 개별 인터뷰 아이템 컴포넌트
function InterviewItem({ 
  item, 
  index, 
  locale, 
  isInView 
}: { 
  item: InterviewData; 
  index: number; 
  locale: string; 
  isInView: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const question = locale === 'en' ? item.question_en : item.question_ko;
  const answer = locale === 'en' ? item.answer_en : item.answer_ko;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* 질문 (클릭 가능) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-[--accent-color]/5 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[--accent-color]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageCircle className="w-4 h-4 text-[--accent-color]" />
          </div>
          <span className="text-base md:text-lg font-bold text-white leading-relaxed pr-4">
            {question}
          </span>
        </div>
        <div
          className={`ml-3 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <ChevronDown className="w-5 h-5 text-[--accent-color]" />
        </div>
      </div>

      {/* 답변 (접기/펼치기) */}
      <div
        style={{
          maxHeight: isOpen ? '1000px' : '0px',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.4s ease, opacity 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
          <div className="pl-4 md:pl-5 border-l-2 border-[--accent-color]/30 ml-1.5 md:ml-2">
            <p className="text-sm md:text-base text-[--text-secondary] leading-loose pl-2 md:pl-3 whitespace-pre-line">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Interview() {
  const { locale } = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [interviews, setInterviews] = useState<InterviewData[]>(DEFAULT_INTERVIEWS);
  const [isClient, setIsClient] = useState(false);
  const t = content[locale as keyof typeof content] || content.ko;

  // 로컬 스토리지에서 직접 데이터 로드
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
      if (stored) {
        const data: InterviewData[] = JSON.parse(stored);
        const sorted = [...data].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
        setInterviews(sorted);
      }
    } catch (e) {
      console.error('인터뷰 데이터 로드 실패:', e);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadData();

    // 로컬 스토리지 변경 감지 (다른 탭에서 저장 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.INTERVIEWS || e.key === null) {
        loadData();
      }
    };

    // 커스텀 이벤트 감지 (같은 탭 어드민에서 저장 시 실시간 반영)
    const handleSiteDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: unknown }>;
      if (customEvent.detail.key === STORAGE_KEYS.INTERVIEWS) {
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

  return (
    <section id="interview" className="py-20 md:py-28 relative">
      {/* 상단 장식 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/20 to-transparent" />
      
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 - 좌측 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <span className="sub-title">{t.subtitle}</span>
          <h2 className="text-responsive-lg font-extrabold">{t.title}</h2>
        </motion.div>

        {/* 인터뷰 아이템 */}
        <div className="space-y-4 md:space-y-5 max-w-3xl mx-auto">
          {(isClient ? interviews : DEFAULT_INTERVIEWS).map((item, index) => (
            <InterviewItem
              key={item.id}
              item={item}
              index={index}
              locale={locale}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
