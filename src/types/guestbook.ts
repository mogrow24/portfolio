export interface GuestMessage {
  id: string;
  name: string;
  phone?: string;
  message: string;
  allowNotification: boolean;
  createdAt: string;
  isRead: boolean;
  reply?: string;
  replyAt?: string;
  isReplyLocked: boolean;
}


