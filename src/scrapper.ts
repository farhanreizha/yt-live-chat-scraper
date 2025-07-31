import { filterNewMessages } from './utils/messageProcessor';
import type { ChatMessage, ScrapeResult } from './types/chat';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { initializeBrowserAndPage } from './utils/browser';
import puppeteer from 'puppeteer-extra';
import { scrapeChatMessages } from './lib/chatScraper';

puppeteer.use(StealthPlugin());

export async function scrapeLiveChat(
  liveId: string,
  callback: (messages: ChatMessage[], offline: boolean) => void,
) {
  const { page } = await initializeBrowserAndPage(puppeteer, liveId);
  const seenMessages = new Set<string>();
  const pollInterval = 500; // Reduced from 1500ms to 500ms for faster updates

  const poll = async () => {
    try {
      const scrapeStartTime = Date.now();
      const result: ScrapeResult = await scrapeChatMessages(page);
      const scrapeEndTime = Date.now();
      
      console.log(`[${new Date().toISOString()}] 📊 Scraped ${result.messages.length} messages in ${scrapeEndTime - scrapeStartTime}ms`);

      if (result.offlineDetected) {
        console.log(`[${new Date().toISOString()}] 🛑 Live chat detected as offline`);
        callback([], true); // Notify offline
        return;
      }

      const newMessages = await filterNewMessages(result.messages, seenMessages);
      if (newMessages.length > 0) {
        console.log(`[${new Date().toISOString()}] 📤 Sending ${newMessages.length} new messages to WebSocket clients`);
        callback(newMessages, false);
      } else {
        console.log(`[${new Date().toISOString()}] ℹ️ No new messages found`);
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error scraping chat:`, err);
      callback([], true); // treat error as offline for safety
    }

    // Continue polling only if not offline
    setTimeout(poll, pollInterval);
  };

  poll();
}
