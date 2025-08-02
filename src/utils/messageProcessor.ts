import type { ChatMessage } from '../types/chat';

export async function filterNewMessages(messages: ChatMessage[], seenMessages: Set<string>) {
  const startTime = Date.now();
  const filtered = messages.filter((msg) => {
    const key = `${msg.timestamp}-${msg.author.name}-${msg.message.text}`;
    if (seenMessages.has(key)) return false;
    seenMessages.add(key);
    return true;
  });
  const endTime = Date.now();

  if (messages.length > 0) {
    console.log(
      `[${new Date().toISOString()}] 🔍 Filtered ${filtered.length}/${
        messages.length
      } new messages in ${endTime - startTime}ms`,
    );
  }

  return filtered;
}

export function trimSeenMessages(set: Set<string>, maxSize = 10000) {
  if (set.size > maxSize) {
    const toDelete = set.size - maxSize;
    const it = set.values();
    for (let i = 0; i < toDelete; i++) {
      const id = it.next().value;
      set.delete(id as string);
    }
  }
}

export function extractMessageId(message: ChatMessage): string {
  // Create a unique ID based on author name, text, and timestamp
  return `${message.author.name}-${message.message.text.slice(0, 50)}-${message.timestamp}`;
}

export function isSystemMessage(message: ChatMessage): boolean {
  return message.message.isMessageMembership || false;
}

export function hasEmojis(message: ChatMessage): boolean {
  return Boolean(message.message.emojis && message.message.emojis.length > 0);
}

export function getMessageStats(messages: ChatMessage[]) {
  return {
    total: messages.length,
    withEmojis: messages.filter(hasEmojis).length,
    systemMessages: messages.filter(isSystemMessage).length,
    regularMessages: messages.filter((msg) => !isSystemMessage(msg)).length,
    uniqueAuthors: new Set(messages.map((msg) => msg.author.name)).size,
  };
}
