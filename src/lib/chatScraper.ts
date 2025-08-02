import type {
  Author,
  BadgeAuthor,
  Badges,
  ChatAuthorRole,
  ChatMessage,
  Emoji,
  Message,
  ScrapeResult,
} from '../types/chat';

import type { Page } from 'puppeteer';

export async function scrapeChatMessages(page: Page): Promise<ScrapeResult> {
  return await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        'yt-live-chat-text-message-renderer, yt-live-chat-membership-item-renderer, yt-live-chat-paid-message-renderer',
      ),
    );

    const offlineNotice = document.querySelector(
      'yt-formatted-string.style-scope.yt-live-chat-message-renderer',
    );

    if (
      offlineNotice &&
      /chat (is disabled|turned off|unavailable|ended)/i.test(offlineNotice.textContent || '')
    ) {
      return { offlineDetected: true, messages: [] };
    }

    const messages = nodes.map((node) => {
      const authorName = node.querySelector('#author-name')?.textContent?.trim();
      const messageNode = node.querySelector('#message');

      const emojiImgs = messageNode?.querySelectorAll('img.emoji') || [];
      const emojiMap = new Map<string, Emoji>();

      const authorBadge = node.querySelectorAll(
        'yt-live-chat-author-chip yt-live-chat-author-badge-renderer',
      );
      const badgeMap = new Map<string, Badges>();

      emojiImgs.forEach((img) => {
        if (!img.getAttribute('data-emoji-id')) return;
        const text = img.getAttribute('shared-tooltip-text');
        const url = img.getAttribute('src');

        if (text && !emojiMap.has(text)) {
          emojiMap.set(text, { text, url });
        }
      });

      authorBadge.forEach((badge) => {
        const type = badge.getAttribute('type') as BadgeAuthor;
        const text = String(badge.getAttribute('shared-tooltip-text'));
        const url = badge.querySelector('img')?.getAttribute('src');

        const badgeTemp: Badges = url ? { type, text, url } : { type, text };
        if (type && text) {
          badgeMap.set(text, badgeTemp);
        }
      });

      const emojis = Array.from(emojiMap.values());
      const badges = Array.from(badgeMap.values());

      const messageText = messageNode
        ? Array.from(messageNode.childNodes)
            .map((child) => {
              if (child.nodeType === Node.TEXT_NODE) {
                return child.textContent?.trim() || '';
              } else if (
                child.nodeType === Node.ELEMENT_NODE &&
                (child as Element).tagName === 'IMG'
              ) {
                const emoji = (child as Element).getAttribute('data-emoji-id')
                  ? (child as Element).getAttribute('shared-tooltip-text')
                  : (child as Element).getAttribute('alt');

                return emoji || '';
              } else if (
                child.nodeType === Node.ELEMENT_NODE &&
                (child as Element).tagName === 'A'
              ) {
                return (child as HTMLAnchorElement).textContent?.trim() || '';
              }
              return '';
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        : '';

      const hasEmoji = emojis.length > 0;
      const photoUrl =
        (node.querySelector('#author-photo img') as HTMLImageElement | null)?.src || '';
      const authorType = (node.getAttribute('author-type') as ChatAuthorRole) || 'viewer';
      const timestamp = node.querySelector('#timestamp')?.textContent?.trim() || '';
      const leaderboard = node
        .querySelector('#before-content-buttons button')
        ?.getAttribute('aria-label');

      const isMessageMembership =
        node.tagName.toLowerCase() === 'yt-live-chat-membership-item-renderer';
      const membershipTier = isMessageMembership
        ? node.querySelector('#header-subtext')?.textContent
        : undefined;
      const membershipStatus = isMessageMembership
        ? node.querySelector('#header-primary-text')?.textContent
        : undefined;

      const isMessageSuperchat =
        node.tagName.toLowerCase() === 'yt-live-chat-paid-message-renderer';
      const amountNode = isMessageSuperchat
        ? node.querySelector('#purchase-amount')?.textContent
        : undefined;
      const style = isMessageSuperchat ? node.getAttribute('style') : undefined;

      const message: Message = hasEmoji
        ? {
            text: messageText,
            emojis,
            isMessageMembership,
            membershipTier,
            membershipStatus,
            isMessageSuperchat,
            superChatAmount: amountNode,
            superChatStyle: style,
          }
        : {
            text: messageText,
            isMessageMembership,
            membershipTier,
            membershipStatus,
            isMessageSuperchat,
            superChatAmount: amountNode,
            superChatStyle: style,
          };

      const author: Author = {
        name: authorName as string,
        photo: photoUrl,
        badges: badges.length > 0 ? badges : undefined,
        isOwner: authorType === 'owner',
        isModerator: authorType === 'moderator',
        isMember: authorType === 'member',
      };

      return {
        author,
        message,
        leaderboard,
        timestamp,
      };
    });

    return { offlineDetected: false, messages: messages as unknown as ChatMessage[] };
  });
}
