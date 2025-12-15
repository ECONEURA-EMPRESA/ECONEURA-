import { logger } from '../../shared/logger';
import type { Container, ServiceDescriptor, ServiceToken, Factory } from './types';

export class DIContainer implements Container {
  private readonly parent: Container | undefined;
  private services = new Map<ServiceToken, ServiceDescriptor<unknown>>();
  private singletons = new Map<ServiceToken, unknown>();
  private scopedInstances = new Map<ServiceToken, unknown>();

  constructor(parent?: Container) {
    this.parent = parent;
  }

  /**
   * Registrar un servicio
   */
  register<T>(descriptor: ServiceDescriptor<T>): void {
    if (this.services.has(descriptor.token)) {
      logger.warn('[DIContainer] Servicio ya registrado, sobrescribiendo', {
        token: String(descriptor.token)
      });
    }

    this.services.set(descriptor.token, descriptor);
  }

  /**
   * Registrar un servicio singleton
   */
  registerSingleton<T>(token: ServiceToken<T>, factory: Factory<T>): void {
    this.register({
      token,
      factory,
      scope: 'singleton'
    });
  }

  /**
   * Registrar un servicio transient
   */
  registerTransient<T>(token: ServiceToken<T>, factory: Factory<T>): void {
    this.register({
      token,
      factory,
      scope: 'transient'
    });
  }

  /**
   * Registrar un servicio scoped
   */
  registerScoped<T>(token: ServiceToken<T>, factory: Factory<T>): void {
    this.register({
      token,
      factory,
      scope: 'scoped'
    });
  }

  /**
   * Resolver un servicio
   */
  resolve<T>(token: ServiceToken<T>): T {
    // Verificar si está en el scope actual
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token) as T;
    }

    // Verificar si está registrado
    const descriptor = this.services.get(token);
    if (!descriptor) {
      // Si hay parent, intentar resolver desde ahí
      if (this.parent) {
        return this.parent.resolve(token);
      }

      throw new Error(`Service not registered: ${String(token)}`);
    }

    // Resolver según scope
    switch (descriptor.scope) {
      case 'singleton':
        return this.resolveSingleton<T>(token, descriptor);

      case 'transient':
        return descriptor.factory(this) as T;

      case 'scoped':
        return this.resolveScoped<T>(token, descriptor);

      default:
        throw new Error(`Unknown scope: ${descriptor.scope}`);
    }
  }

  /**
   * Resolver singleton (con caché)
   */
  private resolveSingleton<T>(token: ServiceToken<T>, descriptor: ServiceDescriptor<unknown>): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const instance = descriptor.factory(this) as T;
    this.singletons.set(token, instance);
    return instance;
  }

  /**
   * Resolver scoped (con caché por scope)
   */
  private resolveScoped<T>(token: ServiceToken<T>, descriptor: ServiceDescriptor<unknown>): T {
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token) as T;
    }

    const instance = descriptor.factory(this) as T;
    this.scopedInstances.set(token, instance);
    return instance;
  }

  /**
   * Verificar si un servicio está registrado
   */
  isRegistered(token: ServiceToken): boolean {
    if (this.services.has(token)) {
      return true;
    }

    if (this.parent) {
      return this.parent.isRegistered(token);
    }

    return false;
  }

  /**
   * Crear un scope (para servicios scoped)
   */
  createScope(): Container {
    return new DIContainer(this);
  }

  /**
   * Limpiar instancias (útil para testing)
   */
  clear(): void {
    this.singletons.clear();
    this.scopedInstances.clear();
  }
}

// Container global (singleton)
let globalContainer: Container | null = null;

/**
 * Obtener container global
 */
export function getContainer(): Container {
  if (!globalContainer) {
    globalContainer = new DIContainer();
  }
  return globalContainer;
}

/**
 * Crear un nuevo container (útil para testing)
 */
export function createContainer(): Container {
  return new DIContainer();
}

/**
 * Resetear container global (útil para testing)
 */
export function resetContainer(): void {
  globalContainer = null;
}
