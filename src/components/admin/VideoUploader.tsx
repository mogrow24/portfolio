'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, Clipboard, X, Video, Check, Loader2, Play } from 'lucide-react';

type UploadMode = 'file' | 'url' | 'paste';

interface VideoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function VideoUploader({
  value,
  onChange,
  label = '영상',
  placeholder = '영상 URL을 입력하세요',
  className = '',
}: VideoUploaderProps) {
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

  // 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!videoTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      setError('비디오 파일만 업로드 가능합니다. (MP4, WebM, OGG, MOV, AVI)');
      return;
    }

    // 파일 크기 제한 (500MB) - 브라우저 메모리 제약으로 매우 큰 파일은 URL 방식 권장
    if (file.size > 500 * 1024 * 1024) {
      setError('파일 크기는 500MB 이하여야 합니다. 더 큰 파일은 URL 방식 사용을 권장합니다.');
      return;
    }

    // 100MB 이상인 경우 경고
    if (file.size > 100 * 1024 * 1024) {
      const proceed = window.confirm(
        `파일 크기가 ${(file.size / 1024 / 1024).toFixed(1)}MB입니다.\n` +
        `큰 파일은 브라우저 성능에 영향을 줄 수 있습니다.\n` +
        `계속 진행하시겠습니까?`
      );
      if (!proceed) {
        setError(null);
        return;
      }
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
  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    setPreview(urlInput);
    onChange(urlInput);
    setIsLoading(false);
  };

  // 클립보드에서 붙여넣기
  const handlePaste = useCallback(async (e: ClipboardEvent | React.ClipboardEvent) => {
    e.preventDefault();
    setError(null);

    const clipboardData = 'clipboardData' in e ? e.clipboardData : null;
    if (!clipboardData) return;

    // 비디오 파일 확인
    const items = Array.from(clipboardData.items);
    const videoItem = items.find(item => item.type.startsWith('video/'));

    if (videoItem) {
      const file = videoItem.getAsFile();
      if (file) {
        await handleFileUpload(file);
        return;
      }
    }

    // 텍스트(URL) 확인
    const text = clipboardData.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:video/'))) {
      setPreview(text);
      onChange(text);
      setUrlInput(text);
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

  // 영상 삭제
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
              accept="video/*,.mp4,.webm,.ogg,.mov,.avi"
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
              <p className="text-xs text-[--text-secondary]/60 mt-1">MP4, WebM, OGG, MOV, AVI (최대 500MB, 100MB 이상은 성능 저하 가능)</p>
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
              <p className="text-xs text-[--text-secondary]/60 mt-1">비디오 파일 또는 URL 모두 가능</p>
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
            {preview.startsWith('data:video/') || preview.startsWith('http') ? (
              <>
                {preview.startsWith('http') && !preview.match(/\.(mp4|webm|ogg|mov|avi)$/i) ? (
                  <div className="w-full h-full flex items-center justify-center bg-[--bg-secondary]">
                    <p className="text-[--text-secondary] text-sm">YouTube, Vimeo 등의 URL은 직접 재생됩니다.</p>
                  </div>
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-12 h-12 text-[--text-secondary]" />
              </div>
            )}
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
          {preview.startsWith('data:video/') && (
            <p className="text-xs text-[--text-secondary] mt-2 flex items-center gap-1">
              <Video className="w-3 h-3" />
              Base64 비디오 (로컬 저장, 100MB 이상은 성능 저하 가능)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

