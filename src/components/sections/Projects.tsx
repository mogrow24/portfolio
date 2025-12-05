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
  ChevronRight,
  Layers,
  Monitor,
  FileText,
  Sparkles,
  ArrowRight,
  Tag
} from 'lucide-react';
import { getProjects, getCategories, type ProjectData, type CategoryData, DEFAULT_PROJECTS, DEFAULT_CATEGORIES } from '@/lib/siteData';

// 아이콘 맵핑
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Layers,
  Monitor,
  FileText,
  Sparkles,
  Tag,
};

// 프로젝트 카드 컴포넌트
interface ProjectCardProps {
  project: ProjectData;
  index: number;
  onClick: () => void;
  locale: string;
}

function ProjectCard({ project, index, onClick, locale }: ProjectCardProps) {
  const title = locale === 'en' ? project.title_en : project.title_ko;
  const stat = locale === 'en' ? project.stat_en : project.stat_ko;
  const [isHovered, setIsHovered] = useState(false);
  const viewDetailsText = locale === 'en' ? 'View Details' : '자세히 보기';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group cursor-pointer h-full"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="relative rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] h-full flex flex-col"
        whileHover={{ 
          y: -8,
          boxShadow: '0 25px 50px rgba(0, 255, 204, 0.2)',
          borderColor: 'var(--accent-color)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* 썸네일 */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <motion.img
            src={project.thumb}
            alt={title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/20 to-transparent" />
          
          {/* 호버 오버레이 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-color)] text-black text-sm font-bold shadow-lg shadow-[var(--accent-color)]/30"
                >
                  {viewDetailsText} <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 카테고리 뱃지 */}
          {project.category && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-semibold uppercase tracking-wider">
                {project.category.replace('_', '/')}
              </span>
            </div>
          )}
        </div>

        {/* 카드 콘텐츠 */}
        <div className="p-5 flex-1 flex flex-col">
          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors flex-1">
            {title}
          </h3>
          
          {/* 성과 강조 */}
          <div className="mt-auto pt-3 border-t border-[var(--border-color)]">
            <p className="text-sm text-[var(--accent-color)] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
              {stat}
            </p>
          </div>
        </div>

        {/* 하단 그라데이션 라인 */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-color)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </motion.div>
  );
}

// 갤러리 팝업
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
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative rounded-xl overflow-hidden bg-[--bg-secondary]">
          <img
            src={currentImage.src}
            alt={caption}
            className="w-full max-h-[70vh] object-contain"
          />
          <div className="p-4 text-center">
            <p className="text-[--accent-color] font-semibold text-sm md:text-base">{caption}</p>
            <p className="text-[--text-secondary] text-xs mt-1">{currentIndex + 1} / {images.length}</p>
          </div>
        </div>

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

// 프로젝트 모달
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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/70 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative h-48 sm:h-56 md:h-72 lg:h-80">
            <img
              src={project.thumb}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[--bg-secondary] via-transparent to-transparent" />
          </div>

          <div className="p-5 sm:p-6 md:p-8 lg:p-10">
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

            <div className="mb-6">
              <strong className="text-[--accent-color] text-lg md:text-xl font-bold">{stat}</strong>
            </div>

            <div className="space-y-6 md:space-y-8 text-sm md:text-base text-[#ccc] leading-relaxed">
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

              <div>
                <h3 className="text-[--accent-color] text-sm md:text-base font-extrabold mb-3 border-l-4 border-[--accent-color] pl-3">
                  {labels.problemSolution}
                </h3>
                <div className="space-y-2">
                  <p><strong className="text-white">{labels.problemLabel}:</strong> {problem}</p>
                  <p><strong className="text-white">{labels.solutionLabel}:</strong> {solution}</p>
                </div>
              </div>

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
  const [categories, setCategories] = useState<CategoryData[]>(DEFAULT_CATEGORIES);
  const [isClient, setIsClient] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    setIsClient(true);
    setProjects(getProjects().sort((a, b) => a.order_index - b.order_index));
    setCategories(getCategories().sort((a, b) => a.order_index - b.order_index));
  }, []);

  const currentLocale = isLoaded ? locale : 'ko';
  
  // 카테고리별 필터링
  const filteredProjects = projects.filter(p => {
    if (!p.is_visible) return false;
    if (category === 'all') return true;
    return p.category === category;
  });

  return (
    <section 
      id="projects" 
      className="py-20 md:py-32 relative"
      style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, rgba(0,223,192,0.02) 50%, var(--bg-primary) 100%)' }}
    >
      {/* 상단 장식 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/30 to-transparent" />
      
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 - 여백 추가 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="sub-title">{t('subtitle')}</span>
          <h2 className="text-responsive-lg font-extrabold mb-4">{t('title')}</h2>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-2xl mx-auto mb-8">
            {currentLocale === 'en' 
              ? 'Explore my projects by category. Click on a card to view detailed information.'
              : '카테고리별로 프로젝트를 탐색해보세요. 카드를 클릭하면 상세 정보를 확인할 수 있습니다.'}
          </p>
          
          {/* 카테고리 필터 - 더 강조된 디자인 */}
          <div className="inline-flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] backdrop-blur-sm">
            <motion.button
              onClick={() => setCategory('all')}
              className={`flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${
                category === 'all' 
                  ? 'bg-[var(--accent-color)] text-black shadow-[0_0_20px_rgba(0,223,192,0.3)]' 
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              {currentLocale === 'en' ? 'All Projects' : '전체 보기'}
            </motion.button>
            
            {/* 동적 카테고리 버튼 */}
            {categories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || Tag;
              const isActive = category === cat.key;
              
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-[var(--accent-color)] text-black shadow-[0_0_20px_rgba(0,223,192,0.3)]' 
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-4 h-4" />
                  {currentLocale === 'en' ? cat.label_en : cat.label_ko}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 프로젝트 그리드 */}
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key={category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => setSelectedProject(project)}
                  locale={currentLocale}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-[var(--text-secondary)]"
            >
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>해당 카테고리에 프로젝트가 없습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 프로젝트 수 표시 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent-color)] font-bold">{filteredProjects.length}</span>
            {currentLocale === 'en' ? ' projects' : '개의 프로젝트'}
          </p>
        </motion.div>
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
