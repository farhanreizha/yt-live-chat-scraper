import puppeteer, { PuppeteerExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

/**
 * Creates and configures a Puppeteer browser instance with stealth plugin
 * @returns {PuppeteerExtra} Configured Puppeteer instance with stealth capabilities
 */
export function createBrowserInstance(): PuppeteerExtra {
  puppeteer.use(StealthPlugin());
  return puppeteer;
}
