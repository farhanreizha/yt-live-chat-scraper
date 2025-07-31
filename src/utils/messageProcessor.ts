import type { ChatMessage } from '../types/chat';

export async function filterNewMessages(messages: ChatMessage[], seenMessages: Set<string>) {
  const startTime = Date.now();
  const filtered = messages.filter((msg) => {
    const key = `${msg.timestamp}-${msg.author}-${JSON.stringify(msg.message)}`;
    if (seenMessages.has(key)) return false;
    seenMessages.add(key);
    return true;
  });
  const endTime = Date.now();
  
  if (messages.length > 0) {
    console.log(`[${new Date().toISOString()}] 🔍 Filtered ${filtered.length}/${messages.length} new messages in ${endTime - startTime}ms`);
  }
  
  return filtered;
}
