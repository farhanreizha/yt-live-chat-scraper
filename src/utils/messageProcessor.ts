import type { ChatMessage } from '../types/chat';

export async function filterNewMessages(messages: ChatMessage[], seenMessages: Set<string>) {
  return messages.filter((msg) => {
    const key = `${msg.timestamp}-${msg.author}-${msg.message}`;
    if (seenMessages.has(key)) return false;
    seenMessages.add(key);
    return true;
  });
}
