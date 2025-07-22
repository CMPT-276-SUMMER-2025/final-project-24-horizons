import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import { useState } from "react";
import "./LandingPage.css";

export function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="landing-bg">
      <div className="landing-card">
        <h1 className="landing-title">Welcome to StudySync</h1>
        <p className="landing-subtitle">Please log in to continue</p>
        <div className="landing-login-btn">
          {loading && (
            <div className="landing-loading-overlay">
              <div className="landing-loading-spinner" />
              <span className="landing-loading-text">Signing you in...</span>
            </div>
          )}
          <div style={{ opacity: loading ? 0.3 : 1 }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  if (credentialResponse.credential) {
                    setLoading(true);
                    const user = await authService.loginWithGoogle(credentialResponse.credential);
                    console.log('User logged in:', user);
                    navigate('/dashboard');
                  } else {
                    console.log("No credential returned from Google login.");
                  }
                } catch (error) {
                  console.error('Login failed:', error);
                  alert('Login failed. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                console.log("Login Failed");
              }}
              auto_select={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}