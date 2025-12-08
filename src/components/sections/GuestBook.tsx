'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Lock,
  Unlock,
  Bell,
  Mail,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Building2,
  User,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getMessages, saveMessages, translateText, type GuestMessage, SITE_DATA_UPDATED_EVENT, STORAGE_KEYS } from '@/lib/siteData';
import { api, isSupabaseAvailable, type GuestbookDB } from '@/lib/supabase';

// Supabase DB 타입을 GuestMessage 타입으로 변환
function dbToGuestMessage(db: GuestbookDB): GuestMessage {
  return {
    id: db.id,
    name: db.name,
    company: db.company,
    email: db.email,
    message: db.message,
    message_en: db.message_en,
    allowNotification: db.allow_notification,
    isSecret: db.is_secret,
    createdAt: db.created_at,
    isRead: db.is_read,
    reply: db.reply,
    reply_en: db.reply_en,
    replyAt: db.reply_at,
    isReplyLocked: db.is_reply_locked,
  };
}

type FilterType = 'all' | 'answered' | 'pending';

const content = {
  ko: {
    subtitle: 'Q&A',
    title: '궁금한 점을 남겨주세요',
    desc: '이름과 이메일(선택)을 남겨주시면 직접 답변을 드리고, 이메일로 알림도 전송해드립니다.',
    nameLabel: '이름',
    namePlaceholder: '홍길동',
    companyLabel: '회사/소속 (선택)',
    companyPlaceholder: '회사명 또는 소속',
    emailLabel: '이메일 (선택)',
    emailHelper: '이메일을 남기면 답변 알림을 받아볼 수 있습니다.',
    messageLabel: '메시지',
    messagePlaceholder: '프로젝트, 협업 문의, 커리어 관련 궁금한 점을 남겨주세요.',
    allowNotification: '답변 알림 수신 동의',
    secretMessage: '비밀글로 작성 (관리자만 볼 수 있습니다)',
    submit: '질문 남기기',
    submitButton: '질문 남기기',
    success: '메시지가 등록되었습니다. 빠르게 답변드릴게요!',
    error: '필수 항목을 모두 입력해주세요.',
    submitError: '등록에 실패했습니다. 다시 시도해주세요.',
    filterAll: '전체',
    filterAnswered: '답변 완료',
    filterPending: '답변 대기',
    empty: '첫 번째 질문을 남겨보세요.',
    lockedReply: '비공개 답변입니다. 입력하신 이메일로만 안내됩니다.',
    notificationBadge: '알림 예정',
    awaitingReply: '답변 준비 중입니다.',
    secretBadge: '비밀글',
    secretMessageHidden: '비밀글입니다. 본인만 확인 가능합니다.',
    secretQuestionBlur: '비밀글로 작성된 질문입니다.',
    showReply: '답변 보기',
    hideReply: '답변 접기',
    modalTitle: '질문 남기기',
    modalDesc: '궁금한 점을 남겨주세요',
    replyLabel: '답변',
    privateReplyLabel: '비공개 답변',
    privateBadge: '비공개',
    answeredBadge: '답변 완료',
    cancel: '취소',
  },
  en: {
    subtitle: 'Q&A',
    title: 'Leave Your Questions',
    desc: 'Leave your name and email (optional) to receive direct answers and email notifications.',
    nameLabel: 'Name',
    namePlaceholder: 'John Doe',
    companyLabel: 'Company (optional)',
    companyPlaceholder: 'Company or Organization',
    emailLabel: 'Email (optional)',
    emailHelper: 'Receive notification if you leave your email.',
    messageLabel: 'Message',
    messagePlaceholder: 'Share questions about projects, collaboration, or career notes.',
    allowNotification: 'I agree to receive notification',
    secretMessage: 'Post as private (only admin can see)',
    submit: 'Submit Question',
    submitButton: 'Submit Question',
    success: 'Your message has been received. I will respond shortly!',
    error: 'Please fill out the required fields.',
    submitError: 'Failed to submit. Please try again.',
    filterAll: 'All',
    filterAnswered: 'Answered',
    filterPending: 'Pending',
    empty: 'Be the first to leave a question.',
    lockedReply: 'This reply is private. Only the requester receives the answer.',
    notificationBadge: 'Notify',
    awaitingReply: 'Awaiting reply',
    secretBadge: 'Private',
    secretMessageHidden: 'This is a private message. Only visible to you.',
    secretQuestionBlur: 'This question was posted as private.',
    showReply: 'Show Reply',
    hideReply: 'Hide Reply',
    modalTitle: 'Submit Question',
    modalDesc: 'Leave your question here',
    replyLabel: 'Reply',
    privateReplyLabel: 'Private Reply',
    privateBadge: 'Private',
    answeredBadge: 'Answered',
    cancel: 'Cancel',
  },
};

// 질문 작성 팝업 컴포넌트
function QuestionModal({ isOpen, onClose, onSubmit, locale }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: any) => Promise<void>;
  locale: string;
}) {
  const t = content[locale as keyof typeof content] ?? content.ko;
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    allowNotification: true,
    isSecret: false,
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'submitError'>('idle');

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', company: '', email: '', message: '', allowNotification: true, isSecret: false });
      setStatus('idle');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('submitting');
    try {
      await onSubmit(form);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 800); // 0.8초 후 팝업 닫힘
    } catch (error) {
      console.error('질문 등록 실패:', error);
      setStatus('submitError');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-card rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[--accent-color]/15 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[--accent-color]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t.modalTitle}</h3>
                  <p className="text-xs text-[--text-secondary]">{t.modalDesc}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[--bg-tertiary] hover:bg-[--bg-tertiary]/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-[--text-secondary]" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* 이름 & 회사명 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[--text-secondary] mb-2 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {t.nameLabel} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={t.namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[--text-secondary] mb-2 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {t.companyLabel}
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder={t.companyPlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-semibold text-[--text-secondary] mb-2 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {t.emailLabel}
                </label>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                    placeholder="example@email.com"
                  />
                  <p className="text-xs text-[--text-secondary] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {t.emailHelper}
                  </p>
                </div>
              </div>

              {/* 메시지 */}
              <div>
                <label className="block text-sm font-semibold text-[--text-secondary] mb-2">
                  {t.messageLabel} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  placeholder={t.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  required
                />
              </div>

              {/* 옵션 체크박스 */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[--bg-tertiary]/50 border border-[--border-color] hover:border-[--accent-color]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isSecret}
                    onChange={(e) => setForm((prev) => ({ ...prev, isSecret: e.target.checked }))}
                    className="w-4 h-4 rounded border-[--border-color] bg-[--bg-tertiary] text-[--accent-color]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      {form.isSecret ? (
                        <EyeOff className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-[--text-secondary]" />
                      )}
                      <span className={form.isSecret ? 'text-yellow-400' : 'text-[--text-secondary]'}>
                        {t.secretMessage}
                      </span>
                    </div>
                    {form.isSecret && !form.email && (
                      <p className="text-xs text-yellow-400/70 mt-1 ml-6">
                        {locale === 'en'
                          ? '💡 Add email to receive answer notification'
                          : '💡 이메일을 입력하시면 답변 알림을 받을 수 있습니다'}
                      </p>
                    )}
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  form.email
                    ? 'cursor-pointer bg-[--bg-tertiary]/30 border-[--border-color] hover:border-[--accent-color]/50'
                    : 'cursor-not-allowed opacity-50 bg-[--bg-tertiary]/10 border-[--border-color]'
                }`}>
                  <input
                    type="checkbox"
                    checked={form.allowNotification && !!form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, allowNotification: e.target.checked }))}
                    className="w-4 h-4 rounded border-[--border-color] bg-[--bg-tertiary] text-[--accent-color]"
                    disabled={!form.email}
                  />
                  <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
                    <Bell className="w-4 h-4 text-[--accent-color]" />
                    {t.allowNotification}
                  </div>
                </label>
              </div>

              {(status === 'success' || status === 'error' || status === 'submitError') && (
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                    status === 'success'
                      ? 'bg-[--accent-color]/15 text-[--accent-color]'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {status === 'success' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {status === 'success' ? t.success : status === 'submitError' ? t.submitError : t.error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'submitting'}
                  className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary] transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <motion.button
                  type="submit"
                  disabled={status === 'submitting'}
                  whileHover={{ scale: status === 'submitting' ? 1 : 1.02 }}
                  whileTap={{ scale: status === 'submitting' ? 1 : 0.98 }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t.submit}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 질문 카드 컴포넌트 - 간소화 버전
function QuestionCard({ message, locale, onToggleReply }: {
  message: GuestMessage;
  locale: string;
  onToggleReply: (id: string) => void;
}) {
  const t = content[locale as keyof typeof content] ?? content.ko;
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-4 hover:border-[--accent-color]/20 transition-colors"
    >
      {/* 컴팩트 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${message.isSecret ? 'text-yellow-400' : 'text-white'}`}>
            {message.isSecret ? '익명' : message.name}
          </span>
          {message.isSecret && (
            <Lock className="w-3 h-3 text-yellow-400" />
          )}
          {!message.isSecret && message.company && (
            <span className="text-xs text-[--text-secondary]">· {message.company}</span>
          )}
          {message.reply && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" title={t.answeredBadge} />
          )}
        </div>
        <span className="text-[--text-secondary] text-[10px]">{formatDate(message.createdAt)}</span>
      </div>

      {/* 질문 내용 */}
      <div className="mb-3">
        {message.isSecret ? (
          <p className="text-xs text-yellow-400/70 italic">🔒 {t.secretQuestionBlur}</p>
        ) : (
          <p className="text-sm text-[--text-secondary] leading-relaxed line-clamp-3">
            {/* locale에 따라 번역된 메시지 또는 원본 표시 */}
            {locale === 'en' && message.message_en ? message.message_en : message.message}
          </p>
        )}
      </div>

      {/* 답변 영역 - 간소화 */}
      {message.reply ? (
        <div 
          className={`rounded-lg p-3 ${
            message.isSecret || message.isReplyLocked
              ? 'bg-yellow-500/5 border border-yellow-500/10'
              : 'bg-[--accent-color]/5 border border-[--accent-color]/10'
          }`}
        >
          {/* 헤더 - 클릭 가능한 버튼 */}
          <button
            type="button"
            onClick={() => {
              if (!message.isSecret && !message.isReplyLocked) {
                setIsExpanded(prev => !prev);
              }
            }}
            disabled={message.isSecret || message.isReplyLocked}
            className={`w-full flex items-center justify-between ${
              !message.isSecret && !message.isReplyLocked ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className={`w-3.5 h-3.5 ${message.isReplyLocked ? 'text-yellow-400' : 'text-[--accent-color]'}`} />
              <span className="text-xs font-semibold text-white">윤지희</span>
              {(message.isSecret || message.isReplyLocked) && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">비공개</span>
              )}
            </div>
            {!message.isSecret && !message.isReplyLocked && (
              <div className="flex items-center gap-1 text-[--accent-color]">
                <span className="text-[10px]">{isExpanded ? t.hideReply : t.showReply}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </div>
            )}
          </button>
          
          {/* 답변 내용 */}
          {(message.isSecret || message.isReplyLocked) ? (
            <p className="text-xs text-yellow-400/60 italic mt-2">{t.lockedReply}</p>
          ) : (
            <div
              style={{
                maxHeight: isExpanded ? '500px' : '0px',
                opacity: isExpanded ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease, opacity 0.2s ease',
              }}
            >
              <p className="text-xs text-[--text-secondary] leading-relaxed mt-2 whitespace-pre-line">
                {locale === 'en' && message.reply_en ? message.reply_en : message.reply}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[--text-secondary] text-xs">
          <div className="w-1 h-1 rounded-full bg-[--text-secondary] animate-pulse" />
          {t.awaitingReply}
        </div>
      )}
    </motion.div>
  );
}

export default function GuestBook() {
  const { locale } = useLocale();
  const t = content[locale as keyof typeof content] ?? content.ko;

  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);

  // 데이터 로드 (Supabase 우선, 폴백: 로컬스토리지)
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseAvailable()) {
        const dbMessages = await api.getGuestbook();
        // Supabase 연결 성공 - DB 데이터 사용
        setMessages(dbMessages.map(dbToGuestMessage));
        setUseSupabase(true);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Supabase 로드 실패, 로컬스토리지 사용:', error);
    }
    // 폴백: 로컬스토리지
    const saved = getMessages();
    setMessages(saved);
    setUseSupabase(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsClient(true);
    loadMessages();
    
    // 같은 탭에서 메시지 업데이트 감지 (어드민에서 답변/삭제 시)
    const handleDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.MESSAGES) {
        // Supabase 사용 시 DB에서 최신 데이터 다시 로드
        if (useSupabase) {
          loadMessages();
        } else {
          // 로컬스토리지 모드면 이벤트에서 전달된 데이터 사용 또는 다시 로드
          loadMessages();
        }
      }
    };
    
    // 다른 탭에서 메시지 업데이트 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.MESSAGES) {
        loadMessages();
      }
    };
    
    window.addEventListener(SITE_DATA_UPDATED_EVENT, handleDataUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(SITE_DATA_UPDATED_EVENT, handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadMessages, useSupabase]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (filter === 'answered') {
      filtered = filtered.filter((msg) => msg.reply);
    } else if (filter === 'pending') {
      filtered = filtered.filter((msg) => !msg.reply);
    }
    return filtered;
  }, [messages, filter]);

  const handleSubmit = async (form: any) => {
    const originalMessage = form.message.trim();
    
    // 영문 버전인 경우 한글→영어 번역 시도
    let translatedMessage: string | undefined;
    if (locale === 'en') {
      try {
        translatedMessage = await translateText(originalMessage, 'ko', 'en');
        if (translatedMessage === originalMessage) {
          translatedMessage = undefined;
        }
      } catch {
        translatedMessage = undefined;
      }
    }

    // Supabase 사용 시: 서버 API를 통해 Service Role로 삽입 (RLS 우회)
    if (useSupabase && isSupabaseAvailable()) {
      try {
        const response = await fetch('/api/guestbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            company: form.company.trim() || undefined,
            email: form.email.trim() || undefined,
            message: originalMessage,
            message_en: translatedMessage,
            allow_notification: !!form.email && form.allowNotification,
            is_secret: form.isSecret || false,
          }),
        });

        // 응답 JSON 파싱 (한 번만 호출)
        let result;
        try {
          const responseText = await response.text();
          if (!responseText) {
            throw new Error('서버 응답이 비어있습니다.');
          }
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON 파싱 실패:', parseError);
          console.error('응답 상태:', response.status, response.statusText);
          throw new Error('서버 응답을 처리할 수 없습니다.');
        }

        // 네트워크 에러 체크 (JSON 파싱 후)
        if (!response.ok) {
          const errorMessage = result?.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error('API 에러 응답:', { status: response.status, error: errorMessage, result });
          throw new Error(errorMessage);
        }

        // 성공 여부 확인
        if (!result?.success) {
          const errorMessage = result?.error || '저장에 실패했습니다.';
          console.error('저장 실패:', { result, error: errorMessage });
          throw new Error(errorMessage);
        }

        // 비밀글 처리
        if (form.isSecret || result.is_secret) {
          // 비밀글은 저장 성공만 알리고 목록은 갱신 신호만 보냄
          // (어드민에서만 조회 가능)
          // 성공적으로 저장되었음을 확인하기 위해 이벤트 발생
          console.log('비밀글 등록 성공:', result);

          // 어드민 페이지에만 갱신 신호 전송
          window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
            detail: { key: STORAGE_KEYS.MESSAGES }
          }));

          // 비밀글 등록 성공 - 정상적으로 완료되었으므로 정상 반환
          // handleSubmit의 success 상태가 표시됨
          return;
        }

        // 공개글은 반환된 데이터를 바로 반영
        if (result.data) {
          const newMsg = dbToGuestMessage(result.data as GuestbookDB);
          setMessages(prev => [newMsg, ...prev]);
          window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
            detail: { key: STORAGE_KEYS.MESSAGES, data: newMsg }
          }));
        }
        return;
      } catch (error: any) {
        console.error('Supabase 저장 실패:', error);
        // 에러 메시지가 이미 명확하면 그대로 사용, 아니면 기본 메시지
        const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }
    }

    // 로컬스토리지 모드: 로컬스토리지에 저장
    const newMessage: GuestMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `msg-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      message: originalMessage,
      message_en: translatedMessage,
      allowNotification: !!form.email && form.allowNotification,
      isSecret: form.isSecret,
      createdAt: new Date().toISOString(),
      isRead: false,
      isReplyLocked: form.isSecret,
    };

    // 로컬스토리지에 저장
    const currentMessages = getMessages();
    const updated = [newMessage, ...currentMessages];
    saveMessages(updated);

    // 비밀글이 아닌 경우에만 UI에 즉시 반영
    if (!form.isSecret) {
      setMessages(prev => [newMessage, ...prev]);
    }

    // 이벤트 발생 (어드민 페이지 갱신용)
    window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
      detail: { key: STORAGE_KEYS.MESSAGES, data: newMessage }
    }));
  };

  if (!isClient) {
    return null;
  }

  return (
    <section id="guest-book" className="py-20 md:py-28 bg-[--bg-secondary] relative">
      {/* 상단 장식 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/20 to-transparent" />
      
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="sub-title">{t.subtitle}</span>
          <h2 className="text-responsive-lg font-extrabold mb-4">{t.title}</h2>
          <p className="text-[--text-secondary] max-w-2xl mx-auto text-sm md:text-base mb-6">
            {t.desc}
          </p>
          
          {/* 질문 남기기 버튼 */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[--accent-color] text-black font-bold text-sm md:text-base hover:shadow-[0_0_30px_rgba(0,223,192,0.4)] transition-all"
          >
            <Plus className="w-5 h-5" />
            {t.submitButton}
          </motion.button>
        </motion.div>

        {/* 필터 및 메시지 리스트 */}
        <div className="max-w-3xl mx-auto">
          {/* 필터 */}
          <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
            <div className="flex gap-2">
              {([
                { id: 'all', label: t.filterAll },
                { id: 'answered', label: t.filterAnswered },
                { id: 'pending', label: t.filterPending },
              ] as { id: FilterType; label: string }[]).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    filter === item.id
                      ? 'bg-[--accent-color] text-black'
                      : 'bg-[--bg-tertiary] text-[--text-secondary] hover:bg-[--bg-tertiary]/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="text-[--text-secondary] text-xs">
              {filteredMessages.length} / {messages.length}
            </span>
          </div>

          {/* 메시지 리스트 */}
          {isLoading ? (
            <div className="glass-card rounded-2xl p-12 text-center text-[--text-secondary]">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-[--accent-color]" />
              <p className="text-sm">Loading...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-[--text-secondary]">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">{t.empty}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <QuestionCard
                  key={msg.id}
                  message={msg}
                  locale={locale}
                  onToggleReply={(id) => {
                    // 필요시 확장
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 질문 작성 팝업 */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        locale={locale}
      />
    </section>
  );
}
