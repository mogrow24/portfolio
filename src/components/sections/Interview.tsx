'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';

const content = {
  ko: {
    subtitle: 'Interview',
    title: 'Q&A: My Thoughts',
    interviews: [
      {
        question: 'Q. 왜 기획, PM 일을 선택하게 되었나요?',
        answer: '처음에는 아이디어를 직접 실현해보는 과정이 재미있어 기획을 시작했습니다. 실무에서 자연스럽게 PM 역할을 맡게 되면서, 사용자, 클라이언트, 팀원 모두의 관점을 고려하며 조율하는 과정에서 큰 보람을 느꼈습니다. 지금은 팀의 방향을 하나로 모으는 역할에 자부심을 느낍니다.',
      },
      {
        question: 'Q. 어떤 순간에 가장 몰입하나요?',
        answer: '단순할 수도 있겠지만, 일할 때 가장 몰입합니다. 복잡한 문제를 해결하고 성과를 냈을 때의 짜릿함을 사랑합니다. 주말에도 사이드 프로젝트를 하거나 네트워킹에 참여하며 개인 역량을 높이는 것에 몰입합니다.',
      },
      {
        question: 'Q. PM으로서 가장 중요하게 생각하는 건 뭔가요?',
        answer: "'소통'입니다. 서로 말을 안 하면 아무것도 모르는 게 관계이듯 일도 마찬가지입니다. 하나의 이야기를 전달하고, 서로의 입장을 고려하여 조율하고, 같은 방향과 목적을 위해 달리는 팀이라고 느낄 수 있도록 끊임없이 확인하는 과정이 중요합니다.",
      },
      {
        question: 'Q. 앞으로 어떤 PM이 되고 싶나요?',
        answer: "누구와 함께해도 소통이 잘 되고, 어떤 프로젝트든 함께하면 해낼 수 있을 것 같은 '유능한 PM'이 되고 싶습니다. 리스크를 사전에 파악하고, 변수에 빠르게 대응하며, 모두를 아우르는 PM이 되겠습니다.",
      },
    ]
  },
  en: {
    subtitle: 'Interview',
    title: 'Q&A: My Thoughts',
    interviews: [
      {
        question: 'Q. Why did you choose planning and PM work?',
        answer: 'At first, I started planning because the process of realizing ideas was fun. As I naturally took on PM roles in practice, I felt great fulfillment in the process of coordinating while considering the perspectives of users, clients, and team members. Now I take pride in my role of unifying the team\'s direction.',
      },
      {
        question: 'Q. When do you feel most immersed?',
        answer: 'It might sound simple, but I\'m most immersed when working. I love the thrill of solving complex problems and achieving results. Even on weekends, I immerse myself in improving my personal capabilities through side projects or networking.',
      },
      {
        question: 'Q. What do you consider most important as a PM?',
        answer: "'Communication'. Just as relationships mean nothing if people don't talk to each other, the same applies to work. The process of constantly confirming - conveying a single story, coordinating while considering each other's positions, and making the team feel like they're running toward the same direction and purpose - is crucial.",
      },
      {
        question: 'Q. What kind of PM do you want to become?',
        answer: "I want to become a 'competent PM' who communicates well with anyone and makes people feel like any project can be accomplished together. I will become a PM who identifies risks in advance, responds quickly to variables, and encompasses everyone.",
      },
    ]
  }
};

export default function Interview() {
  const { locale } = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const t = content[locale as keyof typeof content] || content.ko;

  return (
    <section id="interview" className="py-16 md:py-24">
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 - 중앙 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="sub-title">{t.subtitle}</span>
          <h2 className="text-responsive-lg font-extrabold">{t.title}</h2>
        </motion.div>

        {/* 인터뷰 아이템 */}
        <div className="space-y-4 md:space-y-5 max-w-3xl mx-auto">
          {t.interviews.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="interview-item"
            >
              <span className="text-base md:text-lg font-extrabold text-white mb-3 block">
                {item.question}
              </span>
              <p className="text-sm md:text-base text-[--text-secondary] leading-relaxed">
                {item.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
