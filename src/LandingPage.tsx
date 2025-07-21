import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // Import the CSS file

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-bg">
      <div className="landing-card">
        <h1 className="landing-title">Welcome to StudySync</h1>
        <p className="landing-subtitle">Please log in to continue</p>
        <div className="landing-login-btn">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                const user = jwtDecode(credentialResponse.credential);
                console.log("Login Success: currentUser:", user);
                navigate('/dashboard', { state: { user } });
              } else {
                console.log("No credential returned from Google login.");
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
  );
}