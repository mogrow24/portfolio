'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Lock, Sparkles } from 'lucide-react';

// 비밀 코드 설정 (원하시면 변경하세요)
const SECRET_CODE = '7807';

interface SecretAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecretAccess({ isOpen, onClose }: SecretAccessProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(false);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === SECRET_CODE) {
      setSuccess(true);
      // 인증 상태를 로컬 스토리지에 저장
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_auth_time', Date.now().toString());
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 800);
    } else {
      setError(true);
      setCode('');
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleKeyPress = (num: string) => {
    if (code.length < 4) {
      setCode(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
                ) : (
                  <Lock className={`w-7 h-7 ${error ? 'text-red-400' : 'text-[--accent-color]'}`} />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Admin Access</h3>
              <p className="text-[--text-secondary] text-sm">Enter 4-digit code</p>
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
                    type={key === '' ? 'button' : key === 'del' ? 'button' : 'button'}
                    onClick={() => {
                      if (key === 'del') handleDelete();
                      else if (key !== '') handleKeyPress(key);
                    }}
                    disabled={key === '' || success}
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
                disabled={code.length !== 4 || success}
                whileHover={{ scale: code.length === 4 ? 1.02 : 1 }}
                whileTap={{ scale: code.length === 4 ? 0.98 : 1 }}
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                  success
                    ? 'bg-green-500 text-white'
                    : code.length === 4
                    ? 'bg-[--accent-color] text-black hover:shadow-[0_0_20px_rgba(0,223,192,0.3)]'
                    : 'bg-[--bg-tertiary] text-[--text-secondary] cursor-not-allowed'
                }`}
              >
                {success ? '✓ Access Granted' : 'Confirm'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

