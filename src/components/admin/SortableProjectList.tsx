'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { LocalProject } from '@/types/admin';

interface SortableProjectListProps {
  projects: LocalProject[];
  onReorder: (projects: LocalProject[]) => void;
  onEdit: (project: LocalProject) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (project: LocalProject) => void;
}

export default function SortableProjectList({
  projects,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableProjectListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const reordered = arrayMove(projects, oldIndex, newIndex).map(
        (project, index) => ({
          ...project,
          order_index: index + 1,
        })
      );

      onReorder(reordered);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={projects.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {projects.map((project, index) => (
            <SortableProjectItem
              key={project.id}
              project={project}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableProjectItemProps {
  project: LocalProject;
  index: number;
  onEdit: (project: LocalProject) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (project: LocalProject) => void;
}

function SortableProjectItem({
  project,
  index,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`glass-card rounded-xl p-4 ${
        !project.is_visible ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-2xl ring-2 ring-[--accent-color]' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 pt-1 text-[--text-secondary] cursor-grab active:cursor-grabbing hover:text-[--accent-color] transition-colors touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* 썸네일 */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-[--bg-tertiary] flex items-center justify-center overflow-hidden">
          {project.thumb ? (
            <img
              src={project.thumb}
              alt={project.title_ko}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-[--text-secondary]" />
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[--text-secondary] font-mono">
              #{project.order_index || index + 1}
            </span>
            <h3 className="font-semibold text-white truncate">
              {project.title_ko}
            </h3>
            {!project.is_visible && (
              <span className="px-2 py-0.5 rounded text-xs bg-[--bg-tertiary] text-[--text-secondary]">
                숨김
              </span>
            )}
          </div>
          <p className="text-sm text-[--text-secondary] line-clamp-1 mb-2">
            {project.desc.project_ko}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs bg-[--bg-tertiary] text-[--text-secondary]"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded text-xs bg-[--bg-tertiary] text-[--text-secondary]">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-[--text-secondary]">
            <span>갤러리: {project.gallery.length}장</span>
            <span>성과: {project.stat_ko || '미입력'}</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility(project)}
            className={`p-2 rounded-lg transition-colors ${
              project.is_visible
                ? 'text-[--accent-color] hover:bg-[--accent-color]/10'
                : 'text-[--text-secondary] hover:bg-[--bg-tertiary]'
            }`}
            title={project.is_visible ? '숨기기' : '보이기'}
          >
            {project.is_visible ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary] transition-colors"
            title="수정"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="삭제"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}


