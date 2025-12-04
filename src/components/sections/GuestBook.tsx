'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { getMessages, saveMessages, type GuestMessage } from '@/lib/siteData';

type FilterType = 'all' | 'answered' | 'pending';

const content = {
  ko: {
    subtitle: 'Guest Book',
    title: '서비스/협업 관련해서 무엇이든 물어보세요.',
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
    secretMessageHidden: '비밀글입니다.',
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
    secretMessageHidden: 'This is a private message.',
  },
};

export default function GuestBook() {
  const { locale } = useLocale();
  const t = content[locale as keyof typeof content] ?? content.ko;

  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    allowNotification: true,
    isSecret: false,
  });

  useEffect(() => {
    setIsClient(true);
    const saved = getMessages();
    setMessages(saved);
  }, []);

  const persistMessages = (data: GuestMessage[]) => {
    setMessages(data);
    saveMessages(data);
  };

  // 비밀글이 아닌 메시지만 필터링 (공개용)
  const publicMessages = useMemo(() => {
    return messages.filter((msg) => !msg.isSecret);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let filtered = publicMessages;
    if (filter === 'answered') {
      filtered = filtered.filter((msg) => msg.reply);
    } else if (filter === 'pending') {
      filtered = filtered.filter((msg) => !msg.reply);
    }
    return filtered;
  }, [publicMessages, filter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const newMessage: GuestMessage = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `msg-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      message: form.message.trim(),
      allowNotification: !!form.email && form.allowNotification,
      isSecret: form.isSecret,
      createdAt: new Date().toISOString(),
      isRead: false,
      isReplyLocked: false,
    };

    const updated = [newMessage, ...messages];
    persistMessages(updated);
    setForm({ name: '', company: '', email: '', message: '', allowNotification: true, isSecret: false });
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  if (!isClient) {
    return null;
  }

  return (
    <section id="guest-book" className="py-16 md:py-24 bg-[--bg-secondary]">
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
          <p className="text-[--text-secondary] max-w-2xl mx-auto text-sm md:text-base">
            {t.desc}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* 입력 폼 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[--accent-color]/15 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[--accent-color]" />
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-[--text-secondary]">
                  Guest Messaging
                </p>
                <h3 className="text-lg font-bold text-white">Leave your note</h3>
              </div>
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
                  rows={4}
                  placeholder={t.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
                  required
                />
              </div>

              {/* 옵션 체크박스 */}
              <div className="space-y-3">
                {/* 비밀글 옵션 */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[--bg-tertiary]/50 border border-[--border-color] hover:border-[--accent-color]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isSecret}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isSecret: e.target.checked }))
                    }
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

                {/* 알림 수신 동의 */}
                <label className={`flex items-center gap-3 ${form.email ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                  <input
                    type="checkbox"
                    checked={form.allowNotification}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, allowNotification: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-[--border-color] bg-[--bg-tertiary] text-[--accent-color]"
                    disabled={!form.email}
                  />
                  <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
                    <Bell className="w-4 h-4 text-[--accent-color]" />
                    {t.allowNotification}
                    {!form.email && (
                      <span className="text-[10px] px-2 py-0.5 bg-[--bg-tertiary] rounded-full">
                        Email required
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t.submit}
              </motion.button>

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
            </form>
          </motion.div>

          {/* 메시지 리스트 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2 justify-between items-center">
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
                        : 'bg-[--bg-tertiary] text-[--text-secondary]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="text-[--text-secondary] text-xs">
                {filteredMessages.length} / {publicMessages.length}
              </span>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-[--text-secondary]">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                {t.empty}
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-semibold">{msg.name}</h4>
                        {msg.company && (
                          <span className="text-xs text-[--text-secondary] flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {msg.company}
                          </span>
                        )}
                        {msg.email && msg.allowNotification && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--accent-color]/10 text-[--accent-color] flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            {t.notificationBadge}
                          </span>
                        )}
                      </div>
                      {msg.email && (
                        <p className="text-[--text-secondary] text-xs flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {msg.email}
                        </p>
                      )}
                    </div>
                    <div className="text-[--text-secondary] text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-[--text-secondary] whitespace-pre-wrap mb-4">
                    {msg.message}
                  </p>

                  {msg.reply ? (
                    <div className="p-4 rounded-xl bg-[--accent-color]/5 border border-[--accent-color]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[--accent-color] flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Reply
                        </span>
                        {msg.isReplyLocked ? (
                          <span className="flex items-center gap-1 text-xs text-[--text-secondary]">
                            <Lock className="w-3 h-3" />
                            {t.lockedReply}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-300">
                            <Unlock className="w-3 h-3" />
                            Public
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          msg.isReplyLocked ? 'text-[--text-secondary]/60 italic blur-[1px]' : 'text-[--text-secondary]'
                        }`}
                      >
                        {msg.isReplyLocked ? t.lockedReply : msg.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[--border-color] text-[--text-secondary] text-xs px-3 py-2 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {t.awaitingReply}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
