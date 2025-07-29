import type { PuppeteerExtra } from "puppeteer-extra";
import config from "./config";

export default async function scraping(puppeteer: PuppeteerExtra) {
    puppeteer
        .launch({
            headless: true,
            args: ["--no-sandbox", "--disable-gpu", "--disable-extensions"],
        })
        .then(async (browser) => {
            const page = await browser.newPage();

            await page.goto(`${config.baseUrl}NBUj23nE65Y`, {
                waitUntil: "domcontentloaded",
            });

            // Take screenshot and save to file
            await page.screenshot({ path: "screenshot.png", fullPage: true });
            await page.waitForSelector("#chat");

            const seenMessages = new Set<string>(); // Hindari duplikasi

            for (let i = 0; i < 30; i++) {
                const messages = await page.evaluate(() => {
                    const nodes = Array.from(
                        document.querySelectorAll(
                            "yt-live-chat-text-message-renderer"
                        )
                    );

                    return nodes.map((node) => {
                        const author =
                            node
                                .querySelector("#author-name")
                                ?.textContent?.trim() || "";

                        const message =
                            node
                                .querySelector("#message")
                                ?.textContent?.trim() || "";

                        const photoUrl =
                            (
                                node.querySelector(
                                    "#img"
                                ) as HTMLImageElement | null
                            )?.src || "";

                        const authorType =
                            node.getAttribute("author-type") || "viewer";

                        const timestamp =
                            node
                                .querySelector("#timestamp")
                                ?.textContent?.trim() || "";

                        return {
                            author,
                            message,
                            photoUrl,
                            authorType,
                            timestamp,
                        };
                    });
                });

                const newOnes = messages.filter((msg) => {
                    const key = `${msg.timestamp}-${msg.author}-${msg.message}`;
                    if (seenMessages.has(key)) return false;
                    seenMessages.add(key);
                    return true;
                });

                if (newOnes.length > 0) {
                    console.log(`--- Update ---`);
                    for (const msg of newOnes) {
                        console.log(
                            `[${msg.timestamp}] (${msg.authorType}) ${msg.author}: ${msg.message}`
                        );
                        console.log(`    Avatar: ${msg.photoUrl}`);
                    }
                }

                await new Promise((res) => setTimeout(res, 2000)); // tiap 2 detik
            }

            await browser.close();
        });
}
