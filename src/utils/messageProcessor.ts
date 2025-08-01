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
        set.delete(id);
      }
    }
  }
