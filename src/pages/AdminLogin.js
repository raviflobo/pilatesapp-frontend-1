import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext.js";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.role !== "admin") {
        toast.error("Access denied. Super Admin only.");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🧘</div>
        <h1 className="login-title">Pilates Studio</h1>
        <p className="login-subtitle">Super Admin Panel — Sign in to continue</p>

        <form className="login-form" onSubmit={handleSubmit} id="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email or Username</label>
            <input
              id="admin-email"
              type="text"
              className="form-input"
              placeholder="admin@studio.com or admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="btn btn-primary full-width"
            style={{ marginTop: "0.5rem", padding: "0.75rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Pilates Studio Admin Panel · Restricted Access
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
