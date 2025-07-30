import type { PuppeteerExtra } from "puppeteer-extra";
import config from "../config";

export async function initializeBrowserAndPage(puppeteer: PuppeteerExtra) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-extensions"],
  });

  const page = await browser.newPage();

  await page.goto(`${config.baseUrl}?v=aGkCMtyoOsY`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector("#chat");
  await page.screenshot({ path: "screenshot.png", fullPage: true });

  return { browser, page };
}