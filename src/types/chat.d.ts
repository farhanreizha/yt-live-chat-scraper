export type ChatAuthorRole = 'owner' | 'moderator' | 'member';
export type BadgeAuthor = 'moderator' | 'member';

export type Author = {
  name: string;
  photo: string;
};

export type Emoji = {
  text: string;
  url: string | null;
};

export type Message = {
  text: string;
  emojis?: Emoji[];
};

export interface Badges {
  type: string;
  text: string;
  url?: string;
}

export interface ChatMessage {
  author: Author;
  message: Message;
  badges?: Badges[];
  isOwner: boolean;
  isModerator: boolean;
  isMember: boolean;
  timestamp: string;
}

export type ScrapeResult = {
  offlineDetected: boolean;
  messages: ChatMessage[];
};
