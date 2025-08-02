import type { Author, Badges, ChatMessage, Emoji, Message } from '@/types/chat';

import type { Page } from 'puppeteer';
import { SCRAPER_CONFIG } from '@/constants/scraper';

export async function injectChatObserver(page: Page): Promise<void> {
  await page.evaluate((config) => {
    const container = document.querySelector(config.CHAT_SELECTORS.CONTAINER);
    if (!container) {
      console.warn('[Observer] Chat container not found!');
      return;
    }

    const seenIds = new Set<string>();

    // Define all extraction functions within the page context
    function extractEmojiText(img: Element): string {
      const emoji = img.getAttribute('data-emoji-id')
        ? img.getAttribute('shared-tooltip-text')
        : img.getAttribute('alt');

      return emoji || '';
    }

    function extractMessageText(messageNode: Element | null): string {
      if (!messageNode) return '';

      return Array.from(messageNode.childNodes)
        .map((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            return child.textContent?.trim() || '';
          }

          if (child.nodeType === Node.ELEMENT_NODE) {
            const element = child as Element;

            if (element.tagName === 'IMG') {
              return extractEmojiText(element);
            }

            if (element.tagName === 'A') {
              return (element as HTMLAnchorElement).textContent?.trim() || '';
            }
          }

          return '';
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function extractEmojis(messageNode: Element | null): Emoji[] {
      if (!messageNode) return [];

      const emojiImgs = messageNode.querySelectorAll(config.CHAT_SELECTORS.EMOJI_IMAGES);
      const emojiMap = new Map<string, any>();

      emojiImgs.forEach((img) => {
        if (!img.getAttribute('data-emoji-id')) return;

        const text = img.getAttribute('shared-tooltip-text');
        const url = img.getAttribute('src');

        if (text && !emojiMap.has(text)) {
          emojiMap.set(text, { text, url });
        }
      });

      return Array.from(emojiMap.values());
    }

    function extractBadges(node: Element): Badges[] {
      const authorBadges = node.querySelectorAll(config.CHAT_SELECTORS.AUTHOR.BADGES);

      const badgeMap = new Map<string, any>();

      authorBadges.forEach((badge) => {
        const type = badge.getAttribute('type');
        const text = badge.getAttribute('shared-tooltip-text') || '';
        const url = badge.querySelector('img')?.getAttribute('src');

        if (type && text) {
          const badgeObj: any = url ? { type, text, url } : { type, text };
          badgeMap.set(text, badgeObj);
        }
      });

      return Array.from(badgeMap.values());
    }

    function extractMembershipInfo(node: Element) {
      const isMessageMembership =
        node.tagName.toLowerCase() === 'yt-live-chat-membership-item-renderer';

      return {
        isMessageMembership,
        membershipTier: isMessageMembership
          ? node.querySelector(config.CHAT_SELECTORS.MEMBERSHIP.TIER)?.textContent || ''
          : undefined,
        membershipStatus: isMessageMembership
          ? node.querySelector(config.CHAT_SELECTORS.MEMBERSHIP.STATUS)?.textContent || ''
          : undefined,
      };
    }

    function extractMetadata(node: Element) {
      const timestamp =
        node.querySelector(config.CHAT_SELECTORS.TIMESTAMP)?.textContent?.trim() || '';
      const leaderboard = node
        .querySelector(config.CHAT_SELECTORS.LEADERBOARD_BUTTON)
        ?.getAttribute('aria-label');

      return { timestamp, leaderboard };
    }

    function extractAuthor(node: Element): Author {
      const authorName =
        node.querySelector(config.CHAT_SELECTORS.AUTHOR.NAME)?.textContent?.trim() || '';
      const photoUrl =
        (node.querySelector(config.CHAT_SELECTORS.AUTHOR.PHOTO) as HTMLImageElement | null)?.src ||
        '';
      const authorType = node.getAttribute('author-type') || 'viewer';
      const badges = extractBadges(node);

      return {
        name: authorName,
        photo: photoUrl,
        badges: badges.length > 0 ? badges : undefined,
        isOwner: authorType === 'owner',
        isModerator: authorType === 'moderator',
        isMember: authorType === 'member',
      };
    }

    function extractSuperChat(node: Element) {
      const isMessageSuperchat =
        node.tagName.toLowerCase() === 'yt-live-chat-paid-message-renderer';

      return {
        isMessageSuperchat,
        superChatAmount: isMessageSuperchat
          ? node.querySelector(config.CHAT_SELECTORS.SUPER_CHAT.AMOUNT)?.textContent || ''
          : undefined,
        superChatStyle: isMessageSuperchat ? node.getAttribute('style') : undefined,
      };
    }

    function extractMessage(node: Element): Message {
      const messageNode = node.querySelector(config.CHAT_SELECTORS.MESSAGE);
      const text = extractMessageText(messageNode);
      const emojis = extractEmojis(messageNode);
      const membershipInfo = extractMembershipInfo(node);
      const superchatInfo = extractSuperChat(node);

      const baseMessage: Message = {
        text,
        ...membershipInfo,
        ...superchatInfo,
      };

      if (emojis.length > 0) {
        return { ...baseMessage, emojis };
      }

      return baseMessage;
    }

    function extractMessageFromNode(node: Element): ChatMessage | null {
      try {
        const author = extractAuthor(node);
        const message = extractMessage(node);
        const metadata = extractMetadata(node);

        return {
          author,
          message,
          ...metadata,
        };
      } catch (error) {
        console.error('[MESSAGE_EXTRACTOR] Error extracting message:', error);
        return null;
      }
    }

    function extractMessagesFromDOM(container: Element, seenIds: Set<string>): ChatMessage[] {
      const newMessages: ChatMessage[] = [];
      const nodes = container.querySelectorAll(config.CHAT_SELECTORS.MESSAGE_RENDERERS);

      nodes.forEach((node) => {
        const id = node.getAttribute('id');
        if (!id || seenIds.has(id)) return;

        seenIds.add(id);

        const message = extractMessageFromNode(node);
        if (message) {
          newMessages.push(message);
        }
      });

      return newMessages;
    }

    // Set up the mutation observer
    const observer = new MutationObserver(() => {
      const newMessages = extractMessagesFromDOM(container, seenIds);

      if (newMessages.length > 0) {
        // @ts-ignore - This function is exposed from Node.js context
        (window as any).onNewChatMessages(newMessages);
      }
    });

    observer.observe(container, { childList: true, subtree: true });
    console.log('[Observer] MutationObserver attached to chat');
  }, SCRAPER_CONFIG);
}
