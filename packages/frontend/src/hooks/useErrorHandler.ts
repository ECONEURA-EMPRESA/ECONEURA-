/**
 * Hook personalizado para manejo de errores mejorado
 */
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  hasError: boolean;
  error: string | null;
  retryCount: number;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  });

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : String(error) || 'Error desconocido';
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    // Log error solo en desarrollo (será removido en producción por Vite)
    if (import.meta.env.DEV) {
       
      console.error('[ErrorHandler] Error capturado:', error instanceof Error ? error.message : String(error));
    }
    
    // Límite de reintentos para evitar loops infinitos
    const newRetryCount = errorState.retryCount + 1;
    const MAX_RETRIES = 3;
    
    if (newRetryCount > MAX_RETRIES) {
      // Log warning solo en desarrollo
      if (import.meta.env.DEV) {
         
        console.warn(`[ErrorHandler] Max retries (${MAX_RETRIES}) alcanzado para: ${fullMessage}`);
      }
    }
    
    setErrorState({
      hasError: true,
      error: fullMessage,
      retryCount: newRetryCount
    });

    // Mostrar toast de error
    toast.error('Error', {
      description: fullMessage,
      duration: 5000,
      action: {
        label: 'Reintentar',
        onClick: () => retry()
      }
    });
  }, [errorState.retryCount]);

  const retry = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: errorState.retryCount
    });
  }, [errorState.retryCount]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  }, []);

  return {
    errorState,
    handleError,
    retry,
    clearError
  };
}
