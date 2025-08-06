import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import { useAuth } from "./services/authContext";
import { useState, useEffect } from "react";
import "./LandingPage.css";

export function LandingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  // State for managing loading spinner during authentication
  const [loading, setLoading] = useState(false);
  // State for displaying error messages to the user
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users to dashboard automatically
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Type definition for Google OAuth credential response
  interface GoogleCredentialResponse {
    credential?: string;
    select_by?: string;
    clientId?: string;
  }

  // Handler for successful Google OAuth authentication
  const handleGoogleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    // Validate that we received a credential token
    if (!credentialResponse.credential) {
      setError('Google login failed. Please try again.');
      return;
    }

    // Show loading state and clear any previous errors
    setLoading(true);
    setError(null);

    try {
      // Send credential to backend authentication service
      const user = await authService.loginWithGoogle(credentialResponse.credential);
      // Update global authentication context with user data
      setUser(user);
      
      // Redirect to main dashboard page
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Display user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      // Always hide loading spinner when done
      setLoading(false);
    }
  };

  // Handler for Google OAuth errors (user cancelled, network issues, etc.)
  const handleGoogleError = () => {
    setError('Google login was cancelled or failed. Please try again.');
  };

  return (
    <div className="landing-bg">
      <div className="landing-card">
        {/* Main heading and welcome message */}
        <h1 className="landing-title">Welcome to StudySync</h1>
        <p className="landing-subtitle">Please log in to continue</p>
        
        {/* Error message display - only shown when error exists */}
        {error && (
          <div style={{
            color: '#ff6b6b',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9em',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {/* Login button container with loading overlay */}
        <div className="landing-login-btn">
          {/* Loading overlay - only shown during authentication */}
          {loading && (
            <div className="landing-loading-overlay">
              <div className="landing-loading-spinner" />
              <span className="landing-loading-text">Signing you in...</span>
            </div>
          )}
          {/* Google OAuth button - dimmed when loading */}
          <div style={{ opacity: loading ? 0.3 : 1 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              auto_select={false}  // Disable automatic account selection
              useOneTap={false}    // Disable one-tap sign-in
            />
          </div>
        </div>
      </div>
    </div>
  );
}