import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export function landingPage() {
  return (
    <div className="landing-page">
      <h1>Welcome to Our Application</h1>
      <p>Please log in to continue</p>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            const user = jwtDecode(credentialResponse.credential);
            console.log("Login Success: currentUser:", user);
          } else {
            console.log("No credential returned from Google login.");
          }
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </div>
  );
}