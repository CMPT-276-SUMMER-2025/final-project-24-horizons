import React from 'react';
import { LandingPage } from './LandingPage';
import { Dashboard } from './dashboard'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  // Check if user info exists in location.state
  const isAuthenticated = location.state && location.state.user;
  return isAuthenticated ? children : <Navigate to="/" replace />;
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
        </Routes>
    </BrowserRouter>
  )
}

export default App
