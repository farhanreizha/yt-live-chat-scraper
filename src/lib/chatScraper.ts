import type { Page } from "puppeteer";

export async function scrapeChatMessages(page: Page) {
  return await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll("yt-live-chat-text-message-renderer"));

    const offlineNotice = document.querySelector("yt-formatted-string.style-scope.yt-live-chat-message-renderer");

    if (offlineNotice && /chat (is disabled|turned off|unavailable|ended)/i.test(offlineNotice.textContent || "")) {
      return { offlineDetected: true, messages: [] };
    }

    const messages = nodes.map((node) => {
      const author = node.querySelector("#author-name")?.textContent?.trim() || "";

      const message = node.querySelector("#message")?.textContent?.trim() || "";

      const emoji = node.querySelector("img.emoji")?.getAttribute("shared-tooltip-text");

      const emojiUrl = node.querySelector("img.emoji")?.getAttribute("src");

      const photoUrl = (node.querySelector("#img") as HTMLImageElement | null)?.src || "";

      const authorType = node.getAttribute("author-type") || "viewer";

      const timestamp = node.querySelector("#timestamp")?.textContent?.trim() || "";

      return {
        author,
        message: {
          text: message,
          emoji,
          emojiUrl,
        },
        photoUrl,
        isOwner: authorType === "owner",
        isModerator: authorType === "moderator",
        isMember: authorType === "member",
        timestamp,
      };
    });

    return { offlineDetected: false, messages };
  });
}
