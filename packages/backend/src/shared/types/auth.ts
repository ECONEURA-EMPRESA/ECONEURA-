export interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  sessionId: string; // Added for dev bypass compatibility
}


