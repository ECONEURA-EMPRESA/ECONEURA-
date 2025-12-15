/**
 * ECONEURA - Dependency Injection Types
 * Tipos e interfaces para el contenedor DI
 */

/**
 * Scope de vida de una dependencia
 */
export type ServiceScope = 'singleton' | 'transient' | 'scoped';

/**
 * Factory function para crear una instancia
 */
export type Factory<T> = (container: Container) => T;

/**
 * Token de registro (puede ser string, symbol o clase)
 */
export type ServiceToken<T = unknown> = string | symbol | (new (...args: unknown[]) => T);

/**
 * Descriptor de registro de servicio
 */
export interface ServiceDescriptor<T = unknown> {
  token: ServiceToken<T>;
  factory: Factory<T>;
  scope: ServiceScope;
  dependencies?: ServiceToken[];
}

/**
 * Interfaz del contenedor DI
 */
export interface Container {
  /**
   * Registrar un servicio
   */
  register<T>(descriptor: ServiceDescriptor<T>): void;

  /**
   * Registrar un servicio singleton
   */
  registerSingleton<T>(token: ServiceToken<T>, factory: Factory<T>): void;

  /**
   * Registrar un servicio transient
   */
  registerTransient<T>(token: ServiceToken<T>, factory: Factory<T>): void;

  /**
   * Registrar un servicio scoped
   */
  registerScoped<T>(token: ServiceToken<T>, factory: Factory<T>): void;

  /**
   * Resolver un servicio
   */
  resolve<T>(token: ServiceToken<T>): T;

  /**
   * Verificar si un servicio está registrado
   */
  isRegistered(token: ServiceToken): boolean;

  /**
   * Crear un scope (para servicios scoped)
   */
  createScope(): Container;

  /**
   * Limpiar instancias (útil para testing)
   */
  clear(): void;
}

