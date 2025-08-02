export type ChatAuthorRole = 'owner' | 'moderator' | 'member';
export type BadgeAuthor = 'moderator' | 'verified' | 'member';

export type Author = {
  name: string;
  photo: string;
  badges?: Badges[];
  isOwner: boolean;
  isModerator: boolean;
  isMember: boolean;
};

export type Emoji = {
  text: string;
  url: string | null;
};

export type Message = {
  text: string;
  emojis?: Emoji[];
  isMessageMembership: boolean;
  membershipTier: string | undefined | null;
  membershipStatus: string | undefined | null;
  isMessageSuperchat: boolean;
  superChatAmount: string | undefined | null;
  superChatStyle: string | undefined | null;
};

export interface Badges {
  type: string;
  text: string;
  url?: string;
}

export interface ChatMessage {
  author: Author;
  message: Message;
  leaderboard?: string | null;
  timestamp: string;
}

export type ScrapeResult = {
  offlineDetected: boolean;
  messages: ChatMessage[];
};
