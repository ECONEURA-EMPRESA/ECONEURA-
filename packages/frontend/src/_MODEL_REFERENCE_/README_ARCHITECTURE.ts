/**
 * MODEL REFERENCE - FRONTEND ARCHITECTURE (Feature-Base / Modular)
 * 
 * Esta carpeta define la estructura estándar para cada FEATURE del frontend.
 * 
 * OBJETIVO:
 * Mantener todo lo relacionado con una funcionalidad (UI, Lógica, Estado, API) en un solo lugar.
 * Evitar "Salto de Carpetas" (Folder Jumping).
 * 
 * ESTRUCTURA:
 * 
 * 1. components/
 *    - Componentes React exclusivos de este feature.
 *    - Si un componente se usa en múltiples features, muévelo a `src/components/shared`.
 * 
 * 2. hooks/
 *    - Custom hooks que manejan lógica de estado o efectos específicos del feature.
 *    - Ejemplo: useCustomerGrid.ts, useLeadFilters.ts
 * 
 * 3. services/
 *    - Llamadas a la API (fetch/axios) y lógica de transformación de datos.
 *    - NUNCA llamar a la API directamente en un componente; usar un servicio.
 * 
 * 4. types/
 *    - Interfaces y tipos TypeScript compartidos dentro del feature.
 * 
 * 5. context/ (Opcional)
 *    - Contextos de React si el feature requiere estado global complejo propio.
 * 
 * 6. index.ts
 *    - PUBLIC API. Exporta solo lo que otros módulos necesitan usar.
 */
