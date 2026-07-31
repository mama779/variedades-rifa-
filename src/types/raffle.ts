export type RequirementType = 
  | 'whatsapp_group'
  | 'follow_facebook'
  | 'follow_instagram'
  | 'follow_tiktok'
  | 'subscribe_youtube'
  | 'like_post'
  | 'share_post'
  | 'comment_tag_friends'
  | 'upload_screenshot'
  | 'custom';

export interface ParticipationRequirement {
  id: string;
  type: RequirementType;
  title: string;
  description: string;
  url: string;
  isMandatory: boolean;
  requiredTagCount?: number; // For comment_tag_friends
  iconName?: string;
}

export interface Ticket {
  number: string; // e.g. "042" or "07"
  status: 'available' | 'pending_verification' | 'assigned';
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  userHandle?: string; // Social username
  userAvatar?: string; // Profile picture / photo
  assignedAt?: string; // ISO string
  verificationDetails?: {
    whatsappJoined?: boolean;
    socialsFollowed?: boolean;
    postLiked?: boolean;
    postShared?: boolean;
    commentUrl?: string;
    taggedFriends?: string[];
    proofScreenshotNote?: string;
    proofScreenshot?: string;
    proofScreenshots?: string[];
  };
}

export type RaffleStatus = 'active' | 'drawing' | 'completed' | 'paused';

export interface Raffle {
  id: string;
  title: string;
  description: string;
  prizeValue: string; // e.g. "$1,200.00 USD"
  prizeImage: string;
  category: 'Perfumes' | 'Ropa' | 'Lencería' | 'Bolsos' | 'Tecnología' | 'Consolas y Gaming' | 'Electrodomésticos' | 'Otros';
  totalNumbers: number; // e.g. 100, 200, 500
  digits: number; // e.g. 2 digits (00-99) or 3 digits (000-999)
  drawDate: string; // ISO datetime
  status: RaffleStatus;
  maxTicketsPerUser: number;
  requirements: ParticipationRequirement[];
  winningNumber?: string;
  winnerInfo?: {
    name: string;
    phone?: string;
    ticketNumber: string;
    drawnAt: string;
    avatarUrl?: string;
    proofLink?: string;
  };
  createdAt: string;
}

export interface SocialLink {
  id: string;
  name: string; // WhatsApp, Facebook, Instagram, TikTok, YouTube, Telegram, etc.
  platform: 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'custom';
  url: string;
  label: string; // e.g. "Comunidad Oficial de WhatsApp Variedades CS"
  isActive: boolean;
}

export interface VerificationRequest {
  id: string;
  raffleId: string;
  raffleTitle: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  userHandle: string;
  requestedTicketNumber?: string; // Optional preferred number
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  requirementsAnswers: {
    whatsappJoined: boolean;
    socialsFollowed: boolean;
    postLiked: boolean;
    postShared: boolean;
    commentUrl?: string;
    taggedFriends: string[];
    proofScreenshot?: string;
    proofScreenshots?: string[];
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'ticket_assigned' | 'winner_announced' | 'draw_reminder' | 'system';
  read: boolean;
  raffleId?: string;
  ticketNumber?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  socialHandle: string;
  email?: string;
}

export interface WinnerHistoryItem {
  id: string;
  raffleTitle: string;
  prizeValue: string;
  prizeImage: string;
  winnerName: string;
  winnerPhoneMasked: string;
  ticketNumber?: string;
  drawDate: string;
  proofUrl?: string;
  proofImage?: string; // Real social comment screenshot
  testimonial?: string;
  userAvatar?: string;
}

export interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  audioUrl?: string;
  synthBpm?: number;
  synthScale?: number[];
  isCustom?: boolean;
}
