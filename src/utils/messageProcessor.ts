import type { ChatMessage } from '../types/chat';

/**
 * Filters out previously seen messages from an array of chat messages
 * @param messages Array of chat messages to filter
 * @param seenMessages Set containing previously seen message keys
 * @returns Array of new messages that haven't been seen before
 */
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

/**
 * Trims the seen messages set to maintain a maximum size
 * @param set Set of seen message keys to trim
 * @param maxSize Maximum number of entries to keep in the set (default: 10000)
 */
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

/**
 * Generates a unique identifier for a chat message
 * @param message Chat message to generate ID for
 * @returns Unique string identifier combining author name, message text, and timestamp
 */
export function extractMessageId(message: ChatMessage): string {
  // Create a unique ID based on author name, text, and timestamp
  return `${message.author.name}-${message.message.text.slice(0, 50)}-${message.timestamp}`;
}

/**
 * Checks if a message is a system message (e.g., membership notification)
 * @param message Chat message to check
 * @returns Boolean indicating if the message is a system message
 */
export function isSystemMessage(message: ChatMessage): boolean {
  return message.message.isMessageMembership || false;
}

/**
 * Checks if a message contains emojis
 * @param message Chat message to check
 * @returns Boolean indicating if the message contains emojis
 */
export function hasEmojis(message: ChatMessage): boolean {
  return Boolean(message.message.emojis && message.message.emojis.length > 0);
}

/**
 * Calculates various statistics for an array of chat messages
 * @param messages Array of chat messages to analyze
 * @returns Object containing message statistics (total, emoji count, system messages, etc.)
 */
export function getMessageStats(messages: ChatMessage[]) {
  return {
    total: messages.length,
    withEmojis: messages.filter(hasEmojis).length,
    systemMessages: messages.filter(isSystemMessage).length,
    regularMessages: messages.filter((msg) => !isSystemMessage(msg)).length,
    uniqueAuthors: new Set(messages.map((msg) => msg.author.name)).size,
  };
}
