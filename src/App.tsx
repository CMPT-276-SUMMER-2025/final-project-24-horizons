import React, { useEffect } from 'react';
import { LandingPage } from './LandingPage';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CalendarOnboarding from './pages/CalendarOnboarding';
import { AuthProvider, useAuth } from './services/authContext';
import { LoadingScreen } from './components/LoadingScreen';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}


function App() {
  // Apply saved theme when the app loads
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
