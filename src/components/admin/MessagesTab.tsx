'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, MessageSquare, User, Mail, Clock, Check, Send, Trash2, Lock, Unlock, Bell, X, Edit3, Loader2, Building2, EyeOff, Eye, RefreshCw } from 'lucide-react';
import { getMessages, saveMessages, translateText, type GuestMessage, SITE_DATA_UPDATED_EVENT, STORAGE_KEYS } from '@/lib/siteData';
import { sendReplyEmail } from '@/lib/email';
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

export default function MessagesTab() {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [saving, setSaving] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<GuestMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<GuestMessage | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'secret'>('all');
  const [useSupabase, setUseSupabase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드 - 어드민은 Service Role API 사용하여 비밀글 포함 모든 메시지 조회
  const loadMessages = useCallback(async () => {
    console.log('🔄 어드민: loadMessages 시작');
    setIsLoading(true);
    try {
      if (isSupabaseAvailable()) {
        console.log('⚡ Supabase 사용 가능, 어드민 API로 모든 메시지 로드 시도');
        
        // 어드민용 API 사용 (Service Role Key로 비밀글 포함 모든 메시지 조회)
        // 캐시 방지를 위해 timestamp 추가
        const response = await fetch(`/api/guestbook/admin?t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // 캐시 방지
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const dbMessages = result.data as GuestbookDB[];
            console.log('✅ 어드민 API에서 메시지 로드 성공:', {
              total: dbMessages.length,
              secret: dbMessages.filter(m => m.is_secret).length,
              public: dbMessages.filter(m => !m.is_secret).length,
              messages: dbMessages.map(m => ({ id: m.id, name: m.name, is_secret: m.is_secret }))
            });
            setMessages(dbMessages.map(dbToGuestMessage));
            setUseSupabase(true);
            setIsLoading(false);
            return;
          } else {
            console.warn('⚠️ 어드민 API 응답 형식 오류:', result);
          }
        } else {
          console.error('⚠️ 어드민 API 응답 실패:', response.status, response.statusText);
        }
        
        // 어드민 API 실패 시 일반 API로 폴백
        console.warn('⚠️ 어드민 API 실패, 일반 API로 폴백');
        const dbMessages = await api.getGuestbook();
        console.log('✅ 일반 API에서 메시지 로드 성공:', dbMessages.length);
        setMessages(dbMessages.map(dbToGuestMessage));
        setUseSupabase(true);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.warn('⚠️ Supabase 로드 실패, 로컬스토리지 사용:', error);
    }
    // 폴백: 로컬스토리지
    console.log('💾 localStorage에서 메시지 로드 시도');
    const localMessages = getMessages();
    console.log('📂 어드민: 로컬스토리지에서 메시지 로드:', {
      totalMessages: localMessages.length,
      secretCount: localMessages.filter(m => m.isSecret).length,
      messages: localMessages.map(m => ({ id: m.id, name: m.name, isSecret: m.isSecret }))
    });
    setMessages(localMessages);
    setUseSupabase(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
    
    // 같은 탭에서 메시지 업데이트 감지 (CustomEvent) - 프론트에서 질문 추가 시
    const handleDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.MESSAGES) {
        // Supabase에서 최신 데이터 다시 로드
        loadMessages();
      }
    };
    
    // 다른 탭에서 메시지 업데이트 감지 (StorageEvent)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.MESSAGES) {
        loadMessages();
      }
    };
    
    // 페이지 포커스 시 자동 새로고침 (다른 브라우저에서 등록한 데이터 확인)
    const handleFocus = () => {
      console.log('📱 페이지 포커스됨 - 메시지 새로고침');
      loadMessages();
    };
    
    // 주기적 자동 새로고침 (30초마다)
    const autoRefreshInterval = setInterval(() => {
      if (useSupabase || isSupabaseAvailable()) {
        console.log('🔄 자동 새로고침 실행');
        loadMessages();
      }
    }, 30000); // 30초
    
    window.addEventListener(SITE_DATA_UPDATED_EVENT, handleDataUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener(SITE_DATA_UPDATED_EVENT, handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(autoRefreshInterval);
    };
  }, [loadMessages]);

  const handleSave = () => {
    setSaving(true);
    if (!useSupabase) {
      saveMessages(messages);
    }
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

  // 전체 목록 기준 역순 번호 부여 (최신 = 가장 큰 번호)
  const getDisplayNumber = (id: string) => {
    const indexInAll = messages.findIndex(m => m.id === id);
    if (indexInAll === -1) return '-';
    return messages.length - indexInAll;
  };

  // 이벤트 발생 헬퍼 함수
  const dispatchMessagesUpdate = (data: GuestMessage[]) => {
    window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
      detail: { key: STORAGE_KEYS.MESSAGES, data }
    }));
  };

  const handleMarkAsRead = async (id: string) => {
    if (useSupabase) {
      await api.markGuestbookAsRead(id);
      // 최신 데이터 다시 로드
      await loadMessages();
    } else {
      const updated = messages.map(m => m.id === id ? { ...m, isRead: true } : m);
      setMessages(updated);
      saveMessages(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    if (useSupabase) {
      const success = await api.deleteGuestbookMessage(id);
      if (!success) {
        alert('삭제 실패');
        return;
      }
      // Supabase에서 삭제 성공 - 최신 데이터 다시 로드
      await loadMessages();
      // 다른 컴포넌트에 알림
      window.dispatchEvent(new CustomEvent(SITE_DATA_UPDATED_EVENT, {
        detail: { key: STORAGE_KEYS.MESSAGES }
      }));
    } else {
      // 로컬스토리지 모드
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      saveMessages(updated);
    }
  };

  const handleToggleLock = async (id: string) => {
    const target = messages.find(m => m.id === id);
    if (!target) return;
    
    if (useSupabase) {
      await api.updateGuestbookMessage(id, { is_reply_locked: !target.isReplyLocked });
      // 최신 데이터 다시 로드
      await loadMessages();
    } else {
      const updated = messages.map(m => m.id === id ? { ...m, isReplyLocked: !m.isReplyLocked } : m);
      setMessages(updated);
      saveMessages(updated);
    }
  };

  const handleToggleSecret = async (id: string) => {
    const target = messages.find(m => m.id === id);
    if (!target) return;
    
    if (useSupabase) {
      await api.updateGuestbookMessage(id, { is_secret: !target.isSecret });
      // 최신 데이터 다시 로드
      await loadMessages();
    } else {
      const updated = messages.map(m => m.id === id ? { ...m, isSecret: !m.isSecret } : m);
      setMessages(updated);
      saveMessages(updated);
    }
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
    
    // Supabase 사용 시
    if (useSupabase) {
      await api.addReplyToGuestbook(messageId, reply, reply_en, isLocked);
      // 최신 데이터 다시 로드
      await loadMessages();
    } else {
      const updated = messages.map(m =>
        m.id === messageId
          ? { ...m, reply, reply_en, isReplyLocked: isLocked, replyAt: new Date().toISOString(), isRead: true }
          : m
      );
      setMessages(updated);
      saveMessages(updated);
    }
    
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
    
    // Supabase 사용 시
    if (useSupabase) {
      await api.updateGuestbookMessage(messageId, {
        name,
        company,
        email,
        message,
        message_en,
        is_secret: isSecret,
      });
      // 최신 데이터 다시 로드
      await loadMessages();
    } else {
      const updated = messages.map(m =>
        m.id === messageId
          ? { ...m, name, company, email, message, message_en, isSecret }
          : m
      );
      setMessages(updated);
      saveMessages(updated);
    }
    setIsEditModalOpen(false);
    setEditingMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            메시지 관리
            {useSupabase ? (
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-normal">
                Supabase 연동
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 font-normal">
                로컬 스토리지 (다른 브라우저 데이터 미표시)
              </span>
            )}
          </h2>
          <p className="text-sm text-[--text-secondary]">
            총 {messages.length}개 | 읽지 않음 {unreadCount}개 | 비밀글 {secretCount}개
            {!useSupabase && (
              <span className="ml-2 text-yellow-400">⚠️ Supabase 설정 필요</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadMessages}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[--bg-tertiary] text-[--text-secondary] hover:text-white transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
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
          {!useSupabase && (
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
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-[--text-secondary]">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-[--accent-color]" />
            <p>메시지 불러오는 중...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-[--text-secondary]">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>메시지가 없습니다.</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const displayNumber = getDisplayNumber(msg.id);
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card rounded-xl p-4 ${!msg.isRead ? 'border-l-4 border-l-[--accent-color]' : ''} ${msg.isSecret ? 'border border-yellow-500/30 bg-yellow-500/5' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 text-right text-[11px] font-mono font-bold ${
                      !msg.isRead 
                        ? 'text-[--accent-color] bg-[--accent-color]/10 px-2 py-1 rounded' 
                        : 'text-[--text-secondary]'
                    }`}>
                      #{displayNumber}
                      {!msg.isRead && (
                        <span className="ml-1 text-[8px]">●</span>
                      )}
                    </div>
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
            );
          })
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
  
  // 모달 드래그 시 닫힘 방지를 위한 상태
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);

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
      onMouseDown={(e) => setMouseDownTarget(e.target)}
      onClick={(e) => {
        // 드래그 시 모달 닫힘 방지: mousedown과 click이 같은 요소에서 발생했을 때만 닫기
        if (e.target === e.currentTarget && mouseDownTarget === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-card rounded-2xl p-6 select-text"
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
  
  // 모달 드래그 시 닫힘 방지를 위한 상태
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);

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
      onMouseDown={(e) => setMouseDownTarget(e.target)}
      onClick={(e) => {
        // 드래그 시 모달 닫힘 방지: mousedown과 click이 같은 요소에서 발생했을 때만 닫기
        if (e.target === e.currentTarget && mouseDownTarget === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-card rounded-2xl p-6 select-text"
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
