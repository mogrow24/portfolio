'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getExperiences, type ExperienceData, DEFAULT_EXPERIENCES } from '@/lib/siteData';

export default function Experience() {
  const { locale } = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [experiences, setExperiences] = useState<ExperienceData[]>(DEFAULT_EXPERIENCES);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setExperiences(getExperiences());
  }, []);

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
