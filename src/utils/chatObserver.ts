import type { Author, Badges, ChatMessage, Emoji, Message } from '@/types/chat';

import type { Page } from 'puppeteer';
import { SCRAPER_CONFIG } from '@/constants/scraper';

/**
 * Injects a chat observer into the YouTube live chat page to monitor and extract messages
 * @param page - Puppeteer Page instance
 */
export async function injectChatObserver(page: Page): Promise<void> {
  await page.evaluate((config) => {
    const container = document.querySelector(config.CHAT_SELECTORS.CONTAINER);
    if (!container) {
      console.warn('[Observer] Chat container not found!');
      return;
    }

    const seenIds = new Set<string>();

    // Define all extraction functions within the page context
    /**
     * Extracts emoji text from an image element
     * @param img - Image element containing emoji
     * @returns Emoji text
     */
    function extractEmojiText(img: Element): string {
      const emoji = img.getAttribute('shared-tooltip-text');
      // const emoji = img.getAttribute('data-emoji-id')
      //   ? img.getAttribute('shared-tooltip-text')
      //   : img.getAttribute('alt');

      return emoji || '';
    }

    /**
     * Extracts message text from a message node, including emojis and links
     * @param messageNode - Message container element
     * @returns Formatted message text
     */
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

    /**
     * Extracts emoji information from a message node
     * @param messageNode - Message container element
     * @returns Array of emoji objects
     */
    function extractEmojis(messageNode: Element | null): Emoji[] {
      if (!messageNode) return [];

      const emojiImgs = messageNode.querySelectorAll(config.CHAT_SELECTORS.EMOJI_IMAGES);
      const emojiMap = new Map<string, any>();

      emojiImgs.forEach((img) => {
        // if (!img.getAttribute('data-emoji-id')) return;

        const text = img.getAttribute('shared-tooltip-text');
        const url = img.getAttribute('src');

        if (text && !emojiMap.has(text)) {
          emojiMap.set(text, { text, url });
        }
      });

      return Array.from(emojiMap.values());
    }

    /**
     * Extracts badge information from an author node
     * @param node - Author container element
     * @returns Array of badge objects
     */
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

    /**
     * Extracts membership information from a message node
     * @param node - Message container element
     * @returns Membership information object
     */
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

    /**
     * Extracts metadata from a message node
     * @param node - Message container element
     * @returns Metadata object containing timestamp and leaderboard information
     */
    function extractMetadata(node: Element) {
      const timestamp =
        node.querySelector(config.CHAT_SELECTORS.TIMESTAMP)?.textContent?.trim() || '';
      const leaderboard = node
        .querySelector(config.CHAT_SELECTORS.LEADERBOARD_BUTTON)
        ?.getAttribute('aria-label');

      return { timestamp, leaderboard };
    }

    /**
     * Extracts author information from a message node
     * @param node - Message container element
     * @returns Author object
     */
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

    /**
     * Extracts Super Chat information from a message node
     * @param node - Message container element
     * @returns Super Chat information object
     */
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

    /**
     * Extracts Paid Sticker information from a message node
     * @param node - Message container element
     * @returns Paid Sticker information object
     */
    function extractPaidSticker(node: Element) {
      const isMessagePaidSticker =
        node.tagName.toLowerCase() === 'yt-live-chat-paid-sticker-renderer';

      return {
        isMessagePaidSticker,
        paidStickerAmount: isMessagePaidSticker
          ? node.querySelector(config.CHAT_SELECTORS.PAID_STICKER.AMOUNT)?.textContent || ''
          : undefined,
        paidStickerUrl: isMessagePaidSticker
          ? (node.querySelector(config.CHAT_SELECTORS.PAID_STICKER.URL) as HTMLImageElement | null)
              ?.src || ''
          : undefined,
      };
    }

    /**
     * Extracts Paid Membership information from a message node
     * @param node - Message container element
     * @returns Paid Membership information object
     */
    function extractPaidMembership(node: Element) {
      const isMessagePaidMembership =
        node.tagName.toLowerCase() ===
        'ytd-sponsorships-live-chat-gift-purchase-announcement-renderer';

      return {
        isMessagePaidMembership,
        giftedMemberships: isMessagePaidMembership
          ? node
              .querySelector(config.CHAT_SELECTORS.PAID_MEMBERSHIP.GIFTED_MEMBERSHIPS)
              ?.textContent?.trim() || ''
          : undefined,
      };
    }

    /**
     * Extracts complete message information from a message node
     * @param node - Message container element
     * @returns Message object
     */
    function extractMessage(node: Element): Message {
      const messageNode = node.querySelector(config.CHAT_SELECTORS.MESSAGE);
      const text = extractMessageText(messageNode);
      const emojis = extractEmojis(messageNode);
      const membershipInfo = extractMembershipInfo(node);
      const superchatInfo = extractSuperChat(node);
      const paidStickerInfo = extractPaidSticker(node);
      const paidMembershipInfo = extractPaidMembership(node);

      const baseMessage: Message = {
        text,
        ...membershipInfo,
        ...superchatInfo,
        ...paidStickerInfo,
        ...paidMembershipInfo,
      };

      if (emojis.length > 0) {
        return { ...baseMessage, emojis };
      }

      return baseMessage;
    }

    /**
     * Extracts a complete chat message from a DOM node
     * @param node - Message container element
     * @returns ChatMessage object or null if extraction fails
     */
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

    /**
     * Extracts all new messages from the chat container
     * @param container - Chat container element
     * @param seenIds - Set of already processed message IDs
     * @returns Array of new chat messages
     */
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
