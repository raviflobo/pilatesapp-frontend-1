import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../context/authContext";
import LoginForm from "../../components/LoginandregisterComponents/LoginForm";
import RegisterForm from "../../components/LoginandregisterComponents/RegisterForm";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";

const LoginAndRegister = () => {
  const { loading } = useAuthContext();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const cardRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current || !contentRef.current) return;

    const card = cardRef.current;
    const content = contentRef.current;

    const currentHeight = card.offsetHeight;
    const newHeight = content.offsetHeight;

    card.style.height = currentHeight + "px";
    void card.offsetHeight;
    card.style.height = newHeight + "px";
  }, [isRegisterMode]);

  if (loading) {
    return <LoadingSpinner text="Connecting to system..." />;
  }

  return (
    <div style={styles.container}>
      <div
        style={{ ...styles.card, transition: "height 0.5s ease" }}
        ref={cardRef}
      >
        <div style={{ width: "90%" }} ref={contentRef}>
          <h1 style={styles.title}>
            {isRegisterMode ? "Welcome!" : "Login"}
          </h1>

          {isRegisterMode ? <RegisterForm /> : <LoginForm />}

          <div style={styles.divider}>or</div>

          <button
            style={{
              ...styles.button,
              backgroundColor: "white",
              border: "2px solid #f4b183",
              color: "#f4b183",
              fontWeight: "bold",
            }}
            onClick={() => setIsRegisterMode((prev) => !prev)}
          >
            {isRegisterMode
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    direction: "ltr",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    margin: "0",
    backgroundColor: "#fff0db",
    overflow: "hidden",
  },
  card: {
    width: "clamp(260px, 70%, 350px)",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2196F3",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  divider: {
    margin: "15px 0",
    fontSize: "16px",
    color: "#888",
  },
};

export default LoginAndRegister;
