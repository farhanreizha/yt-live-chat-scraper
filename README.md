# yt-live-chat-scraper

## Documentation

## This project provides a YouTube Live Chat Scraper with a WebSocket server for real-time chat message delivery. Below are instructions on how to set up and use the scraper.

### 1. Running the Backend Scraper

To start the live chat scraping server, navigate to the project root and run:

```bash
bun run dev
```

This will start a WebSocket server, typically on `ws://localhost:3000`, which will scrape live chat data for the configured `videoId`.

### 2. Integrating with the Frontend (e.g., `example/index.html`)

The `example/index.html` file demonstrates how to connect to the WebSocket server and display live chat messages. You can adapt this example for your own frontend application.

**Key Configuration in `example/index.html`:**

Locate the `CONFIG` object within the `<script>` tags:

```javascript
const CONFIG = {
  videoId: 'example', // Replace with the YouTube video ID or channel username
  maxMessages: 50,
  serverUrl: 'ws://localhost:3000',
};
```

- **`videoId`**: This is the crucial parameter. You can set it to:
  - A YouTube live stream's video ID (e.g., `dQw4w9WgXcQ`).
  - A YouTube channel's username (e.g., `example`). The scraper will attempt to resolve the live video ID from the username if a live stream is active.
- **`maxMessages`**: Defines the maximum number of messages to display in the chat container.
- **`serverUrl`**: The URL of the WebSocket server. Ensure this matches the address where your backend scraper is running.

**How it Works:**

1.  The frontend establishes a WebSocket connection to the `serverUrl` with the specified `videoId`.
2.  The backend scraper continuously fetches live chat messages from YouTube.
3.  New messages are sent from the backend to the frontend via the WebSocket connection.
4.  The `ChatManager.addMessages` function in `index.html` receives these messages and dynamically adds them to the display.

### 3. Customizing Display and Styling

The `example/index.html` uses Tailwind CSS for styling or plain CSS and includes utility functions for sanitizing text, replacing emojis, and rendering different message components (author, badges, membership info, Super Chat).

- **Styling**: Modify the `<style>` block or the Tailwind CSS classes directly in the HTML to change the appearance of chat messages.
- **Message Rendering Logic**: The `MessageRenderer` object contains methods like `renderMessage`, `renderAuthor`, `renderMembershipBadges`, etc., which you can customize to alter how chat messages are presented.

## By following these steps, you can effectively use the YouTube Live Chat Scraper to integrate real-time chat into your applications.

## Features

- [x] **Real-time YouTube Live Chat Monitoring** - Scrapes live chat messages in real-time using WebSocket streaming
- [x] **MutationObserver Integration** - Efficiently detects new messages without polling
- [x] **Username Resolution** - Automatically resolves live video IDs from YouTube usernames
- [x] **Comprehensive Message Data Extraction**
  - [x] Author information (name, photo, badges, roles)
  - [x] Message content with emoji support
  - [x] Timestamps for all messages
  - [x] Author badges and roles
- [x] **Membership Features**
  - [x] Membership status detection
  - [x] Membership tier identification
  - [x] Member-only chat filtering
- [x] **Advanced Scraping Technology**
  - [x] Puppeteer with StealthPlugin for undetected scraping
  - [x] Message deduplication
  - [x] Memory-efficient processing
  <!-- - [x] Error handling and recovery -->
- [x] **Output Formats** - Real-time WebSocket streaming
- [x] **WebSocket Server**
  - [x] Real-time data streaming to connected clients
  - [ ] Offline status notifications
  - [ ] Automatic reconnection handling
- [ ] **Super Chat & Super Sticker Integration**
  - [ ] Donation amount tracking
  - [ ] Leaderboard integration
  - [ ] Priority message highlighting
