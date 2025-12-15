import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Shield, User, Lock, Key } from 'lucide-react';

export type UserRole = 'admin' | 'manager' | 'user' | 'guest';
export type Permission =
  | 'read_chats'
  | 'write_chats'
  | 'delete_chats'
  | 'manage_users'
  | 'view_analytics'
  | 'manage_agents'
  | 'manage_proposals'
  | 'system_settings'
  | 'export_data'
  | 'multi_actor_chats';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  department?: string;
  lastLogin?: Date;
  isActive: boolean;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuración de permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'read_chats', 'write_chats', 'delete_chats', 'manage_users',
    'view_analytics', 'manage_agents', 'manage_proposals',
    'system_settings', 'export_data', 'multi_actor_chats'
  ],
  manager: [
    'read_chats', 'write_chats', 'manage_users', 'view_analytics',
    'manage_agents', 'manage_proposals', 'export_data', 'multi_actor_chats'
  ],
  user: [
    'read_chats', 'write_chats', 'view_analytics', 'multi_actor_chats'
  ],
  guest: [
    'read_chats'
  ]
};

// Demo users eliminados - usar OAuth Microsoft en producción
// Backend con USE_MOCK_DB=true permite login sin DB real
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@econeura.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    department: 'IT',
    isActive: true
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión guardada
    const savedUser = localStorage.getItem('econeura-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch {
        // Error parsing - limpiar datos corruptos
        localStorage.removeItem('econeura-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simular autenticación (en producción sería una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = DEMO_USERS.find(u => u.email === email);

      if (foundUser && password === 'demo123') {
        const userWithLogin = {
          ...foundUser,
          lastLogin: new Date()
        };

        setUser(userWithLogin);
        localStorage.setItem('econeura-user', JSON.stringify(userWithLogin));
        return true;
      }

      return false;
    } catch {
      // Login error manejado en UI
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('econeura-user');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const _updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('econeura-user', JSON.stringify(updatedUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasPermission,
      hasRole,
      updateUser: _updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Componente de protección de rutas
export function ProtectedRoute({
  children,
  permission,
  role,
  fallback
}: {
  children: ReactNode;
  permission?: Permission;
  role?: UserRole;
  fallback?: ReactNode;
}) {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return fallback || <div>Debes iniciar sesión</div>;
  }

  if (permission && !hasPermission(permission)) {
    return fallback || <div>No tienes permisos para acceder a esta sección</div>;
  }

  if (role && !hasRole(role)) {
    return fallback || <div>No tienes el rol necesario para acceder a esta sección</div>;
  }

  return <>{children}</>;
}

// Componente de selector de permisos
export function PermissionSelector({
  user,
  onUpdate
}: {
  user: User;
  onUpdate: (permissions: Permission[]) => void;
}) {
  const allPermissions: { key: Permission; label: string; description: string }[] = [
    { key: 'read_chats', label: 'Leer Chats', description: 'Ver conversaciones existentes' },
    { key: 'write_chats', label: 'Escribir Chats', description: 'Enviar mensajes en chats' },
    { key: 'delete_chats', label: 'Eliminar Chats', description: 'Borrar conversaciones' },
    { key: 'manage_users', label: 'Gestionar Usuarios', description: 'Crear y modificar usuarios' },
    { key: 'view_analytics', label: 'Ver Analytics', description: 'Acceder a métricas y estadísticas' },
    { key: 'manage_agents', label: 'Gestionar Agentes', description: 'Configurar agentes automatizados' },
    { key: 'manage_proposals', label: 'Gestionar Propuestas', description: 'Aprobar y gestionar propuestas' },
    { key: 'system_settings', label: 'Configuración Sistema', description: 'Modificar configuración del sistema' },
    { key: 'export_data', label: 'Exportar Datos', description: 'Descargar datos del sistema' },
    { key: 'multi_actor_chats', label: 'Chats Multi-Actor', description: 'Usar conversaciones colaborativas' }
  ];

  const handlePermissionToggle = (permission: Permission) => {
    const newPermissions = user.permissions.includes(permission)
      ? user.permissions.filter(p => p !== permission)
      : [...user.permissions, permission];

    onUpdate(newPermissions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Permisos de Usuario</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allPermissions.map(permission => (
          <label key={permission.key} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={user.permissions.includes(permission.key)}
              onChange={() => handlePermissionToggle(permission.key)}
              className="mt-1 rounded"
            />
            <div className="flex-1">
              <div className="font-medium">{permission.label}</div>
              <div className="text-sm text-gray-500">{permission.description}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-blue-800 dark:text-blue-200">Rol Actual</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} -
          {ROLE_PERMISSIONS[user.role].length} permisos por defecto
        </p>
      </div>
    </div>
  );
}

// Componente de información de usuario
export function UserProfile() {
  const { user, logout, updateUser } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">{user.department}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Rol</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Estado</span>
          <span className={`px-2 py-1 rounded-full text-sm ${user.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {user.lastLogin && (
          <div className="flex justify-between items-center">
            <span className="font-medium">Último acceso</span>
            <span className="text-sm text-gray-500">
              {new Date(user.lastLogin).toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-medium">Permisos</span>
          <span className="text-sm text-gray-500">{user.permissions.length} permisos</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}