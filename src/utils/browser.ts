import type { PuppeteerExtra } from 'puppeteer-extra';
import config from '../config';

/**
 * Initializes a browser instance and page for scraping YouTube live chat
 * @param puppeteer - PuppeteerExtra instance for browser automation
 * @param liveId - YouTube live stream ID
 * @returns Object containing browser and page instances
 * @property {Browser} browser - Puppeteer browser instance
 * @property {Page} page - Browser page instance
 */
export async function initializeBrowserAndPage(puppeteer: PuppeteerExtra, liveId: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-extensions'],
  });

  const page = await browser.newPage();

  const url =
    config.env === 'development'
      ? 'http://localhost:5501/live.html'
      : `${config.baseUrl}?v=${liveId}&is_popout=1`;

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  });

  await page.screenshot({ path: 'screenshot.png', fullPage: true });

  return { browser, page };
}
