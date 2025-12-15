export interface Conversation {
  id: string;
  tenantId?: string | null;
  neuraId: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}


