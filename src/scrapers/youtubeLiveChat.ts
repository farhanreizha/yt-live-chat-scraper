import type { ChatMessage } from '../types/chat';
import { createBrowserInstance } from '@/utils/browserSetup';
import { setupPageCallbacks } from '@/utils/pageCallback';
import { initializeBrowserAndPage } from '@/utils/browser';
import { injectChatObserver } from '@/utils/chatObserver';

/**
 * Memulai scraping live chat YouTube dengan Puppeteer.
 * Menggunakan MutationObserver untuk mendeteksi pesan baru secara real-time.
 *
 * @param liveId ID dari live video YouTube
 * @param callback Fungsi callback yang menerima pesan baru dan status offline
 */
export async function scrapeLiveChat(
  liveId: string,
  callback: (messages: ChatMessage[], offline: boolean) => void,
): Promise<void> {
  const browser = createBrowserInstance();
  const { page } = await initializeBrowserAndPage(browser, liveId);

  console.log(`[SCRAPER] Started scraping: ${page.url()}`);

  const seenMessages = new Set<string>();

  // // Setup callback functions
  await setupPageCallbacks(page, seenMessages, callback);

  // // Inject mutation observer
  await injectChatObserver(page);
}
