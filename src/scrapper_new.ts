import type {
  Author,
  BadgeAuthor,
  Badges,
  ChatAuthorRole,
  ChatMessage,
  Emoji,
  Message,
  ScrapeResult,
} from './types/chat';
import { filterNewMessages, trimSeenMessages } from './utils/messageProcessor';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { initializeBrowserAndPage } from './utils/browser';
import puppeteer from 'puppeteer-extra';
import { scrapeChatMessages } from './lib/chatScraper_new';

puppeteer.use(StealthPlugin());

/**
 * Memulai scraping live chat YouTube dengan Puppeteer.
 * Menggunakan MutationObserver untuk mendeteksi pesan baru secara real-time.
 * Jika offline terdeteksi, akan mengirimkan notifikasi ke callback.
 *
 * @param liveId ID dari live video YouTube
 * @param callback Fungsi callback yang menerima pesan baru dan status offline
 */
export async function scrapeLiveChat(
  liveId: string,
  callback: (messages: ChatMessage[], offline: boolean) => void,
) {
  const { page } = await initializeBrowserAndPage(puppeteer, liveId);
  console.log(page.url());
  const seenMessages = new Set<string>();

  // ✅ Expose callback ke dalam browser context
  await page.exposeFunction('onNewChatMessages', async (rawMessages: ChatMessage[]) => {
    const newMessages = await filterNewMessages(rawMessages, seenMessages);

    // ✅ Trim jika lebih dari 10.000 pesan
    trimSeenMessages(seenMessages, 10000);

    if (newMessages.length > 0) {
      console.log(
        `[${new Date().toISOString()}] 🧠 [OBSERVED] ${
          newMessages.length
        } new messages from MutationObserver`,
      );
      callback(newMessages, false);
    }
  });

  // ✅ Inject MutationObserver
  await page.evaluate(() => {
    const container = document.querySelector('#chat #contents');
    if (!container) {
      console.warn('[Observer] Chat container not found!');
      return;
    }

    const seenIds = new Set();

    const observer = new MutationObserver(() => {
      const newMessages: ChatMessage[] = [];
      const nodes = container.querySelectorAll(
        'yt-live-chat-text-message-renderer, yt-live-chat-membership-item-renderer',
      );

      nodes.forEach(async (node) => {
        const id = node.getAttribute('id');
        if (!id || seenIds.has(id)) return;
        seenIds.add(id);

        const authorName = node.querySelector('#author-name')?.textContent?.trim() || '';
        const messageNode = node.querySelector('#message');
        const text = messageNode
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
                }
                return '';
              })
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim()
          : '';

        const emojiImgs = messageNode?.querySelectorAll('img.emoji') || [];
        const emojiMap = new Map<string, Emoji>();
        emojiImgs.forEach((img) => {
          if (!img.getAttribute('data-emoji-id')) return;
          const text = img.getAttribute('shared-tooltip-text');
          const url = img.getAttribute('src');

          if (text && !emojiMap.has(text)) {
            emojiMap.set(text, { text, url });
          }
        });
        const emojis = Array.from(emojiMap.values());

        const authorBadge = node.querySelectorAll(
          'yt-live-chat-author-chip yt-live-chat-author-badge-renderer',
        );
        const badgeMap = new Map<string, Badges>();
        authorBadge.forEach((badge) => {
          const type = badge.getAttribute('type') as BadgeAuthor;
          const text = String(badge.getAttribute('shared-tooltip-text'));
          const url = badge.querySelector('img')?.getAttribute('src');

          const badgeTemp: Badges = url ? { type, text, url } : { type, text };
          if (type && text) {
            badgeMap.set(text, badgeTemp);
          }
        });
        const badges = Array.from(badgeMap.values());

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

        const message: Message = hasEmoji
          ? {
              text,
              emojis,
              isMessageMembership,
              membershipTier,
              membershipStatus,
            }
          : {
              text,
              isMessageMembership,
              membershipTier,
              membershipStatus,
            };

        const author: Author = {
          name: authorName as string,
          photo: photoUrl,
          badges: badges.length > 0 ? badges : undefined,
          isOwner: authorType === 'owner',
          isModerator: authorType === 'moderator',
          isMember: authorType === 'member',
        };

        newMessages.push({
          author,
          message,
          leaderboard,
          timestamp,
        });
      });

      if (newMessages.length > 0) {
        // @ts-ignore
        window.onNewChatMessages(newMessages);
      }
    });

    observer.observe(container, { childList: true, subtree: true });
    console.log('[Observer] MutationObserver attached to chat');
  });
}
