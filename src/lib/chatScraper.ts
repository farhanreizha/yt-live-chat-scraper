import type { Page } from 'puppeteer';
import type { ChatMessage, ScrapeResult, Emoji, Message, Author } from '../types/chat';

export async function scrapeChatMessages(page: Page): Promise<ScrapeResult> {
  return await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('yt-live-chat-text-message-renderer'));

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
      const author = node.querySelector('#author-name')?.textContent?.trim() || '';

      const messageNode = node.querySelector('#message');
      const emojiImgs = messageNode?.querySelectorAll('img.emoji') || [];
      const emojiMap = new Map<string, { text: string; url: string }>();

      emojiImgs.forEach((img) => {
        if (!img.getAttribute('data-emoji-id')) return;
        const text = img.getAttribute('shared-tooltip-text');
        const url = img.getAttribute('src') || '';

        if (text && !emojiMap.has(text)) {
          emojiMap.set(text, { text, url });
        }
      });

      const emojis = Array.from(emojiMap.values());

      let messageText = '';

      if (messageNode) {
        messageText = Array.from(messageNode.childNodes)
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
            }
            return '';
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const hasEmoji = emojis.length > 0;

      const photoUrl = (node.querySelector('#img') as HTMLImageElement | null)?.src || '';
      const authorType = (node.getAttribute('author-type') as Author) || 'viewer';
      const timestamp = node.querySelector('#timestamp')?.textContent?.trim() || '';

      let message: Message = {
        text: messageText,
      };

      if (hasEmoji) {
        message = {
          text: messageText,
          emojis,
        };
      }

      return {
        author,
        message,
        photoUrl,
        isOwner: authorType === 'owner',
        isModerator: authorType === 'moderator',
        isMember: authorType === 'member',
        timestamp,
      };
    });

    return { offlineDetected: false, messages: messages as ChatMessage[] };
  });
}
