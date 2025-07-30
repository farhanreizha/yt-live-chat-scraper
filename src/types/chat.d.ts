export type Author = 'owner' | 'moderator' | 'member';

export interface Emoji {
  text: string;
  url: string;
}

export interface Message {
  text: string;
  emojis?: Emoji[];
}

export interface ChatMessage {
  author: string;
  message: Message;
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
