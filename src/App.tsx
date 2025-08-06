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

/**
 * ProtectedRoute component that wraps routes requiring authentication
 * Redirects unauthenticated users to the landing page
 * Shows loading screen while authentication status is being determined
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  // Show loading screen while authentication status is being checked
  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, render the protected component
  // Otherwise, redirect to landing page
  return user ? children : <Navigate to="/" replace />;
}

/**
 * AppRoutes component that defines all application routes
 * Handles both public (landing page) and protected routes
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public route - Landing page accessible without authentication */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Protected route - Main dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected route - Calendar onboarding/setup */}
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarOnboarding />
          </ProtectedRoute>
        }
      />
      
      {/* Protected route - AI-powered calendar features */}
      <Route
        path="/calendar-ai"
        element={
          <ProtectedRoute>
            <CalendarAI />
          </ProtectedRoute>
        }
      />
      
      {/* Protected route - User settings and preferences */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      
      {/* Protected route - Study dashboard with study tools */}
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

/**
 * Main App component that sets up the application structure
 * Provides context providers and routing configuration
 */
function App() {
  // Effect to apply saved theme on app initialization
  useEffect(() => {
    // Retrieve saved theme from localStorage, default to 'dark' if none exists
    const savedTheme = localStorage.getItem('theme') || 'dark';
    // Apply theme to the document root element
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    // BrowserRouter enables client-side routing
    <BrowserRouter>
      {/* Context providers hierarchy - order matters for dependencies */}
      
      {/* AuthProvider - Manages user authentication state */}
      <AuthProvider>
        {/* TimerProvider - Manages study timer functionality */}
        <TimerProvider>
          {/* CalendarProvider - Manages calendar data and events */}
          <CalendarProvider>
            {/* GoalsProvider - Manages user goals and progress tracking */}
            <GoalsProvider>
              {/* NotesProvider - Manages note-taking functionality */}
              <NotesProvider>
                {/* FlashcardsProvider - Manages flashcard study system */}
                <FlashcardsProvider>
                  {/* Render all application routes */}
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
