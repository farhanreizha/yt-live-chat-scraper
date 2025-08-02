/**
 * Retrieves the live video ID from a YouTube username's live stream page.
 *
 * @param username - The YouTube channel username (without the @ symbol)
 * @returns A Promise that resolves to either:
 *          - The video ID string (11 characters) if a live stream is found
 *          - null if no live stream video ID could be found
 *
 * @example
 * ```typescript
 * const videoId = await getLiveVideoIdFromUsername('YouTubeChannel');
 * if (videoId) {
 *   console.log(`Found live stream: ${videoId}`);
 * }
 * ```
 */
export async function getLiveVideoIdFromUsername(username: string): Promise<string | null> {
  const response = await fetch(`https://www.youtube.com/@${username}/live`);
  const html = await response.text();

  // Direct regex patterns to find video ID
  const patterns = [
    /\"videoId\":\"([a-zA-Z0-9_-]{11})\"/,
    /watch\?v=([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /youtu.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log(`Live Video ID: ${match[1]}`);
      return match[1];
    }
  }

  return null; // Return null if no video ID is found in any case
}
