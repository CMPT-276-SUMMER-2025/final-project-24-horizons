import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export function LandingPage() {

  const navigate = useNavigate();
  return (
    <div className="landing-page">
      <h1>Welcome to Our Application</h1>
      <p>Please log in to continue</p>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            const user = jwtDecode(credentialResponse.credential);
            console.log("Login Success: currentUser:", user);
            // Navigate to the dashboard or another page after successful login
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
  );
}