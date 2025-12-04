'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/context/LocaleContext';
import { 
  X,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getProjects, type ProjectData, DEFAULT_PROJECTS } from '@/lib/siteData';

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  onClick: () => void;
  locale: string;
}

function ProjectCard({ project, index, onClick, locale }: ProjectCardProps) {
  const title = locale === 'en' ? project.title_en : project.title_ko;
  const stat = locale === 'en' ? project.stat_en : project.stat_ko;
  const projectDesc = locale === 'en' ? project.project_en : project.project_ko;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className="project-card group"
    >
      {/* 썸네일 */}
      <div className="p-thumb-box">
        <img
          src={project.thumb}
          alt={title}
          className="p-thumb"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className="p-overlay">
          <span className="px-5 py-2.5 rounded-full border-2 border-[--accent-color] text-[--accent-color] text-sm font-bold bg-black/50 backdrop-blur-sm">
            View Details
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4 md:p-5 flex-grow flex flex-col">
        {/* 태그들 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag text-[10px] md:text-xs">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-base md:text-lg font-bold mb-2 text-white group-hover:text-[--accent-color] transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-[--text-secondary] text-xs md:text-sm mb-4 line-clamp-2 flex-grow">
          {projectDesc}
        </p>
        
        {/* 성과 */}
        <div className="pt-3 border-t border-[--border-color] flex justify-between items-center">
          <span className="text-[10px] md:text-xs text-[--text-secondary] uppercase tracking-wider">Key Result</span>
          <strong className="text-[--accent-color] text-xs md:text-sm font-bold">{stat}</strong>
        </div>
      </div>
    </motion.div>
  );
}

interface GalleryPopupProps {
  images: ProjectData['gallery'];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  locale: string;
}

function GalleryPopup({ images, currentIndex, onClose, onPrev, onNext, locale }: GalleryPopupProps) {
  const currentImage = images[currentIndex];
  const caption = locale === 'en' ? currentImage.caption_en : currentImage.caption_ko;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 이미지 */}
        <div className="relative rounded-xl overflow-hidden bg-[--bg-secondary]">
          <img
            src={currentImage.src}
            alt={caption}
            className="w-full max-h-[70vh] object-contain"
          />
          
          {/* 캡션 */}
          <div className="p-4 text-center">
            <p className="text-[--accent-color] font-semibold text-sm md:text-base">{caption}</p>
            <p className="text-[--text-secondary] text-xs mt-1">{currentIndex + 1} / {images.length}</p>
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 rounded-full bg-white/10 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 rounded-full bg-white/10 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

interface ProjectModalProps {
  project: ProjectData;
  onClose: () => void;
  locale: string;
}

function ProjectModal({ project, onClose, locale }: ProjectModalProps) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const title = locale === 'en' ? project.title_en : project.title_ko;
  const stat = locale === 'en' ? project.stat_en : project.stat_ko;
  const team = locale === 'en' ? project.team_en : project.team_ko;
  const projectDesc = locale === 'en' ? project.project_en : project.project_ko;
  const roles = locale === 'en' ? project.role_en : project.role_ko;
  const problem = locale === 'en' ? project.problem_en : project.problem_ko;
  const solution = locale === 'en' ? project.solution_en : project.solution_ko;
  const outcomes = locale === 'en' ? project.outcome_en : project.outcome_ko;

  const labels = {
    projectInfo: 'Project Info',
    period: locale === 'en' ? 'Period' : '수행 기간',
    team: locale === 'en' ? 'Team' : '수행 인원',
    keyRole: 'Key Role & Performance',
    problemSolution: 'Problem & Solution',
    problemLabel: locale === 'en' ? 'Problem' : '문제',
    solutionLabel: locale === 'en' ? 'Solution' : '해결',
    outcome: 'Outcome',
    gallery: 'Project Gallery',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="modal-backdrop"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="modal-container"
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/70 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 헤더 이미지 */}
          <div className="relative h-48 sm:h-56 md:h-72 lg:h-80">
            <img
              src={project.thumb}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[--bg-secondary] via-transparent to-transparent" />
          </div>

          {/* 콘텐츠 */}
          <div className="p-5 sm:p-6 md:p-8 lg:p-10">
            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span key={tag} className="tag text-xs">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3 text-white leading-tight">
              {title}
            </h2>

            {/* 성과 */}
            <div className="mb-6">
              <strong className="text-[--accent-color] text-lg md:text-xl font-bold">{stat}</strong>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-6 md:space-y-8 text-sm md:text-base text-[#ccc] leading-relaxed">
              {/* Project Info */}
              <div>
                <h3 className="text-[--accent-color] text-sm md:text-base font-extrabold mb-3 border-l-4 border-[--accent-color] pl-3">
                  {labels.projectInfo}
                </h3>
                <p className="mb-3">{projectDesc}</p>
                <p className="text-[--text-secondary] text-xs md:text-sm">
                  • {labels.period}: {project.period}<br />
                  • {labels.team}: {team}
                </p>
              </div>

              {/* Key Role */}
              <div>
                <h3 className="text-[--accent-color] text-sm md:text-base font-extrabold mb-3 border-l-4 border-[--accent-color] pl-3">
                  {labels.keyRole}
                </h3>
                <ul className="space-y-2">
                  {roles.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[--accent-color] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Problem & Solution */}
              <div>
                <h3 className="text-[--accent-color] text-sm md:text-base font-extrabold mb-3 border-l-4 border-[--accent-color] pl-3">
                  {labels.problemSolution}
                </h3>
                <div className="space-y-2">
                  <p><strong className="text-white">{labels.problemLabel}:</strong> {problem}</p>
                  <p><strong className="text-white">{labels.solutionLabel}:</strong> {solution}</p>
                </div>
              </div>

              {/* Outcome */}
              <div>
                <h3 className="text-[--accent-color] text-sm md:text-base font-extrabold mb-3 border-l-4 border-[--accent-color] pl-3">
                  {labels.outcome}
                </h3>
                <ul className="space-y-2">
                  {outcomes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-[--accent-color] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="pt-6 border-t border-[--border-color]">
                  <h3 className="text-base md:text-lg font-bold mb-4">{labels.gallery}</h3>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {project.gallery.map((item, i) => (
                      <div 
                        key={i} 
                        className="gallery-card cursor-pointer"
                        onClick={() => setGalleryIndex(i)}
                      >
                        <div className="gallery-img-box h-32 md:h-40">
                          <img src={item.src} alt={locale === 'en' ? item.caption_en : item.caption_ko} />
                        </div>
                        <div className="gallery-caption text-xs">
                          {locale === 'en' ? item.caption_en : item.caption_ko}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 갤러리 팝업 */}
      <AnimatePresence>
        {galleryIndex !== null && (
          <GalleryPopup
            images={project.gallery}
            currentIndex={galleryIndex}
            onClose={() => setGalleryIndex(null)}
            onPrev={() => setGalleryIndex((prev) => (prev! > 0 ? prev! - 1 : project.gallery.length - 1))}
            onNext={() => setGalleryIndex((prev) => (prev! < project.gallery.length - 1 ? prev! + 1 : 0))}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function Projects() {
  const t = useTranslations('projects');
  const { locale, isLoaded } = useLocale();
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>(DEFAULT_PROJECTS);
  const [isClient, setIsClient] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    setIsClient(true);
    setProjects(getProjects().sort((a, b) => a.order_index - b.order_index));
  }, []);

  // Hydration 불일치 방지를 위해 초기 로딩 시 기본값 사용
  const currentLocale = isLoaded ? locale : 'ko';
  
  // 표시할 프로젝트 (is_visible이 true인 것만)
  const visibleProjects = projects.filter(p => p.is_visible);

  return (
    <section id="projects" className="py-16 md:py-24" style={{ background: 'radial-gradient(ellipse at center, rgba(0,223,192,0.03) 0%, transparent 70%)' }}>
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 - 중앙 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="sub-title">{t('subtitle')}</span>
          <h2 className="text-responsive-lg font-extrabold">Case Studies</h2>
        </motion.div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
              locale={currentLocale}
            />
          ))}
        </div>
      </div>

      {/* 프로젝트 모달 */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            locale={currentLocale}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
