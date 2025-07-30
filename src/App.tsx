import React, { useEffect } from 'react';
import { LandingPage } from './LandingPage';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import StudyDashboard from './pages/StudyDashboard';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CalendarOnboarding from './pages/CalendarOnboarding';
import CalendarAI from './pages/CalendarAI';
import { AuthProvider, useAuth } from './services/authContext';
import { CalendarProvider } from './services/calendarContext';
import { GoalsProvider } from './services/goalsContext';
import { NotesProvider } from './services/notesContext';
import { FlashcardsProvider } from './services/flashcardsContext';
import { LoadingScreen } from './components/LoadingScreen';
import { TimerProvider } from './services/TimerContext';

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
        path="/calendar-ai"
        element={
          <ProtectedRoute>
            <CalendarAI />
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
      <Route
        path="/study"
        element={
          <ProtectedRoute>
            <StudyDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <CalendarProvider>
            <GoalsProvider>
              <NotesProvider>
                <FlashcardsProvider>
                  <AppRoutes />
                </FlashcardsProvider>
              </NotesProvider>
            </GoalsProvider>
          </CalendarProvider>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
