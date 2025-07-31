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

export type ChatMessage = {
  author: Author;
  message: Message;
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
