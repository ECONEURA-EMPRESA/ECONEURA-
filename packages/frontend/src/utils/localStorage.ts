/**
 * Local Storage utilities para persistencia de chat sin database
 */

export interface LocalChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  neuraId: number;
  department: string;
}

export interface LocalChat {
  id: string;
  title: string;
  messages: LocalChatMessage[];
  createdAt: string;
  updatedAt: string;
  neuraId: number;
  department: string;
}

const CHAT_STORAGE_KEY = 'econeura_chats';
const MESSAGE_STORAGE_KEY = 'econeura_messages';

export function saveChatToLocal(chat: LocalChat): void {
  try {
    const existingChats = getChatsFromLocal();
    const updatedChats = existingChats.filter(c => c.id !== chat.id);
    updatedChats.push(chat);

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedChats));
  } catch {
    // Error silencioso - localStorage puede estar lleno
  }
}

export function getChatsFromLocal(): LocalChat[] {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    // Error loading - retornar vacío
    return [];
  }
}

export function deleteChatFromLocal(chatId: string): void {
  try {
    const existingChats = getChatsFromLocal();
    const updatedChats = existingChats.filter(c => c.id !== chatId);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedChats));
  } catch {
    // Error silencioso
  }
}

export function saveMessageToLocal(message: LocalChatMessage): void {
  try {
    const existingMessages = getMessagesFromLocal();
    const updatedMessages = existingMessages.filter(m => m.id !== message.id);
    updatedMessages.push(message);

    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(updatedMessages));
  } catch {
    // Error silencioso
  }
}

export function getMessagesFromLocal(): LocalChatMessage[] {
  try {
    const stored = localStorage.getItem(MESSAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    // Error loading - retornar vacío
    return [];
  }
}

export function getMessagesByChatId(chatId: string): LocalChatMessage[] {
  try {
    const messages = getMessagesFromLocal();
    return messages.filter(m => m.id.startsWith(chatId));
  } catch {
    // Error loading - retornar vacío
    return [];
  }
}

export function createNewChat(neuraId: number, department: string, firstMessage?: string): LocalChat {
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const chat: LocalChat = {
    id: chatId,
    title: firstMessage ? firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '') : `Chat con ${department}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
    neuraId,
    department
  };

  if (firstMessage) {
    const message: LocalChatMessage = {
      id: `${chatId}_msg_${Date.now()}`,
      role: 'user',
      content: firstMessage,
      timestamp: now,
      neuraId,
      department
    };
    chat.messages.push(message);
    saveMessageToLocal(message);
  }

  saveChatToLocal(chat);
  return chat;
}

export function addMessageToChat(chatId: string, message: Omit<LocalChatMessage, 'id'>): LocalChatMessage {
  const messageId = `${chatId}_msg_${Date.now()}`;
  const fullMessage: LocalChatMessage = {
    ...message,
    id: messageId
  };

  // Guardar mensaje
  saveMessageToLocal(fullMessage);

  // Actualizar chat
  const chats = getChatsFromLocal();
  const chat = chats.find(c => c.id === chatId);
  if (chat) {
    chat.messages.push(fullMessage);
    chat.updatedAt = new Date().toISOString();
    saveChatToLocal(chat);
  }

  return fullMessage;
}
