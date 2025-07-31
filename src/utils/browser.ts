import type { PuppeteerExtra } from 'puppeteer-extra';
import config from '../config';

export async function initializeBrowserAndPage(puppeteer: PuppeteerExtra, liveId: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-extensions'],
  });

  const page = await browser.newPage();

  await page.goto(`${config.baseUrl}?v=${liveId}&is_popout=1`, {
    waitUntil: 'domcontentloaded',
  });

  await page.screenshot({ path: 'screenshot.png', fullPage: true });

  return { browser, page };
}
