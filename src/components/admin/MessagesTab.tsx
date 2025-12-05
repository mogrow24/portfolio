'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, MessageSquare, User, Mail, Clock, Check, Send, Trash2, Lock, Unlock, Bell, X, Edit3, Loader2, Building2, EyeOff, Eye } from 'lucide-react';
import { getMessages, saveMessages, translateText, type GuestMessage } from '@/lib/siteData';
import { sendReplyEmail } from '@/lib/email';

export default function MessagesTab() {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [saving, setSaving] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<GuestMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<GuestMessage | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'secret'>('all');

  useEffect(() => {
    setMessages(getMessages());
  }, []);

  const handleSave = () => {
    setSaving(true);
    saveMessages(messages);
    setTimeout(() => setSaving(false), 1000);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const secretCount = messages.filter(m => m.isSecret).length;

  const filteredMessages = messages.filter(m => {
    if (filterType === 'public') return !m.isSecret;
    if (filterType === 'secret') return m.isSecret;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, isRead: true } : m);
    setMessages(updated);
    saveMessages(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    saveMessages(updated);
  };

  const handleToggleLock = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, isReplyLocked: !m.isReplyLocked } : m);
    setMessages(updated);
    saveMessages(updated);
  };

  const handleToggleSecret = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, isSecret: !m.isSecret } : m);
    setMessages(updated);
    saveMessages(updated);
  };

  const handleSaveReply = async (messageId: string, reply: string, isLocked: boolean, shouldSendEmail: boolean) => {
    const targetMessage = messages.find(m => m.id === messageId);
    
    // 답변 영어 번역 시도
    let reply_en: string | undefined;
    try {
      const translated = await translateText(reply, 'ko', 'en');
      if (translated !== reply) {
        reply_en = translated;
      }
    } catch {
      reply_en = undefined;
    }
    
    const updated = messages.map(m =>
      m.id === messageId
        ? { ...m, reply, reply_en, isReplyLocked: isLocked, replyAt: new Date().toISOString(), isRead: true }
        : m
    );
    setMessages(updated);
    saveMessages(updated);
    
    // 이메일 알림 발송
    if (shouldSendEmail && targetMessage?.email && targetMessage.allowNotification) {
      try {
        const result = await sendReplyEmail({
          to: targetMessage.email,
          name: targetMessage.name,
          question: targetMessage.message,
          answer: reply,
          isLocked: isLocked,
        });
        
        if (result.success) {
          if (result.simulated) {
            alert('답변이 저장되었습니다.\n(개발 환경: 이메일 발송이 시뮬레이션되었습니다)');
          } else {
            alert('답변이 저장되었습니다.\n이메일 알림이 발송되었습니다.');
          }
        } else {
          const errorMsg = result.error || '알 수 없는 오류';
          console.error('이메일 발송 실패:', errorMsg);
          alert(`답변은 저장되었지만 이메일 발송에 실패했습니다.\n\n오류: ${errorMsg}\n\n환경 변수(GMAIL_USER, GMAIL_APP_PASSWORD)를 확인해주세요.`);
        }
      } catch (error) {
        console.error('이메일 발송 중 예외 발생:', error);
        alert('답변은 저장되었지만 이메일 발송 중 오류가 발생했습니다.\n\n콘솔을 확인해주세요.');
      }
    } else if (shouldSendEmail && (!targetMessage?.email || !targetMessage?.allowNotification)) {
      alert('답변이 저장되었습니다.\n(이메일 주소가 없거나 알림 수신 동의가 없어 이메일을 발송하지 않았습니다)');
    } else {
      alert('답변이 저장되었습니다.');
    }
    
    setIsReplyModalOpen(false);
    setReplyingMessage(null);
  };

  const handleSaveEditedMessage = async (messageId: string, name: string, company: string | undefined, email: string | undefined, message: string, isSecret: boolean) => {
    // 메시지 영어 번역 시도
    let message_en: string | undefined;
    try {
      const translated = await translateText(message, 'ko', 'en');
      if (translated !== message) {
        message_en = translated;
      }
    } catch {
      message_en = undefined;
    }
    
    const updated = messages.map(m =>
      m.id === messageId
        ? { ...m, name, company, email, message, message_en, isSecret }
        : m
    );
    setMessages(updated);
    saveMessages(updated);
    setIsEditModalOpen(false);
    setEditingMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">메시지 관리</h2>
          <p className="text-sm text-[--text-secondary]">
            총 {messages.length}개 | 읽지 않음 {unreadCount}개 | 비밀글 {secretCount}개
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-[--bg-tertiary] rounded-lg p-1">
            {(['all', 'public', 'secret'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-[--accent-color] text-black'
                    : 'text-[--text-secondary] hover:text-white'
                }`}
              >
                {type === 'all' && '전체'}
                {type === 'public' && '공개'}
                {type === 'secret' && '비밀글'}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </motion.button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-[--text-secondary]">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>메시지가 없습니다.</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card rounded-xl p-4 ${!msg.isRead ? 'border-l-4 border-l-[--accent-color]' : ''} ${msg.isSecret ? 'border border-yellow-500/30 bg-yellow-500/5' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.isRead ? 'bg-[--bg-tertiary]' : 'bg-[--accent-color]/15'}`}>
                    <User className={`w-5 h-5 ${msg.isRead ? 'text-[--text-secondary]' : 'text-[--accent-color]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{msg.name}</span>
                      {msg.company && (
                        <span className="text-xs text-[--text-secondary] flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {msg.company}
                        </span>
                      )}
                      {!msg.isRead && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[--accent-color] text-black font-bold">NEW</span>
                      )}
                      {msg.isSecret && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          비밀글
                        </span>
                      )}
                    </div>
                    {msg.email && (
                      <div className="flex items-center gap-1 text-xs text-[--text-secondary]">
                        <Mail className="w-3 h-3" />
                        {msg.email}
                        {msg.allowNotification && (
                          <span className="ml-1 text-[--accent-color]"><Bell className="w-3 h-3 inline" /> 알림 동의</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[--text-secondary] text-xs">
                  <Clock className="w-3 h-3" />
                  {formatDate(msg.createdAt)}
                </div>
              </div>

              <p className="text-sm text-[--text-secondary] whitespace-pre-wrap mb-4 bg-[--bg-tertiary] rounded-lg p-3">
                {msg.message}
              </p>

              {msg.reply && (
                <div className="mb-4 p-3 rounded-lg bg-[--accent-color]/5 border border-[--accent-color]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[--accent-color]">내 답변</span>
                    {msg.isReplyLocked ? (
                      <span className="flex items-center gap-1 text-xs text-[--text-secondary]">
                        <Lock className="w-3 h-3" /> 비공개
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Unlock className="w-3 h-3" /> 공개
                      </span>
                    )}
                    {msg.replyAt && (
                      <span className="text-xs text-[--text-secondary] ml-auto">{formatDate(msg.replyAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-[--text-secondary] whitespace-pre-wrap">{msg.reply}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-[--border-color] flex-wrap">
                {!msg.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(msg.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    읽음 처리
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingMessage(msg);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary] transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  수정
                </button>
                <button
                  onClick={() => {
                    setReplyingMessage(msg);
                    setIsReplyModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[--accent-color] hover:bg-[--accent-color]/10 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  {msg.reply ? '답변 수정' : '답변하기'}
                </button>
                {msg.reply && (
                  <button
                    onClick={() => handleToggleLock(msg.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      msg.isReplyLocked
                        ? 'text-yellow-400 hover:bg-yellow-500/10'
                        : 'text-green-400 hover:bg-green-500/10'
                    }`}
                  >
                    {msg.isReplyLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {msg.isReplyLocked ? '잠금 해제' : '잠금'}
                  </button>
                )}
                <button
                  onClick={() => handleToggleSecret(msg.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    msg.isSecret
                      ? 'text-yellow-400 hover:bg-yellow-500/10'
                      : 'text-[--text-secondary] hover:bg-[--bg-tertiary]'
                  }`}
                >
                  {msg.isSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {msg.isSecret ? '공개로 전환' : '비밀글로 전환'}
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  삭제
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 답변 모달 */}
      <AnimatePresence>
        {isReplyModalOpen && replyingMessage && (
          <ReplyModal
            message={replyingMessage}
            onClose={() => { setIsReplyModalOpen(false); setReplyingMessage(null); }}
            onSave={handleSaveReply}
          />
        )}
      </AnimatePresence>

      {/* 메시지 수정 모달 */}
      <AnimatePresence>
        {isEditModalOpen && editingMessage && (
          <EditMessageModal
            message={editingMessage}
            onClose={() => { setIsEditModalOpen(false); setEditingMessage(null); }}
            onSave={handleSaveEditedMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ReplyModalProps {
  message: GuestMessage;
  onClose: () => void;
  onSave: (messageId: string, reply: string, isLocked: boolean, sendEmail: boolean) => void;
}

function ReplyModal({ message, onClose, onSave }: ReplyModalProps) {
  const [reply, setReply] = useState(message.reply || '');
  const [isLocked, setIsLocked] = useState(message.isReplyLocked);
  const [sendNotification, setSendNotification] = useState(!!message.email && message.allowNotification);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    
    setSending(true);
    await onSave(message.id, reply.trim(), isLocked, sendNotification);
    setSending(false);
  };

  const canSendEmail = message.email && message.allowNotification;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">답변 작성</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-[--bg-tertiary]">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{message.name}</span>
            {message.company && (
              <span className="text-xs text-[--text-secondary] flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {message.company}
              </span>
            )}
            {message.email && (
              <span className="flex items-center gap-1 text-xs text-[--text-secondary]">
                <Mail className="w-3 h-3" />
                {message.email}
              </span>
            )}
            {message.isSecret && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 font-bold">비밀글</span>
            )}
          </div>
          <p className="text-sm text-[--text-secondary] whitespace-pre-wrap">{message.message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">답변 내용</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="답변을 입력하세요..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white placeholder:text-[--text-secondary] focus:outline-none focus:border-[--accent-color] resize-none text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div className="flex items-center gap-2">
                {isLocked ? <Lock className="w-4 h-4 text-[--text-secondary]" /> : <Unlock className="w-4 h-4 text-[--accent-color]" />}
                <span className="text-sm text-[--text-secondary]">답변 비공개 (질문자에게만 공개)</span>
              </div>
            </label>

            <label className={`flex items-center gap-3 ${canSendEmail ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                disabled={!canSendEmail}
                className="w-4 h-4 rounded"
              />
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[--accent-color]" />
                <span className="text-sm text-[--text-secondary]">
                  {canSendEmail
                    ? `이메일 알림 발송 (${message.email})`
                    : message.email
                      ? '알림 수신 동의하지 않음'
                      : '이메일 없음'
                  }
                </span>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  답변 저장
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface EditMessageModalProps {
  message: GuestMessage;
  onClose: () => void;
  onSave: (messageId: string, name: string, company: string | undefined, email: string | undefined, message: string, isSecret: boolean) => void;
}

function EditMessageModal({ message, onClose, onSave }: EditMessageModalProps) {
  const [name, setName] = useState(message.name);
  const [company, setCompany] = useState(message.company || '');
  const [email, setEmail] = useState(message.email || '');
  const [msg, setMsg] = useState(message.message);
  const [isSecret, setIsSecret] = useState(message.isSecret);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    onSave(message.id, name.trim(), company.trim() || undefined, email.trim() || undefined, msg.trim(), isSecret);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">메시지 수정</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">회사/소속</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="(선택)"
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">이메일 (선택)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>

          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">메시지</label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none text-sm"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[--bg-tertiary]/50 border border-[--border-color]">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <div className="flex items-center gap-2">
              {isSecret ? <EyeOff className="w-4 h-4 text-yellow-400" /> : <Eye className="w-4 h-4 text-[--text-secondary]" />}
              <span className={`text-sm ${isSecret ? 'text-yellow-400' : 'text-[--text-secondary]'}`}>비밀글</span>
            </div>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[--border-color] text-[--text-secondary] hover:bg-[--bg-tertiary]"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
