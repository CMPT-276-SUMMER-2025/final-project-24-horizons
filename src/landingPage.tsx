import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #2d3e50 60%, #38b2ac 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "rgba(45, 62, 80, 0.97)",
          borderRadius: "18px",
          boxShadow: "0 0 32px 4px #38b2ac55",
          padding: "3rem 2.5rem",
          minWidth: "340px",
          maxWidth: "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "2px solid #38B2AC",
        }}
      >
        <h1
          style={{
            color: "var(--color-primary)",
            fontWeight: 700,
            fontSize: "2.2em",
            marginBottom: "0.5em",
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          Welcome to StudySync
        </h1>
        <p
          style={{
            color: "#e0e0e0",
            fontSize: "1.1em",
            marginBottom: "2em",
            textAlign: "center",
          }}
        >
          Please log in to continue
        </p>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
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