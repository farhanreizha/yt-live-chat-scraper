export type Author = 'owner' | 'moderator' | 'member';

export interface Emoji {
  text: string;
  url: string;
}

export interface Message {
  text: string;
  emojis?: Emoji[];
}

export interface Badges {
  type: 'moderator' | 'member';
  text: string;
  url?: string;
}

export interface ChatMessage {
  author: string;
  message: Message;
  badges?: Badges[];
  photoUrl: string;
  isOwner: boolean;
  isModerator: boolean;
  isMember: boolean;
  timestamp: string;
}

export interface ScrapeResult {
  offlineDetected: boolean;
  messages: ChatMessage[];
}
