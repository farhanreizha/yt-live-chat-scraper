import { scrapeLiveChat } from './scrapper';
import type { ChatMessage } from './types/chat';
import { getLiveVideoIdFromUsername } from './utils/resolve';

const clients = new Map<WebSocket, string>();
const activeScrapers = new Map<string, boolean>();

Bun.serve({
  port: 3000,
  fetch(req, server) {
    const { pathname } = new URL(req.url);

    // WebSocket endpoint: /live/:videoId
    if (req.headers.get('upgrade') === 'websocket' && pathname.startsWith('/live/')) {
      return server.upgrade(req, { data: { pathname } })
        ? undefined
        : new Response('Upgrade failed', { status: 400 });
    }

    return new Response('WebSocket server for YouTube Live Chat');
  },
  websocket: {
    async open(ws) {
      const { pathname } = ws.data as { pathname: string };
      const input = pathname.split('/').pop();

      if (!input) {
        ws.send('❌ Invalid input: missing YouTube username or video ID');
        ws.close();
        return;
      }

      // Try to resolve username → videoId, fallback to input directly
      const liveId = (await getLiveVideoIdFromUsername(input)) || input;
      clients.set(ws, liveId);
      console.log(`✅ Client connected for Live ID: ${liveId}`);

      // Start scraper only once per liveId
      if (!activeScrapers.has(liveId)) {
        activeScrapers.set(liveId, true);

        scrapeLiveChat(liveId, (messages: ChatMessage[], offline: boolean) => {
          if (offline) {
            console.log(`🛑 Live chat offline: ${liveId}`);

            // Disconnect all clients for this video
            for (const [client, vId] of clients.entries()) {
              if (vId === liveId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ offlineDetected: true }));
                client.close();
                clients.delete(client);
              }
            }

            activeScrapers.delete(liveId);
            return;
          }

          // Broadcast to clients subscribed to this videoId
          for (const [client, vId] of clients.entries()) {
            if (vId === liveId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(messages));
            }
          }
        });
      }
    },
    close(ws) {
      clients.delete(ws);
      console.log('🔌 Client disconnected');
    },
    message(ws, message) {
      console.log(`📨 Message received: ${message}`);
    },
  },
});
