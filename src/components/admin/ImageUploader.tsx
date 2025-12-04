'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, Clipboard, X, Image as ImageIcon, Check, Loader2 } from 'lucide-react';

type UploadMode = 'file' | 'url' | 'paste';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = '이미지',
  placeholder = '이미지 URL을 입력하세요',
  className = '',
}: ImageUploaderProps) {
  const [mode, setMode] = useState<UploadMode>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrlInput(value || '');
    setPreview(value || null);
  }, [value]);

  // 파일을 Base64로 변환
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 이미지 유효성 검사
  const validateImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onChange(base64);
      setUrlInput('');
    } catch {
      setError('파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 input 변경
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // URL 적용
  const handleUrlApply = async () => {
    if (!urlInput.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const isValid = await validateImage(urlInput);
    if (isValid) {
      setPreview(urlInput);
      onChange(urlInput);
    } else {
      setError('유효하지 않은 이미지 URL입니다.');
    }

    setIsLoading(false);
  };

  // 클립보드에서 붙여넣기
  const handlePaste = useCallback(async (e: ClipboardEvent | React.ClipboardEvent) => {
    e.preventDefault();
    setError(null);

    const clipboardData = 'clipboardData' in e ? e.clipboardData : null;
    if (!clipboardData) return;

    // 이미지 파일 확인
    const items = Array.from(clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        await handleFileUpload(file);
        return;
      }
    }

    // 텍스트(URL) 확인
    const text = clipboardData.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
      setIsLoading(true);
      const isValid = await validateImage(text);
      if (isValid) {
        setPreview(text);
        onChange(text);
        setUrlInput(text);
      } else {
        setError('유효하지 않은 이미지 URL입니다.');
      }
      setIsLoading(false);
    }
  }, [onChange]);

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // 이미지 삭제
  const handleClear = () => {
    setPreview(null);
    setUrlInput('');
    onChange('');
    setError(null);
  };

  // 붙여넣기 모드일 때 전역 paste 이벤트 리스닝
  useEffect(() => {
    if (mode === 'paste') {
      const handleGlobalPaste = (e: ClipboardEvent) => {
        if (pasteAreaRef.current?.contains(document.activeElement) || 
            document.activeElement === pasteAreaRef.current) {
          handlePaste(e);
        }
      };
      document.addEventListener('paste', handleGlobalPaste);
      return () => document.removeEventListener('paste', handleGlobalPaste);
    }
  }, [mode, handlePaste]);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-[--text-secondary]">
          {label}
        </label>
      )}

      {/* 모드 선택 탭 */}
      <div className="flex gap-1 bg-[--bg-tertiary] rounded-lg p-1">
        {([
          { id: 'url', icon: Link2, label: 'URL' },
          { id: 'file', icon: Upload, label: '파일' },
          { id: 'paste', icon: Clipboard, label: '붙여넣기' },
        ] as { id: UploadMode; icon: typeof Link2; label: string }[]).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              mode === id
                ? 'bg-[--accent-color] text-black'
                : 'text-[--text-secondary] hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* URL 입력 모드 */}
      <AnimatePresence mode="wait">
        {mode === 'url' && (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white text-sm focus:outline-none focus:border-[--accent-color]"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
            />
            <button
              type="button"
              onClick={handleUrlApply}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[--accent-color] text-black font-medium text-sm hover:bg-[--accent-color]/90 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
          </motion.div>
        )}

        {/* 파일 업로드 모드 */}
        {mode === 'file' && (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[--accent-color] bg-[--accent-color]/10'
                  : 'border-[--border-color] hover:border-[--accent-color]/50'
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-[--accent-color]' : 'text-[--text-secondary]'}`} />
              <p className="text-sm text-[--text-secondary]">
                {isDragging ? '여기에 놓으세요' : '클릭하거나 파일을 드래그하세요'}
              </p>
              <p className="text-xs text-[--text-secondary]/60 mt-1">PNG, JPG, GIF (최대 5MB)</p>
            </div>
          </motion.div>
        )}

        {/* 붙여넣기 모드 */}
        {mode === 'paste' && (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              ref={pasteAreaRef}
              tabIndex={0}
              onPaste={handlePaste}
              className="border-2 border-dashed border-[--border-color] rounded-xl p-6 text-center cursor-pointer hover:border-[--accent-color]/50 focus:border-[--accent-color] focus:outline-none transition-colors"
            >
              <Clipboard className="w-8 h-8 mx-auto mb-2 text-[--text-secondary]" />
              <p className="text-sm text-[--text-secondary]">
                이 영역을 클릭 후 <kbd className="px-1.5 py-0.5 bg-[--bg-tertiary] rounded text-xs">Ctrl+V</kbd> 로 붙여넣기
              </p>
              <p className="text-xs text-[--text-secondary]/60 mt-1">이미지 또는 URL 모두 가능</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* 미리보기 */}
      {preview && (
        <div className="relative group">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-[--bg-tertiary]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
          {preview.startsWith('data:') && (
            <p className="text-xs text-[--text-secondary] mt-2 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Base64 이미지 (로컬 저장)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
