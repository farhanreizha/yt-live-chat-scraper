import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import scraping from "./scraping";

puppeteer.use(StealthPlugin());

scraping(puppeteer);
