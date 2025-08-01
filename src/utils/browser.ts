import type { PuppeteerExtra } from 'puppeteer-extra';
import config from '../config';

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
