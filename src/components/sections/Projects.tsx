'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Tag,
  Play,
  ChevronDown
} from 'lucide-react';
import { type ProjectData, type CategoryData, DEFAULT_PROJECTS, DEFAULT_CATEGORIES, STORAGE_KEYS, SITE_DATA_UPDATED_EVENT } from '@/lib/siteData';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
  // 데이터 안전성 보장 - 필수 필드 초기화
  const safeProject = {
    ...project,
    tags: Array.isArray(project.tags) ? project.tags : [],
    role_ko: Array.isArray(project.role_ko) ? project.role_ko : [],
    role_en: Array.isArray(project.role_en) ? project.role_en : [],
    outcome_ko: Array.isArray(project.outcome_ko) ? project.outcome_ko : [],
    outcome_en: Array.isArray(project.outcome_en) ? project.outcome_en : [],
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
  };
  
  const title = locale === 'en' ? safeProject.title_en : safeProject.title_ko;
  const stat = locale === 'en' ? safeProject.stat_en : safeProject.stat_ko;
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
        <div className="relative h-48 md:h-56 overflow-hidden bg-[var(--bg-secondary)]">
          <motion.img
            src={project.thumb}
            alt={title}
            className="w-full h-full object-cover min-h-[192px] md:min-h-[224px]"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // data URI로 대체 (네트워크 오류 방지)
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%2300ffcc" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
              target.style.display = 'block';
            }}
            onLoad={(e) => {
              (e.target as HTMLImageElement).style.display = 'block';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/20 to-transparent pointer-events-none" />
          
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
                  {viewDetailsText} <ChevronDown className="w-4 h-4" />
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
          {safeProject.tags && safeProject.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {safeProject.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={tag || idx} 
                  className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors flex-1">
            {title}
          </h3>
          
          {/* 프로젝트 기간 */}
          {project.period && (
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              {project.period}
            </p>
          )}
          
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
  // 안전성 체크
  if (!images || !Array.isArray(images) || images.length === 0) {
    console.warn('GalleryPopup: images가 유효하지 않음', images);
    return null;
  }
  
  if (typeof currentIndex !== 'number' || currentIndex < 0 || currentIndex >= images.length) {
    console.warn('GalleryPopup: currentIndex가 유효하지 않음', currentIndex, images.length);
    return null;
  }
  
  const currentImage = images[currentIndex];
  if (!currentImage || (typeof currentImage !== 'object')) {
    console.warn('GalleryPopup: currentImage가 유효하지 않음', currentImage);
    return null;
  }
  
  // 영상 URL 파싱 및 임베드 URL 생성
  const getVideoEmbedUrl = (url: string): { type: 'youtube' | 'vimeo' | 'direct' | null; embedUrl: string } => {
    if (!url || typeof url !== 'string') return { type: null, embedUrl: '' };

    // YouTube 처리
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      };
    }

    // Vimeo 처리
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // 직접 비디오 URL (mp4, webm 등)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const isDirectVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    if (isDirectVideo) {
      return {
        type: 'direct',
        embedUrl: url
      };
    }

    return { type: null, embedUrl: '' };
  };

  try {
    const caption = locale === 'en' 
      ? (currentImage.caption_en || currentImage.caption_ko || '') 
      : (currentImage.caption_ko || currentImage.caption_en || '');
    const isVideo = currentImage.type === 'video' && 
                    currentImage.videoUrl && 
                    typeof currentImage.videoUrl === 'string';
    const videoInfo = isVideo && currentImage.videoUrl ? getVideoEmbedUrl(currentImage.videoUrl) : null;
    const currentImageSrc = currentImage.src || '';

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
          {isVideo && videoInfo && videoInfo.type ? (
            <div className="relative w-full bg-[var(--bg-secondary)]" style={{ paddingBottom: '56.25%' }}>
              {videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
                <iframe
                  src={videoInfo.embedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={caption}
                />
              ) : (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ objectFit: 'contain' }}
                >
                  영상을 재생할 수 없습니다.
                </video>
              )}
            </div>
          ) : (
            <img
              src={currentImageSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%2300ffcc" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E'}
              alt={caption || 'Gallery image'}
              className="w-full max-h-[70vh] object-contain min-h-[200px]"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23ff0000" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                target.style.display = 'block';
              }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.display = 'block';
              }}
            />
          )}
          <div className="p-4 text-center">
            <p className="text-[--accent-color] font-semibold text-sm md:text-base flex items-center justify-center gap-2">
              {isVideo && <Play className="w-4 h-4" />}
              {caption}
            </p>
            <p className="text-[--text-secondary] text-xs mt-1">{currentIndex + 1} / {images.length}</p>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/70 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/70 hover:bg-[--accent-color] hover:text-black flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
    );
  } catch (error) {
    console.error('GalleryPopup 렌더링 오류:', error);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
      >
        <div className="text-white text-center">
          <p className="text-xl mb-4">이미지를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[--accent-color] text-black rounded-lg font-semibold"
          >
            닫기
          </button>
        </div>
      </motion.div>
    );
  }
}

// 프로젝트 모달
interface ProjectModalProps {
  project: ProjectData;
  onClose: () => void;
  locale: string;
}

function ProjectModal({ project, onClose, locale }: ProjectModalProps) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  // 데이터 안전성 보장 - 필수 필드 초기화
  // try-catch로 안전하게 처리 (IIFE 사용)
  const safeProject = (() => {
    try {
      if (!project) throw new Error('Project is null or undefined');
      return {
        ...project,
        id: project?.id || `proj-${Date.now()}`,
        tags: Array.isArray(project?.tags) ? project.tags.filter((t: any) => t && typeof t === 'string') : [],
        role_ko: Array.isArray(project?.role_ko) ? project.role_ko.filter((r: any) => r && typeof r === 'string') : [],
        role_en: Array.isArray(project?.role_en) ? project.role_en.filter((r: any) => r && typeof r === 'string') : [],
        outcome_ko: Array.isArray(project?.outcome_ko) ? project.outcome_ko.filter((o: any) => o && typeof o === 'string') : [],
        outcome_en: Array.isArray(project?.outcome_en) ? project.outcome_en.filter((o: any) => o && typeof o === 'string') : [],
        gallery: Array.isArray(project?.gallery) 
          ? project.gallery.filter((item: any) => item && (item.src || item.videoUrl))
          : [],
        video: project?.video || '',
        period: project?.period || '',
        thumb: project?.thumb || '',
        title_ko: project?.title_ko || '',
        title_en: project?.title_en || '',
        stat_ko: project?.stat_ko || '',
        stat_en: project?.stat_en || '',
        team_ko: project?.team_ko || '',
        team_en: project?.team_en || '',
        project_ko: project?.project_ko || '',
        project_en: project?.project_en || '',
        problem_ko: project?.problem_ko || '',
        problem_en: project?.problem_en || '',
        solution_ko: project?.solution_ko || '',
        solution_en: project?.solution_en || '',
        is_visible: project?.is_visible !== false,
        order_index: typeof project?.order_index === 'number' ? project.order_index : 0,
        category: project?.category || '전시',
      };
    } catch (error) {
      console.error('프로젝트 데이터 처리 오류:', error);
      // 기본값으로 폴백
      return {
        id: `proj-${Date.now()}`,
        tags: [],
        role_ko: [],
        role_en: [],
        outcome_ko: [],
        outcome_en: [],
        gallery: [],
        video: '',
        period: '',
        thumb: '',
        title_ko: '프로젝트',
        title_en: 'Project',
        stat_ko: '',
        stat_en: '',
        team_ko: '',
        team_en: '',
        project_ko: '',
        project_en: '',
        problem_ko: '',
        problem_en: '',
        solution_ko: '',
        solution_en: '',
        is_visible: true,
        order_index: 0,
        category: '전시',
      };
    }
  })();

  // 안전하게 변수 추출
  const title = locale === 'en' ? (safeProject?.title_en || safeProject?.title_ko || '') : (safeProject?.title_ko || safeProject?.title_en || '');
  const stat = locale === 'en' ? (safeProject?.stat_en || safeProject?.stat_ko || '') : (safeProject?.stat_ko || safeProject?.stat_en || '');
  const team = locale === 'en' ? (safeProject?.team_en || safeProject?.team_ko || '') : (safeProject?.team_ko || safeProject?.team_en || '');
  const projectDesc = locale === 'en' ? (safeProject?.project_en || safeProject?.project_ko || '') : (safeProject?.project_ko || safeProject?.project_en || '');
  const roles = locale === 'en' ? (safeProject?.role_en || []) : (safeProject?.role_ko || []);
  const problem = locale === 'en' ? (safeProject?.problem_en || safeProject?.problem_ko || '') : (safeProject?.problem_ko || safeProject?.problem_en || '');
  const solution = locale === 'en' ? (safeProject?.solution_en || safeProject?.solution_ko || '') : (safeProject?.solution_ko || safeProject?.solution_en || '');
  const outcomes = locale === 'en' ? (safeProject?.outcome_en || []) : (safeProject?.outcome_ko || []);

  const labels = {
    projectInfo: 'Project Info',
    period: locale === 'en' ? 'Period' : '수행 기간',
    team: locale === 'en' ? 'Team' : '수행 인원',
    keyRole: 'Key Role & Performance',
    problemSolution: 'Problem & Solution',
    problemLabel: locale === 'en' ? 'Problem' : '문제',
    solutionLabel: locale === 'en' ? 'Solution' : '해결',
    outcome: 'Outcome',
    video: locale === 'en' ? 'Project Video' : '프로젝트 영상',
    gallery: 'Project Gallery',
  };

  // 영상 URL 파싱 및 임베드 URL 생성
  const getVideoEmbedUrl = (url: string): { type: 'youtube' | 'vimeo' | 'direct' | null; embedUrl: string } => {
    if (!url) return { type: null, embedUrl: '' };

    // YouTube 처리
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      };
    }

    // Vimeo 처리
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // 직접 비디오 URL (mp4, webm 등)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const isDirectVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    if (isDirectVideo) {
      return {
        type: 'direct',
        embedUrl: url
      };
    }

    return { type: null, embedUrl: '' };
  };

  const videoInfo = safeProject.video ? getVideoEmbedUrl(safeProject.video) : null;

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

          <div className="relative h-48 sm:h-56 md:h-72 lg:h-80 bg-[var(--bg-secondary)] overflow-hidden">
            <img
              src={safeProject.thumb}
              alt={title}
              className="w-full h-full object-cover min-h-[192px] sm:min-h-[224px] md:min-h-[288px] lg:min-h-[320px]"
              loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%2300ffcc" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  target.style.display = 'block';
                }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.display = 'block';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[--bg-secondary] via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="p-5 sm:p-6 md:p-8 lg:p-10">
            {safeProject.tags && safeProject.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {safeProject.tags.map((tag, idx) => (
                  <span key={tag || idx} className="tag text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

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
                  • {labels.period}: {safeProject.period}<br />
                  • {labels.team}: {team}
                </p>
              </div>

              {roles && roles.length > 0 && (
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
              )}

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

              {videoInfo && videoInfo.type && (
                <div className="pt-6 border-t border-[--border-color]">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-[--accent-color]" />
                    {labels.video}
                  </h3>
                  <div className="relative w-full bg-[var(--bg-secondary)] rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    {videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
                      <iframe
                        src={videoInfo.embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={labels.video}
                      />
                    ) : (
                      <video
                        src={videoInfo.embedUrl}
                        controls
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ objectFit: 'contain' }}
                      >
                        영상을 재생할 수 없습니다.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {safeProject.gallery && safeProject.gallery.length > 0 && (
                <div className="pt-6 border-t border-[--border-color]">
                  <h3 className="text-base md:text-lg font-bold mb-4">{labels.gallery}</h3>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {safeProject.gallery.map((item: any, i: number) => {
                      if (!item || (typeof item !== 'object')) return null;
                      if (!item.src && !item.videoUrl) return null;
                      
                      try {
                        const isVideo = item.type === 'video' && 
                                        item.videoUrl && 
                                        typeof item.videoUrl === 'string';
                        const caption = locale === 'en' 
                          ? (item.caption_en || item.caption_ko || '') 
                          : (item.caption_ko || item.caption_en || '');
                        
                        return (
                        <div 
                          key={i} 
                          className="gallery-card cursor-pointer relative"
                          onClick={() => setGalleryIndex(i)}
                        >
                          <div className="gallery-img-box h-32 md:h-40 bg-[var(--bg-secondary)] overflow-hidden relative">
                            {isVideo ? (
                              <>
                                <img 
                                  src={item.src || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%2300ffcc" text-anchor="middle" dominant-baseline="middle"%3EVideo%3C/text%3E%3C/svg%3E'} 
                                  alt={caption}
                                  className="w-full h-full object-cover min-h-[128px] md:min-h-[160px]"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%2300ffcc" text-anchor="middle" dominant-baseline="middle"%3EVideo%3C/text%3E%3C/svg%3E';
                                    target.style.display = 'block';
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[--accent-color]/90 flex items-center justify-center">
                                    <Play className="w-6 h-6 md:w-8 md:h-8 text-black" fill="currentColor" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <img 
                                src={item.src || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%2300ffcc" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E'} 
                                alt={caption}
                                className="w-full h-full object-cover min-h-[128px] md:min-h-[160px]"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%230a0a12"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%23ff0000" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                                  target.style.display = 'block';
                                }}
                                onLoad={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'block';
                                }}
                              />
                            )}
                          </div>
                          <div className="gallery-caption text-xs flex items-center gap-1">
                            {isVideo && <Play className="w-3 h-3" />}
                            {caption}
                          </div>
                        </div>
                        );
                      } catch (error) {
                        console.error(`갤러리 아이템 ${i} 렌더링 오류:`, error, item);
                        return null;
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
          {galleryIndex !== null && galleryIndex >= 0 && safeProject.gallery && safeProject.gallery.length > 0 && (
          <GalleryPopup
            images={safeProject.gallery}
            currentIndex={galleryIndex}
            onClose={() => setGalleryIndex(null)}
            onPrev={() => {
              const newIndex = galleryIndex > 0 ? galleryIndex - 1 : safeProject.gallery.length - 1;
              setGalleryIndex(newIndex);
            }}
            onNext={() => {
              const newIndex = galleryIndex < safeProject.gallery.length - 1 ? galleryIndex + 1 : 0;
              setGalleryIndex(newIndex);
            }}
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
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>(DEFAULT_PROJECTS);
  const [categories, setCategories] = useState<CategoryData[]>(DEFAULT_CATEGORIES);
  const [isClient, setIsClient] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // 로컬 스토리지에서 직접 데이터 로드 (강화 버전)
  const loadData = useCallback(() => {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProjects) {
        const data: ProjectData[] = JSON.parse(storedProjects);
        // 데이터 검증 및 정규화
        const validatedData = (Array.isArray(data) ? data : []).map((p: any) => {
          if (!p || typeof p !== 'object') return null;
          return {
            ...p,
            id: p.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tags: Array.isArray(p.tags) ? p.tags.filter((t: any) => t && typeof t === 'string') : [],
            role_ko: Array.isArray(p.role_ko) ? p.role_ko.filter((r: any) => r && typeof r === 'string') : [],
            role_en: Array.isArray(p.role_en) ? p.role_en.filter((r: any) => r && typeof r === 'string') : [],
            outcome_ko: Array.isArray(p.outcome_ko) ? p.outcome_ko.filter((o: any) => o && typeof o === 'string') : [],
            outcome_en: Array.isArray(p.outcome_en) ? p.outcome_en.filter((o: any) => o && typeof o === 'string') : [],
            gallery: Array.isArray(p.gallery) ? p.gallery.filter((item: any) => item && typeof item === 'object' && (item.src || item.videoUrl)) : [],
            video: typeof p.video === 'string' ? p.video : '',
            period: typeof p.period === 'string' ? p.period : '',
            thumb: typeof p.thumb === 'string' ? p.thumb : '',
            title_ko: typeof p.title_ko === 'string' ? p.title_ko : '',
            title_en: typeof p.title_en === 'string' ? p.title_en : '',
            stat_ko: typeof p.stat_ko === 'string' ? p.stat_ko : '',
            stat_en: typeof p.stat_en === 'string' ? p.stat_en : '',
            team_ko: typeof p.team_ko === 'string' ? p.team_ko : '',
            team_en: typeof p.team_en === 'string' ? p.team_en : '',
            project_ko: typeof p.project_ko === 'string' ? p.project_ko : '',
            project_en: typeof p.project_en === 'string' ? p.project_en : '',
            problem_ko: typeof p.problem_ko === 'string' ? p.problem_ko : '',
            problem_en: typeof p.problem_en === 'string' ? p.problem_en : '',
            solution_ko: typeof p.solution_ko === 'string' ? p.solution_ko : '',
            solution_en: typeof p.solution_en === 'string' ? p.solution_en : '',
            is_visible: p.is_visible !== false,
            order_index: typeof p.order_index === 'number' ? p.order_index : 0,
            category: p.category || 'exhibition',
          };
        }).filter((p): p is ProjectData => p !== null);
        
        const sorted = validatedData.sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
        console.log(`📥 프로젝트 로드: ${sorted.length}개 (검증 완료)`, sorted.map(p => ({ id: p.id, title: p.title_ko, visible: p.is_visible })));
        // 강제로 상태 업데이트 (함수형 업데이트로 확실하게 반영)
        setProjects(prev => {
          // 이전 상태와 비교하여 실제로 변경되었는지 확인
          if (prev.length !== sorted.length || 
              prev.some((p, i) => p.id !== sorted[i]?.id || p.is_visible !== sorted[i]?.is_visible)) {
            console.log('🔄 프로젝트 상태 업데이트:', sorted.length, '개 (is_visible 포함)');
            return sorted;
          }
          return prev;
        });
      } else {
        // 스토리지에 데이터가 없으면 기본값 사용
        console.warn('⚠️ 저장된 프로젝트 데이터 없음 - 기본값 사용');
        setProjects(DEFAULT_PROJECTS);
      }
      
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        const catData: CategoryData[] = JSON.parse(storedCategories);
        setCategories([...catData].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)));
      }
    } catch (e) {
      console.error('❌ 프로젝트 데이터 로드 실패:', e);
      // 에러 발생 시 기본값으로 폴백
      setProjects(DEFAULT_PROJECTS);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadData();

    // 로컬 스토리지 변경 감지 (다른 탭에서 저장 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROJECTS || e.key === STORAGE_KEYS.CATEGORIES || e.key === null) {
        console.log('🔄 스토리지 변경 감지 (다른 탭) - 데이터 새로고침', e.key);
        loadData();
      }
    };

    // 커스텀 이벤트 감지 (같은 탭 어드민에서 저장 시 실시간 반영)
    const handleSiteDataUpdate = (e: Event) => {
      try {
        const customEvent = e as CustomEvent<{ key: string; data: unknown }>;
        if (!customEvent || !customEvent.detail) {
          console.warn('⚠️ 이벤트 detail이 없음:', e);
          return;
        }
        
        const eventKey = customEvent.detail.key;
        if (eventKey === STORAGE_KEYS.PROJECTS || eventKey === STORAGE_KEYS.CATEGORIES) {
          const data = customEvent.detail.data;
          const dataInfo = Array.isArray(data) ? `${data.length}개 항목` : '데이터';
          console.log(`🔄 어드민 저장 감지 - 데이터 새로고침 [${eventKey}]`, dataInfo);
          
          // 즉시 새로고침 (강제) - 여러 번 실행하여 확실하게 반영
          loadData();
          
          // 추가 보장: 약간의 지연 후 다시 로드 (여러 번)
          setTimeout(() => {
            console.log('🔄 지연 새로고침 실행 (10ms)');
            loadData();
          }, 10);
          
          setTimeout(() => {
            console.log('🔄 지연 새로고침 실행 (50ms)');
            loadData();
          }, 50);
          
          setTimeout(() => {
            console.log('🔄 지연 새로고침 실행 (100ms)');
            loadData();
          }, 100);
          
          setTimeout(() => {
            console.log('🔄 지연 새로고침 실행 (200ms)');
            loadData();
          }, 200);
          
          setTimeout(() => {
            console.log('🔄 지연 새로고침 실행 (500ms)');
            loadData();
          }, 500);
          
          setTimeout(() => {
            console.log('🔄 지연 새로고침 실행 (1000ms)');
            loadData();
          }, 1000);
          
          setTimeout(() => {
            console.log('🔄 최종 확인 새로고침 실행 (2000ms)');
            loadData();
          }, 2000);
          
          setTimeout(() => {
            console.log('🔄 최종 확인 새로고침 실행 (2000ms)');
            loadData();
          }, 2000);
        }
      } catch (error) {
        console.error('❌ 이벤트 처리 오류:', error, e);
        // 에러가 발생해도 데이터는 새로고침 시도
        loadData();
      }
    };

    // 주기적 확인 (5초마다) - 백업 보장
    const intervalId = setInterval(() => {
      loadData();
    }, 5000);

    // 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SITE_DATA_UPDATED_EVENT, handleSiteDataUpdate);
    
    // 포커스 시에도 새로고침
    const handleFocus = () => {
      console.log('📱 페이지 포커스 - 데이터 새로고침');
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    
    // 디버깅: 이벤트 리스너가 제대로 등록되었는지 확인
    console.log('✅ Projects 컴포넌트 이벤트 리스너 등록 완료:', {
      storage: '등록됨',
      customEvent: SITE_DATA_UPDATED_EVENT,
      focus: '등록됨',
      interval: '5초마다'
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SITE_DATA_UPDATED_EVENT, handleSiteDataUpdate);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
      console.log('🧹 Projects 컴포넌트 이벤트 리스너 정리 완료');
    };
  }, [loadData]);

  const currentLocale = isLoaded ? locale : 'ko';
  
  // 타이틀 및 서브타이틀 콘텐츠
  const content = currentLocale === 'en' ? {
    subtitle: 'Projects',
    title: 'Featured Projects',
  } : {
    subtitle: 'Projects',
    title: '진행한 프로젝트',
  };
  
  // 카테고리별 필터링 (안전한 필터링)
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(p => {
    if (!p || typeof p !== 'object') return false;
    if (p.is_visible === false) return false;
    if (category === 'all') return true;
    return p.category === category;
  });

  // 초기 로딩 상태
  if (!isClient) {
    return (
      <section id="projects" className="py-20 md:py-32 relative bg-[var(--bg-primary)]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse text-[var(--text-secondary)]">로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section 
        id="projects" 
        className="py-20 md:py-32 relative"
        style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, rgba(0,223,192,0.02) 50%, var(--bg-primary) 100%)' }}
      >
      {/* 상단 장식 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/30 to-transparent" />
      
      <div ref={ref} className="section-container">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="sub-title block mb-2">{content.subtitle}</span>
          <h2 className="text-responsive-lg font-extrabold mb-4 text-white">{content.title}</h2>
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
              {filteredProjects.map((project, index) => {
                // 프로젝트 유효성 검사
                if (!project || !project.id) {
                  console.warn(`유효하지 않은 프로젝트 스킵:`, project);
                  return null;
                }
                
                try {
                  return (
                    <ProjectCard
                      key={project.id || `proj-${index}`}
                      project={project}
                      index={index}
                      onClick={() => {
                        try {
                          setSelectedProject(project);
                        } catch (e) {
                          console.error('프로젝트 선택 오류:', e);
                        }
                      }}
                      locale={currentLocale}
                    />
                  );
                } catch (error) {
                  console.error(`프로젝트 카드 렌더링 오류 (index ${index}):`, error, project);
                  return null;
                }
              })}
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
    </ErrorBoundary>
  );
}
