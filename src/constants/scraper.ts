export const SCRAPER_CONFIG = {
  MAX_SEEN_MESSAGES: 10000,
  CHAT_SELECTORS: {
    CONTAINER: '#chat #contents',
    MESSAGE_RENDERERS:
      'yt-live-chat-text-message-renderer, yt-live-chat-membership-item-renderer, yt-live-chat-paid-message-renderer',
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
    MESSAGE: '#message',
    EMOJI_IMAGES: 'img.emoji',
    LEADERBOARD_BUTTON: '#before-content-buttons button',
    TIMESTAMP: '#timestamp',
    // AUTHOR_NAME: '#author-name',
    // AUTHOR_PHOTO: '#author-photo img',
    // AUTHOR_BADGES: 'yt-live-chat-author-chip yt-live-chat-author-badge-renderer',
    // MEMBERSHIP_TIER: '#header-subtext',
    // MEMBERSHIP_STATUS: '#header-primary-text',
  },
} as const;
