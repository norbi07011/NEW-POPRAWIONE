import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import App from './App.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'

import "./main-simple.css"

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Ładowanie...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
)

// Rejestracja Service Worker dla PWA (offline support + instalacja)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker zarejestrowany:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Błąd rejestracji Service Worker:', error);
      });
  });
}

// Obsługa instalacji PWA (prompt "Dodaj do ekranu głównego")
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💡 PWA może być zainstalowane');
  
  // Opcjonalnie: pokaż własny przycisk instalacji
  // Można dodać UI element do pokazania użytkownikowi
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA zostało zainstalowane');
  deferredPrompt = null;
});

