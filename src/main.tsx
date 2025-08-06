import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

/**
 * Main entry point for the StudySync React application
 * 
 * This file bootstraps the entire application by:
 * 1. Setting up React's StrictMode for development checks
 * 2. Configuring Google OAuth authentication provider
 * 3. Rendering the root App component
 * 
 * The application uses context providers for state management:
 * - AuthProvider: User authentication and session management
 * - CalendarProvider: Calendar events and scheduling
 * - GoalsProvider: User goals and progress tracking
 * - NotesProvider: Note-taking functionality
 * - FlashcardsProvider: Flashcard study system
 * - TimerProvider: Study session timing
 */

// Get Google OAuth client ID from environment variables
// Falls back to development client ID if environment variable is not set
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Create and render the React application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* GoogleOAuthProvider enables Google Sign-In functionality throughout the app */}
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Main application component with all routing and context providers */}
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
