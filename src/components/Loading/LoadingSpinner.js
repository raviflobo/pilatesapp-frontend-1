import React from "react";

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div style={styles.container}>
      <div className="spinner"></div>
      <p style={styles.text}>{text}</p>
      <style>{`
        .spinner {
          width: 60px;
          height: 60px;
          border: 8px solid rgb(229, 209, 196);
          border-top: 8px solid #f4b183;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    direction: "ltr",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "white",
    overflow: "hidden",
  },
  text: {
    marginTop: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#555",
    animation: "fadeIn 1s ease forwards",
  },
};

export default LoadingSpinner;
