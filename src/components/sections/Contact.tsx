'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getProfile, getContact, type ProfileData, type ContactData, DEFAULT_PROFILE, DEFAULT_CONTACT } from '@/lib/siteData';

export default function Contact() {
  const { locale } = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setProfile(getProfile());
    setContact(getContact());
  }, []);

  const content = isClient ? {
    title: locale === 'en' ? contact.title_en : contact.title_ko,
    desc: locale === 'en' ? contact.desc_en : contact.desc_ko,
    cta: locale === 'en' ? contact.cta_en : contact.cta_ko,
    email: profile.email,
  } : {
    title: DEFAULT_CONTACT.title_ko,
    desc: DEFAULT_CONTACT.desc_ko,
    cta: DEFAULT_CONTACT.cta_ko,
    email: DEFAULT_PROFILE.email,
  };

  return (
    <section id="contact" className="py-16 md:py-20 relative">
      {/* 상단 장식 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/30 to-transparent" />
      
      <div ref={ref} className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            {content.title}
          </h2>
          <p className="text-[--text-secondary] text-sm md:text-base mb-8">
            {content.desc}
          </p>
          
          <motion.a
            href={`mailto:${content.email}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[--accent-color] text-black font-bold text-sm md:text-base hover:shadow-[0_0_30px_rgba(0,223,192,0.4)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-4 h-4" />
            {content.email}
            <ArrowUpRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
