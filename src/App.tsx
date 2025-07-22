import React from 'react';
import { LandingPage } from './LandingPage';
import Dashboard from './pages/Dashboard'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import CalendarOnboarding from './pages/CalendarOnboarding';

function isAuthenticated() {
  return !!localStorage.getItem('studysync_user');
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
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
        </Routes>
    </BrowserRouter>
  )
}

export default App
