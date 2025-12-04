'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Quote } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getProfile, type ProfileData, DEFAULT_PROFILE } from '@/lib/siteData';

export default function Hero() {
  const { locale, isLoaded } = useLocale();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setProfile(getProfile());
  }, []);

  // 로케일에 따른 콘텐츠
  const content = isClient ? {
    subtitle: locale === 'en' ? profile.subtitle_en : profile.subtitle_ko,
    title1: locale === 'en' ? profile.title1_en : profile.title1_ko,
    title2: locale === 'en' ? profile.title2_en : profile.title2_ko,
    desc: locale === 'en' ? profile.desc_en : profile.desc_ko,
    quote: locale === 'en' ? profile.quote_en : profile.quote_ko,
    cta: locale === 'en' ? 'View Projects' : 'View Projects',
    skillsLabel: locale === 'en' ? 'Main Tools (Skills)' : 'Main Tools (Skills)',
  } : {
    subtitle: DEFAULT_PROFILE.subtitle_ko,
    title1: DEFAULT_PROFILE.title1_ko,
    title2: DEFAULT_PROFILE.title2_ko,
    desc: DEFAULT_PROFILE.desc_ko,
    quote: DEFAULT_PROFILE.quote_ko,
    cta: 'View Projects',
    skillsLabel: 'Main Tools (Skills)',
  };

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center pt-20 pb-10"
    >
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* 왼쪽: 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="sub-title"
            >
              {content.subtitle}
            </motion.span>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.15] mb-6">
              {content.title1}<br />
              <span className="text-[--accent-color]">{content.title2}</span>
            </h1>
            
            <p className="text-sm md:text-base text-[--text-secondary] mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {content.desc}
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <motion.button
                onClick={scrollToProjects}
                className="btn-primary text-sm md:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {content.cta}
              </motion.button>
            </div>
          </motion.div>

          {/* 오른쪽: 프로필 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="profile-card max-w-md mx-auto">
              <h3 className="text-xl md:text-2xl font-extrabold mb-6 text-white tracking-tight">
                {isClient ? profile.name_en : DEFAULT_PROFILE.name_en}
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm md:text-base">
                  <div className="w-8 h-8 rounded-lg bg-[--accent-color]/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[--accent-color]" />
                  </div>
                  <span>{isClient ? profile.phone : DEFAULT_PROFILE.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm md:text-base">
                  <div className="w-8 h-8 rounded-lg bg-[--accent-color]/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[--accent-color]" />
                  </div>
                  <span>{isClient ? profile.email : DEFAULT_PROFILE.email}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[--accent-color]/10 flex items-center justify-center flex-shrink-0">
                    <Quote className="w-4 h-4 text-[--accent-color]" />
                  </div>
                  <span className="text-[#aaa] leading-relaxed italic">
                    {content.quote}
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-[--border-color]">
                <span className="text-[10px] text-[#555] uppercase tracking-widest mb-3 block font-semibold">
                  {content.skillsLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(isClient ? profile.skills : DEFAULT_PROFILE.skills).map((skill) => (
                    <span key={skill} className="tag-outline text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
