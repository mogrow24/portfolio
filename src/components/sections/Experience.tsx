'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { type ExperienceData, DEFAULT_EXPERIENCES, STORAGE_KEYS, SITE_DATA_UPDATED_EVENT } from '@/lib/siteData';

export default function Experience() {
  const { locale } = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [experiences, setExperiences] = useState<ExperienceData[]>(DEFAULT_EXPERIENCES);
  const [isClient, setIsClient] = useState(false);

  // 로컬 스토리지에서 직접 데이터 로드 (order_index로 정렬)
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
      if (stored) {
        const data: ExperienceData[] = JSON.parse(stored);
        // order_index 기준으로 정렬 (낮은 값이 먼저 = 맨 위)
        const sorted = [...data].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
        setExperiences(sorted);
      }
    } catch (e) {
      console.error('경력 데이터 로드 실패:', e);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadData();

    // 로컬 스토리지 변경 감지 (다른 탭에서 저장 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.EXPERIENCES || e.key === null) {
        loadData();
      }
    };

    // 커스텀 이벤트 감지 (같은 탭 어드민에서 저장 시 실시간 반영)
    const handleSiteDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: unknown }>;
      if (customEvent.detail.key === STORAGE_KEYS.EXPERIENCES) {
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

  const content = {
    subtitle: 'Career',
    title: locale === 'en' ? 'Work Experience' : '경력 사항',
  };

  return (
    <section id="experience" className="py-20 md:py-28 bg-[--bg-secondary] relative">
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
          <span className="sub-title">{content.subtitle}</span>
          <h2 className="text-responsive-lg font-extrabold">{content.title}</h2>
        </motion.div>

        {/* 타임라인 */}
        <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
          {experiences.map((exp, index) => {
            const company = locale === 'en' ? exp.company_en : exp.company_ko;
            const position = locale === 'en' ? exp.position_en : exp.position_ko;
            const highlights = locale === 'en' ? exp.highlights_en : exp.highlights_ko;

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="glass-card rounded-xl md:rounded-2xl p-5 md:p-7"
              >
                {/* 회사명 */}
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                  {company}
                </h3>

                {/* 직책 */}
                <p className="text-[--accent-color] font-semibold text-sm md:text-base mb-2">{position}</p>

                {/* 기간 */}
                <div className="flex items-center gap-2 text-[--text-secondary] text-xs md:text-sm mb-4">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{exp.period}</span>
                </div>

                {/* 주요 업무 */}
                <ul className="space-y-2">
                  {highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-[--text-secondary]">
                      <CheckCircle className="w-4 h-4 text-[--accent-color] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
