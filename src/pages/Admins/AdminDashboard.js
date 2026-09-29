import React, { useState } from "react";
import useAdminPageLogic from "../../hooks/AdminsHooks/useAdminPageLogic";
import LoadingSpinner from "../../components/Loading/LoadingSpinner.js";
import UsersSection from "../../components/AdminDashboardComponents/UsersSection.js";
import SessionsSection from "../../components/AdminDashboardComponents/SessionsSection.js";

const AdminDashboard = () => {
  const { allSessions, allUsers, loading } = useAdminPageLogic();
  const [visibleTable, setVisibleTable] = useState("sessions");

  const renderTable = () => {
    switch (visibleTable) {
      case "users":
        return <UsersSection users={allUsers} />;
      case "sessions":
      default:
        return <SessionsSection sessions={allSessions} />;
    }
  };

  if (loading) return <LoadingSpinner text="Loading data..." />;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Admin Dashboard</h2>
      <div style={styles.navButtons}>
        <button
          style={{
            ...styles.navButton,
            ...(visibleTable === "sessions" ? styles.activeButton : {}),
          }}
          onClick={() => setVisibleTable("sessions")}
        >
          Manage Sessions
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(visibleTable === "users" ? styles.activeButton : {}),
          }}
          onClick={() => setVisibleTable("users")}
        >
          Manage Users
        </button>
      </div>
      <div style={styles.content}>{renderTable()}</div>
    </div>
  );
};

const styles = {
  wrapper: {
    fontFamily: '"M PLUS Rounded 1c", sans-serif',
    minHeight: "100vh",
    direction: "ltr",
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 700,
    textAlign: "center",
    color: "#1e293b",
    marginBottom: "1rem",
  },
  navButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
  },
  navButton: {
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    backgroundColor: "#e2e8f0",
    border: "none",
    fontWeight: 600,
    fontSize: "1rem",
    color: "#1e293b",
    cursor: "pointer",
    transition: "0.2s ease",
  },
  activeButton: {
    backgroundColor: "#38bdf8",
    color: "#ffffff",
  },
  content: {
    marginTop: "0.5rem",
  },
};

export default AdminDashboard;
