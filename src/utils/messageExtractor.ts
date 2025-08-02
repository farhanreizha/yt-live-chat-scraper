import type { ChatMessage } from '../types/chat';

/**
 * Server-side utility functions for message extraction
 * These functions are used for testing and validation purposes
 * The actual extraction happens in the browser context via chatObserver.ts
 */

export function validateMessageStructure(message: any): message is ChatMessage {
  return (
    message &&
    typeof message === 'object' &&
    message.author &&
    message.message &&
    typeof message.author.name === 'string' &&
    typeof message.message.text === 'string'
  );
}

export function sanitizeMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    author: {
      ...message.author,
      name: message.author.name.trim(),
    },
    message: {
      ...message.message,
      text: message.message.text.trim().replace(/\s+/g, ' '),
    },
  };
}

export function filterValidMessages(messages: any[]): ChatMessage[] {
  if (!Array.isArray(messages)) {
    console.warn('[VALIDATION] Received non-array messages:', typeof messages);
    return [];
  }

  const validMessages = messages
    .filter((message, index) => {
      const isValid = validateMessageStructure(message);
      if (!isValid) {
        console.warn(`[VALIDATION] Invalid message at index ${index}:`, message);
      }
      return isValid;
    })
    .map(sanitizeMessage);

  console.log(`[VALIDATION] Filtered ${validMessages.length}/${messages.length} valid messages`);
  return validMessages;
}
