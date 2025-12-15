import type { ConversationStore } from './inMemoryConversationStore';
import { inMemoryConversationStore } from './inMemoryConversationStore';

// Punto único de intercambio de implementación de ConversationStore.
// Hoy usamos el store en memoria; en fases posteriores se podrá sustituir
// por una implementación basada en EventStore/Cosmos sin cambiar los casos de uso.
export const conversationStore: ConversationStore = inMemoryConversationStore;


