import type { Page } from 'puppeteer';
import type { ChatMessage } from '../types/chat';
import { filterNewMessages, trimSeenMessages } from './messageProcessor';
import { SCRAPER_CONFIG } from '@/constants/scraper';
import { filterValidMessages } from './messageExtractor';

/**
 * Sets up callback functions for processing new chat messages from a Puppeteer page
 * @param page - Puppeteer Page instance to set up callbacks on
 * @param seenMessages - Set containing IDs of previously processed messages
 * @param callback - Function to handle new chat messages
 * @param callback.messages - Array of new chat messages to process
 * @param callback.offline - Boolean indicating if chat is offline
 * @returns Promise that resolves when callbacks are set up
 */
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
