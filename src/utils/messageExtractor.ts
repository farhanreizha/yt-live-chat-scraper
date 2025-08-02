import type { ChatMessage } from '../types/chat';

/**
 * Server-side utility functions for message extraction
 * These functions are used for testing and validation purposes
 * The actual extraction happens in the browser context via chatObserver.ts
 */

/**
 * Validates if a message object conforms to the ChatMessage type structure
 * @param message - The message object to validate
 * @returns A type predicate indicating if the message is a valid ChatMessage
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

/**
 * Sanitizes a chat message by trimming whitespace and normalizing spaces
 * @param message - The chat message to sanitize
 * @returns A new ChatMessage object with sanitized text content
 */
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

/**
 * Filters an array of messages to only include valid ChatMessage objects
 * @param messages - Array of potential chat messages to filter
 * @returns Array of validated and sanitized ChatMessage objects
 */
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
