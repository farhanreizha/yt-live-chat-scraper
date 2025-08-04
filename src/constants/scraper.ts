export const SCRAPER_CONFIG = {
  MAX_SEEN_MESSAGES: 10000,
  CHAT_SELECTORS: {
    CONTAINER: '#chat #contents',
    MESSAGE_RENDERERS:
      'yt-live-chat-text-message-renderer, yt-live-chat-membership-item-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-paid-sticker-renderer, ytd-sponsorships-live-chat-gift-purchase-announcement-renderer',
    AUTHOR: {
      NAME: '#author-name',
      PHOTO: '#author-photo img',
      BADGES: 'yt-live-chat-author-chip yt-live-chat-author-badge-renderer',
    },
    MEMBERSHIP: {
      TIER: '#header-subtext',
      STATUS: '#header-primary-text',
    },
    SUPER_CHAT: {
      AMOUNT: '#purchase-amount',
    },
    PAID_STICKER: {
      AMOUNT: '#purchase-amount-chip',
      URL: '#sticker img',
    },
    PAID_MEMBERSHIP: {
      GIFTED_MEMBERSHIPS: '#primary-text',
    },
    MESSAGE: '#message',
    EMOJI_IMAGES: 'img.emoji',
    LEADERBOARD_BUTTON: '#before-content-buttons button',
    TIMESTAMP: '#timestamp',
  },
} as const;
