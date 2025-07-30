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
  const pollInterval = 1500; // in ms

  const poll = async () => {
    try {
      const result: ScrapeResult = await scrapeChatMessages(page);

      if (result.offlineDetected) {
        callback([], true); // Notify offline
        return;
      }

      const newMessages = await filterNewMessages(result.messages, seenMessages);
      if (newMessages.length > 0) {
        callback(newMessages, false);
      }
    } catch (err) {
      console.error('❌ Error scraping chat:', err);
      callback([], true); // treat error as offline for safety
    }

    // Continue polling only if not offline
    setTimeout(poll, pollInterval);
  };

  poll();
}
