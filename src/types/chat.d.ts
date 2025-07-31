export type ChatAuthorRole = 'owner' | 'moderator' | 'member';

export type Author = {
  name: string;
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
};

export type ScrapeResult = {
  offlineDetected: boolean;
  messages: ChatMessage[];
};
