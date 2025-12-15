/**
 * ECONEURA - Dependency Injection
 * Exportaciones del módulo DI
 */
export { getContainer, createContainer, resetContainer } from './container';
export type { Container, ServiceDescriptor, ServiceToken, Factory, ServiceScope } from './types';
export { ServiceTokens, registerServices, initializeServices } from './registrations';

