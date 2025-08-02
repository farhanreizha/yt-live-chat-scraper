import type { Page } from 'puppeteer';
import type { ChatMessage } from '../types/chat';
import { filterNewMessages, trimSeenMessages } from './messageProcessor';
import { SCRAPER_CONFIG } from '@/constants/scraper';
import { filterValidMessages } from './messageExtractor';

export async function setupPageCallbacks(
  page: Page,
  seenMessages: Set<string>,
  callback: (messages: ChatMessage[], offline: boolean) => void,
): Promise<void> {
  await page.exposeFunction('onNewChatMessages', async (rawMessages: ChatMessage[]) => {
    try {
      // Used during message processing from browser context
      // Step 1: Validate and sanitize messages from browser context
      const validMessages = filterValidMessages(rawMessages);

      // Step 2: Filter out already seen messages
      const newMessages = await filterNewMessages(validMessages, seenMessages);

      // Step 3: Cleanup old seen messages to prevent memory issues
      trimSeenMessages(seenMessages, SCRAPER_CONFIG.MAX_SEEN_MESSAGES);

      if (newMessages.length > 0) {
        console.log(
          `[${new Date().toISOString()}] 🧠 [OBSERVED] ${
            newMessages.length
          } new validated messages from MutationObserver`,
        );
        callback(newMessages, false);
      }
    } catch (error) {
      console.error('[CALLBACK_ERROR] Error processing messages:', error);
    }
  });
}
