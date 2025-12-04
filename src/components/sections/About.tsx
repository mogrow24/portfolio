'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Target, 
  Zap, 
  MessageCircle,
  Crosshair,
  Star,
  Lightbulb,
  Users,
  Rocket,
  type LucideIcon
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getCompetencies, type CompetencyData, DEFAULT_COMPETENCIES } from '@/lib/siteData';

// 아이콘 매핑
const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  Zap,
  MessageCircle,
  Crosshair,
  Star,
  Lightbulb,
  Users,
  Rocket,
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Target;
}

export default function About() {
  const { locale } = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [competencies, setCompetencies] = useState<CompetencyData[]>(DEFAULT_COMPETENCIES);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCompetencies(getCompetencies());
  }, []);

  const content = {
    subtitle: 'Core Competency',
    title: 'Why Work With Me?',
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-[--bg-secondary]">
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 - 중앙 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="sub-title">{content.subtitle}</span>
          <h2 className="text-responsive-lg font-extrabold">{content.title}</h2>
        </motion.div>

        {/* 역량 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {competencies.map((comp, index) => {
            const IconComponent = getIconComponent(comp.icon);
            const subtitle = locale === 'en' ? comp.subtitle_en : comp.subtitle_ko;
            const desc = locale === 'en' ? comp.desc_en : comp.desc_ko;

            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="comp-card text-center"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[--accent-color]/10 flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-[--accent-color]" />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-1 text-white">
                  {comp.title}
                </h3>
                <span className="text-[10px] md:text-xs text-[#666] block mb-3">
                  {subtitle}
                </span>
                <p className="text-xs md:text-sm text-[--text-secondary] leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
