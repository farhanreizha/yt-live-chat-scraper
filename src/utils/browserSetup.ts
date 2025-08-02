import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export function createBrowserInstance() {
  puppeteer.use(StealthPlugin());
  return puppeteer;
}
