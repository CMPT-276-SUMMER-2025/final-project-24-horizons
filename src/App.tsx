import React from 'react';
import { LandingPage } from './LandingPage';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CalendarOnboarding from './pages/CalendarOnboarding';
import { AuthProvider, useAuth } from './services/authContext';
import { CalendarProvider } from './services/calendarContext';
import { GoalsProvider } from './services/goalsContext';
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
  return (
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <GoalsProvider>
            <AppRoutes />
          </GoalsProvider>
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
