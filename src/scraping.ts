import type { PuppeteerExtra } from "puppeteer-extra";
import config from "./config";
import fs from "fs";

export default async function scraping(puppeteer: PuppeteerExtra) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-gpu", "--disable-extensions"],
    });

    const page = await browser.newPage();

    await page.goto(`${config.baseUrl}NBUj23nE65Y`, {
        waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("yt-live-chat-app");
    await page.screenshot({ path: "screenshot.png", fullPage: true });

    const seenMessages = new Set<string>();
    const allMessages: any[] = [];

    console.log("🔄 Scraping started. Writing to chat_output.json...");

    while (true) {
        try {
            const result = await page.evaluate(() => {
                const nodes = Array.from(
                    document.querySelectorAll(
                        "yt-live-chat-text-message-renderer"
                    )
                );

                const offlineNotice = document.querySelector(
                    "yt-formatted-string.style-scope.yt-live-chat-message-renderer"
                );

                if (
                    offlineNotice &&
                    /chat (is disabled|turned off|unavailable|ended)/i.test(
                        offlineNotice.textContent || ""
                    )
                ) {
                    return { offlineDetected: true, messages: [] };
                }

                const messages = nodes.map((node) => {
                    const author =
                        node
                            .querySelector("#author-name")
                            ?.textContent?.trim() || "";

                    const message =
                        node.querySelector("#message")?.textContent?.trim() ||
                        "";

                    const photoUrl =
                        (node.querySelector("#img") as HTMLImageElement | null)
                            ?.src || "";

                    const authorType =
                        node.getAttribute("author-type") || "viewer";

                    const timestamp =
                        node.querySelector("#timestamp")?.textContent?.trim() ||
                        "";

                    return {
                        author,
                        message,
                        photoUrl,
                        isOwner: authorType === "owner",
                        isModerator: authorType === "moderator",
                        isMember: authorType === "member",
                        timestamp,
                    };
                });

                return { offlineDetected: false, messages };
            });

            if (result.offlineDetected) {
                console.log("❌ Live chat is offline or ended.");
                break;
            }

            const newMessages = result.messages.filter((msg) => {
                const key = `${msg.timestamp}-${msg.author}-${msg.message}`;
                if (seenMessages.has(key)) return false;
                seenMessages.add(key);
                return true;
            });

            if (newMessages.length > 0) {
                console.log(...newMessages);
                allMessages.push(...newMessages);
                fs.writeFileSync(
                    "chat_output.json",
                    JSON.stringify(allMessages, null, 2),
                    "utf-8"
                );
            }

            await new Promise((res) => setTimeout(res, 2000));
        } catch (err) {
            console.error("❌ Error scraping chat:", err);
            break;
        }
    }

    await browser.close();
}
