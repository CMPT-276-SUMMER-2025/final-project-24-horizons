import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import { useAuth } from "./services/authContext";
import { useState, useEffect } from "react";
import "./LandingPage.css";

export function LandingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('🔄 User already logged in, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      console.error('❌ No credential returned from Google login');
      setError('Google login failed. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Processing Google login...');
      const user = await authService.loginWithGoogle(credentialResponse.credential);
      console.log('✅ Login successful:', user);
      
      // Update auth context
      setUser(user);
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google OAuth error');
    setError('Google login was cancelled or failed. Please try again.');
  };

  return (
    <div className="landing-bg">
      <div className="landing-card">
        <h1 className="landing-title">Welcome to StudySync</h1>
        <p className="landing-subtitle">Please log in to continue</p>
        
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
        
        <div className="landing-login-btn">
          {loading && (
            <div className="landing-loading-overlay">
              <div className="landing-loading-spinner" />
              <span className="landing-loading-text">Signing you in...</span>
            </div>
          )}
          <div style={{ opacity: loading ? 0.3 : 1 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              auto_select={false}
              useOneTap={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}