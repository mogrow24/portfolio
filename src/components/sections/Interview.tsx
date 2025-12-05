'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getInterviews, type InterviewData, DEFAULT_INTERVIEWS } from '@/lib/siteData';

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
          <div className="pl-11 border-l-2 border-[--accent-color]/30 ml-4">
            <p className="text-sm md:text-base text-[--text-secondary] leading-loose pl-4 whitespace-pre-line">
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

  useEffect(() => {
    setIsClient(true);
    setInterviews(getInterviews().sort((a, b) => a.order_index - b.order_index));
  }, []);

  return (
    <section id="interview" className="py-20 md:py-28 relative">
      {/* 상단 장식 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/20 to-transparent" />
      
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 - 중앙 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
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
