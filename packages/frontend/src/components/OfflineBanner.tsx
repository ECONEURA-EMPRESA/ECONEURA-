import { memo, useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cx } from '../utils/classnames';

/**
 * Banner de estado de conexión
 * Muestra alerta cuando el usuario está offline
 */
export const OfflineBanner = memo(function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      
      // Ocultar banner después de 3 segundos
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={cx(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm flex items-center gap-3 transition-all duration-300',
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-red-500 text-white'
      )}
      style={{
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Conexión restaurada</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">Sin conexión a internet</span>
        </>
      )}
    </div>
  );
});

// Añadir animación al CSS global
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -100%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `;
  document.head.appendChild(style);
}

