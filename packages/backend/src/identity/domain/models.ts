export interface Tenant {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  tenantId: string;
  roles: string[];
  isActive: boolean;
}


