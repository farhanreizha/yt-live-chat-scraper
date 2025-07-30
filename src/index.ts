import { filterNewMessages, processAndSaveMessages } from './utils/messageProcessor';
import type { ScrapeResult } from './types/chat';
import type { ChatMessage } from './types/chat';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { initializeBrowserAndPage } from './utils/browser';
import puppeteer from 'puppeteer-extra';
import { scrapeChatMessages } from './lib/chatScraper';

puppeteer.use(StealthPlugin());

(async () => {
  const { browser, page } = await initializeBrowserAndPage(puppeteer);

  const seenMessages = new Set<string>();
  //   const allMessages: ChatMessage[] = [];

  console.log('🔄 Scraping started.');

  while (true) {
    try {
      const result: ScrapeResult = await scrapeChatMessages(page);

      if (result.offlineDetected) {
        console.log('❌ Live chat is offline or ended.');
        break;
      }

      const newMessages = await filterNewMessages(result.messages, seenMessages);

      await processAndSaveMessages(newMessages);

      await new Promise((res) => setTimeout(res, 2000));
    } catch (err) {
      console.error('❌ Error scraping chat:', err);
      break;
    }
  }

  await browser.close();
})();
