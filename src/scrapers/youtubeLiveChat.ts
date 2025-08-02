import type { ChatMessage } from '../types/chat';
import { createBrowserInstance } from '@/utils/browserSetup';
import { initializeBrowserAndPage } from '@/utils/browser';
import { injectChatObserver } from '@/utils/chatObserver';
import { setupPageCallbacks } from '@/utils/pageCallback';

/**
 * Scrapes live chat messages from a YouTube live stream
 * @param liveId - The YouTube live stream ID to scrape chat messages from
 * @param callback - Callback function that receives an array of chat messages and offline status
 * @returns Promise that resolves when scraping is initialized
 * @throws Error if browser or page initialization fails
 */
export async function scrapeLiveChat(
  liveId: string,
  callback: (messages: ChatMessage[], offline: boolean) => void,
): Promise<void> {
  const browser = createBrowserInstance();
  const { page } = await initializeBrowserAndPage(browser, liveId);

  console.log(`[SCRAPER] Started scraping: ${page.url()}`);

  const seenMessages = new Set<string>();

  // Setup callback functions
  await setupPageCallbacks(page, seenMessages, callback);

  // Inject mutation observer
  await injectChatObserver(page);
}
