export const SCRAPER_CONFIG = {
  MAX_SEEN_MESSAGES: 10000,
  CHAT_SELECTORS: {
    CONTAINER: '#chat #contents',
    MESSAGE_RENDERERS: 'yt-live-chat-text-message-renderer, yt-live-chat-membership-item-renderer',
    AUTHOR_NAME: '#author-name',
    MESSAGE: '#message',
    AUTHOR_PHOTO: '#author-photo img',
    TIMESTAMP: '#timestamp',
    AUTHOR_BADGES: 'yt-live-chat-author-chip yt-live-chat-author-badge-renderer',
    LEADERBOARD_BUTTON: '#before-content-buttons button',
    MEMBERSHIP_TIER: '#header-subtext',
    MEMBERSHIP_STATUS: '#header-primary-text',
    EMOJI_IMAGES: 'img.emoji',
  },
} as const;
