'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getMessages, saveMessages, translateText, type GuestMessage } from '@/lib/siteData';

type FilterType = 'all' | 'answered' | 'pending';

const content = {
  ko: {
    subtitle: '방명록',
    title: '궁금한 점을 물어보세요',
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
  },
  en: {
    subtitle: 'Guest Book',
    title: 'Ask me anything about service or collaboration.',
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
  },
};

// 질문 작성 팝업 컴포넌트
function QuestionModal({ isOpen, onClose, onSubmit, locale }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: any) => void;
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
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', company: '', email: '', message: '', allowNotification: true, isSecret: false });
      setStatus('idle');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    onSubmit(form);
    setStatus('success');
    setTimeout(() => {
      onClose();
      setStatus('idle');
    }, 1500);
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
                </label>

                <label className={`flex items-center gap-3 ${form.email ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                  <input
                    type="checkbox"
                    checked={form.allowNotification}
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

              {status !== 'idle' && (
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
                  {status === 'success' ? t.success : t.error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary] transition-colors"
                >
                  취소
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {t.submit}
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
          onClick={() => !message.isSecret && !message.isReplyLocked && setIsExpanded(!isExpanded)}
          className={`rounded-lg p-3 ${
            message.isSecret || message.isReplyLocked
              ? 'bg-yellow-500/5 border border-yellow-500/10'
              : 'bg-[--accent-color]/5 border border-[--accent-color]/10 cursor-pointer hover:bg-[--accent-color]/10'
          } transition-colors`}
        >
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className={`w-3.5 h-3.5 ${message.isReplyLocked ? 'text-yellow-400' : 'text-[--accent-color]'}`} />
            <span className="text-xs font-semibold text-white">A.</span>
            {(message.isSecret || message.isReplyLocked) && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">비공개</span>
            )}
            {!message.isSecret && !message.isReplyLocked && (
              <ChevronDown className={`w-3 h-3 text-[--text-secondary] ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </div>
          
          {(message.isSecret || message.isReplyLocked) ? (
            <p className="text-xs text-yellow-400/60 italic">{t.lockedReply}</p>
          ) : (
            <p className={`text-xs text-[--text-secondary] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {/* locale에 따라 번역된 답변 또는 원본 표시 */}
              {locale === 'en' && message.reply_en ? message.reply_en : message.reply}
            </p>
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

  useEffect(() => {
    setIsClient(true);
    const saved = getMessages();
    setMessages(saved);
  }, []);

  const persistMessages = (data: GuestMessage[]) => {
    setMessages(data);
    saveMessages(data);
  };

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
        // 번역 결과가 원본과 같으면 undefined
        if (translatedMessage === originalMessage) {
          translatedMessage = undefined;
        }
      } catch {
        translatedMessage = undefined;
      }
    }

    const newMessage: GuestMessage = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `msg-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      message: originalMessage,  // 원본 (한글)
      message_en: translatedMessage,  // 영문 번역
      allowNotification: !!form.email && form.allowNotification,
      isSecret: form.isSecret,
      createdAt: new Date().toISOString(),
      isRead: false,
      isReplyLocked: form.isSecret,
    };

    const updated = [newMessage, ...messages];
    persistMessages(updated);
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
          {filteredMessages.length === 0 ? (
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
