import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import config from "./config";
// import scraping from "./scraping";

puppeteer.use(StealthPlugin());

// (async () => await scraping(puppeteer))();

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${config.baseUrl}HePklaEAFUg`, { waitUntil: "networkidle2" });
