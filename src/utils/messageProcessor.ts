import fs from 'fs';
import type { ChatMessage } from '../types/chat';

export async function filterNewMessages(messages: ChatMessage[], seenMessages: Set<string>) {
  return messages.filter((msg) => {
    const key = `${msg.timestamp}-${msg.author}-${msg.message}`;
    if (seenMessages.has(key)) return false;
    seenMessages.add(key);
    return true;
  });
}

export async function processAndSaveMessages(newMessages: ChatMessage[]) {
  if (newMessages.length > 0) {
    console.log(...newMessages);
    // allMessages.push(...newMessages);
    // fs.writeFileSync("chat_output.json", JSON.stringify(allMessages, null, 2), "utf-8");
  }
}
