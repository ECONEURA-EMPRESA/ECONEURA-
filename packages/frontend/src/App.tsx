import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { LoginView } from './pages/Login/LoginView';
import { CockpitLayout } from './pages/Cockpit/CockpitLayout';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { PricingPage } from './features/billing/PricingPage';


interface User {
  id: string;
  email: string;
  name: string;
  tenantId?: string;
}

function AppContent() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('econeura_token');
    const savedUser = localStorage.getItem('econeura_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setToken(savedToken);
        setUser(parsedUser);
      } catch {
        // Invalid user data, clear storage
        localStorage.removeItem('econeura_token');
        localStorage.removeItem('econeura_user');
      }
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('econeura_token');
    localStorage.removeItem('econeura_user');
    setToken(null);
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* App principal - COCKPIT CON LOGIN INTEGRADO */}
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton />}>
                    <EconeuraCockpitWithLogin
                      token={token}
                      user={user}
                      onLoginSuccess={handleLoginSuccess}
                      onLogout={handleLogout}
                    />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            {/* ✅ SaaS Billing Page */}
            <Route
              path="/pricing"
              element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton />}>
                    <PricingPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            {/* Redirect any unknown route to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Wrapper que muestra Login u Cockpit seg├║n estado de sesi├│n
// Wrapper que muestra Login u Cockpit según estado de sesión


function EconeuraCockpitWithLogin({
  token,
  user,
  onLoginSuccess,
  onLogout
}: {
  token: string | null;
  user: User | null;
  onLoginSuccess: (token: string, user: User) => void;
  onLogout: () => void;
}) {
  // Si NO hay token, mostrar Login
  if (!token) {
    return (
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginView onLoginSuccess={onLoginSuccess} />
      </Suspense>
    );
  }

  // Si hay token, mostrar Cockpit
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CockpitLayout user={user || undefined} onLogout={onLogout} />
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

