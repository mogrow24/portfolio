'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

interface SecretAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

const content = {
  ko: {
    title: '관리자 접근',
    desc: '4자리 코드를 입력하세요',
    confirm: '확인',
    accessGranted: '✓ 접근 허용됨',
    verifying: '확인 중...',
  },
  en: {
    title: 'Admin Access',
    desc: 'Enter 4-digit code',
    confirm: 'Confirm',
    accessGranted: '✓ Access Granted',
    verifying: 'Verifying...',
  },
};

export default function SecretAccess({ isOpen, onClose }: SecretAccessProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = content[locale as keyof typeof content] ?? content.ko;
  
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(false);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || code.length !== 4) return;
    
    setLoading(true);
    setError(false);
    
    try {
      // 서버 사이드 API를 통해 인증
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      // 응답이 없거나 실패한 경우
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '인증에 실패했습니다.' }));
        console.error('인증 실패:', response.status, errorData);
        setError(true);
        setCode('');
        setLoading(false);
        setTimeout(() => setError(false), 2000);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        setSuccess(true);
        // 토큰을 로컬 스토리지에 저장 (비밀번호가 아닌 인증 토큰)
        localStorage.setItem('admin_auth_token', data.token);
        localStorage.setItem('admin_auth_time', Date.now().toString());
        
        // 성공 후 대시보드로 이동
        setTimeout(() => {
          setLoading(false);
          router.push('/admin/dashboard');
        }, 800);
      } else {
        console.error('인증 실패:', data);
        setError(true);
        setCode('');
        setLoading(false);
        setTimeout(() => setError(false), 2000);
      }
    } catch (error) {
      console.error('인증 요청 오류:', error);
      setError(true);
      setCode('');
      setLoading(false);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeyPress = (num: string) => {
    if (code.length < 4 && !loading) {
      setCode(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (!loading) {
      setCode(prev => prev.slice(0, -1));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-[--bg-secondary] border border-[--border-color] rounded-2xl p-6 md:p-8"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 헤더 */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-colors ${success ? 'bg-green-500' : 'bg-[--accent-color]/20'}`}>
                {success ? (
                  <Sparkles className="w-7 h-7 text-white" />
                ) : loading ? (
                  <Loader2 className="w-7 h-7 text-[--accent-color] animate-spin" />
                ) : (
                  <Lock className={`w-7 h-7 ${error ? 'text-red-400' : 'text-[--accent-color]'}`} />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{t.title}</h3>
              <p className="text-[--text-secondary] text-sm">{t.desc}</p>
            </div>

            {/* 코드 입력 표시 */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all ${
                    success
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : error
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : code.length > i
                      ? 'border-[--accent-color] bg-[--accent-color]/10 text-[--accent-color]'
                      : 'border-[--border-color] bg-[--bg-tertiary]'
                  }`}
                >
                  {code[i] ? '•' : ''}
                </motion.div>
              ))}
            </div>

            {/* 숫자 키패드 */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'del') handleDelete();
                      else if (key !== '') handleKeyPress(key);
                    }}
                    disabled={key === '' || success || loading}
                    className={`h-14 rounded-xl font-bold text-lg transition-all ${
                      key === ''
                        ? 'cursor-default'
                        : key === 'del'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-[--bg-tertiary] hover:bg-[--accent-color]/10 hover:text-[--accent-color]'
                    } disabled:opacity-50`}
                  >
                    {key === 'del' ? '←' : key}
                  </button>
                ))}
              </div>

              {/* 확인 버튼 */}
              <motion.button
                type="submit"
                disabled={code.length !== 4 || success || loading}
                whileHover={{ scale: code.length === 4 && !loading ? 1.02 : 1 }}
                whileTap={{ scale: code.length === 4 && !loading ? 0.98 : 1 }}
                className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  success
                    ? 'bg-green-500 text-white'
                    : code.length === 4 && !loading
                    ? 'bg-[--accent-color] text-black hover:shadow-[0_0_20px_rgba(0,223,192,0.3)]'
                    : 'bg-[--bg-tertiary] text-[--text-secondary] cursor-not-allowed'
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {success ? t.accessGranted : loading ? t.verifying : t.confirm}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
