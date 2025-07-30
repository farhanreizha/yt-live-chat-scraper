import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { scrapeChatMessages } from "./lib/chatScraper";
import { initializeBrowserAndPage } from "./utils/browser";
import { filterNewMessages, processAndSaveMessages } from "./utils/messageProcessor";

puppeteer.use(StealthPlugin());
(async () => {
  const { browser, page } = await initializeBrowserAndPage(puppeteer);

  const seenMessages = new Set<string>();
  const allMessages: any[] = [];

  console.log("🔄 Scraping started. Writing to chat_output.json...");

  while (true) {
    try {
      const result = await scrapeChatMessages(page);

      if (result.offlineDetected) {
        console.log("❌ Live chat is offline or ended.");
        break;
      }

      const newMessages = await filterNewMessages(result.messages, seenMessages);

      await processAndSaveMessages(newMessages, allMessages);

      await new Promise((res) => setTimeout(res, 2000));
    } catch (err) {
      console.error("❌ Error scraping chat:", err);
      break;
    }
  }

  await browser.close();
})();
