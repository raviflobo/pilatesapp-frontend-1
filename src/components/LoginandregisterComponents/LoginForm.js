import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/authContext";
import { FiPhone, FiLock, FiUser, FiCheckCircle } from "react-icons/fi";
import { useErrorContext } from "../../context/errorContext";
import { sendMemberOtp } from "../../services/authService";
import { toast } from "react-toastify";

const LoginForm = () => {
  const { auth } = useAuthContext();
  const { setError } = useErrorContext();

  // Active Login Mode: "member" (Mobile + OTP) vs "staff_admin" (Credentials)
  const [loginMode, setLoginMode] = useState("member");

  // Member OTP State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Staff / Admin Password State
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loadingCreds, setLoadingCreds] = useState(false);

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (inputPhone) => {
    const targetPhone = inputPhone || phone;
    if (!targetPhone || targetPhone.trim().length < 8) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendMemberOtp(targetPhone.trim());
      setOtpSent(true);
      setCooldown(30); // 30-sec resend cooldown as per spec
      toast.success(res.message || "OTP sent to your mobile number!");
      if (res.demoOtp) {
        setOtp(res.demoOtp);
      }
    } catch (err) {
      setError(err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setVerifyingOtp(true);
    try {
      await auth.loginWithOtp(phone.trim(), otp.trim(), fullName.trim());
      toast.success("Welcome! Logged in successfully.");
    } catch (err) {
      setError(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handlePasswordLogin = async (username, password) => {
    const u = username || formData.username;
    const p = password || formData.password;

    if (!u || !p) {
      toast.error("Please enter both username and password");
      return;
    }

    setLoadingCreds(true);
    try {
      await auth.login(u, p);
      toast.success("Login successful!");
    } catch (err) {
      setError(err);
    } finally {
      setLoadingCreds(false);
    }
  };

  const handleQuickMemberLogin = () => {
    setLoginMode("member");
    setPhone("9876543210");
    setFullName("Emma Watson (Member)");
    setOtpSent(true);
    setOtp("123456");
    handleSendOtp("9876543210");
  };

  return (
    <div style={{ width: "100%", direction: "ltr" }}>
      {/* Mode Switcher Tabs */}
      <div style={styles.tabContainer}>
        <button
          type="button"
          onClick={() => setLoginMode("member")}
          style={{
            ...styles.tabBtn,
            backgroundColor: loginMode === "member" ? "#FFFFFF" : "transparent",
            color: loginMode === "member" ? "#0288D1" : "#64748B",
            boxShadow:
              loginMode === "member" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            fontWeight: loginMode === "member" ? "700" : "600",
          }}
        >
          📱 Member (Mobile + OTP)
        </button>
        <button
          type="button"
          onClick={() => setLoginMode("staff_admin")}
          style={{
            ...styles.tabBtn,
            backgroundColor: loginMode === "staff_admin" ? "#FFFFFF" : "transparent",
            color: loginMode === "staff_admin" ? "#0288D1" : "#64748B",
            boxShadow:
              loginMode === "staff_admin" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            fontWeight: loginMode === "staff_admin" ? "700" : "600",
          }}
        >
          💼 Staff & Admin
        </button>
      </div>

      {/* MEMBER LOGIN (MOBILE + OTP) */}
      {loginMode === "member" ? (
        <div>
          <div style={styles.infoBanner}>
            Members log in securely with their mobile number and SMS OTP code.
          </div>

          {/* Mobile Number Input */}
          <div style={styles.inputWrapper}>
            <FiPhone style={styles.icon} />
            <input
              style={styles.input}
              type="tel"
              placeholder="Mobile Number (e.g. 9876543210)"
              value={phone}
              disabled={otpSent}
              onChange={(e) => setPhone(e.target.value)}
            />
            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                style={styles.changeNumberBtn}
              >
                Change
              </button>
            )}
          </div>

          {!otpSent ? (
            <button
              type="button"
              disabled={sendingOtp || !phone}
              style={{
                ...styles.submitBtn,
                backgroundColor: !phone ? "#94A3B8" : "#0288D1",
                cursor: !phone ? "not-allowed" : "pointer",
              }}
              onClick={() => handleSendOtp()}
            >
              {sendingOtp ? "Sending OTP..." : "Send OTP Verification Code"}
            </button>
          ) : (
            <>
              {/* Optional Name for new member registration */}
              <div style={styles.inputWrapper}>
                <FiUser style={styles.icon} />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Full Name (optional for new members)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* 6-Digit OTP Code Input */}
              <div style={styles.inputWrapper}>
                <FiLock style={styles.icon} />
                <input
                  style={{ ...styles.input, letterSpacing: "4px", fontSize: "1.2rem", fontWeight: "700" }}
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", fontSize: "0.82rem" }}>
                <span style={{ color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiCheckCircle /> Code sent (Demo code: <strong>123456</strong>)
                </span>
                <button
                  type="button"
                  disabled={cooldown > 0 || sendingOtp}
                  onClick={() => handleSendOtp()}
                  style={{
                    background: "none",
                    border: "none",
                    color: cooldown > 0 ? "#94A3B8" : "#0288D1",
                    fontWeight: "700",
                    cursor: cooldown > 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>

              <button
                type="button"
                disabled={verifyingOtp || otp.length !== 6}
                style={{
                  ...styles.submitBtn,
                  backgroundColor: otp.length === 6 ? "#059669" : "#94A3B8",
                  cursor: otp.length === 6 ? "pointer" : "not-allowed",
                }}
                onClick={handleVerifyOtp}
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP & Log In"}
              </button>
            </>
          )}

          {/* Quick Demo Member Trigger */}
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <button
              type="button"
              onClick={handleQuickMemberLogin}
              style={styles.demoLinkBtn}
            >
              ⚡ Quick Fill Demo Member (Emma Watson)
            </button>
          </div>
        </div>
      ) : (
        /* STAFF & SUPER ADMIN LOGIN (CREDENTIALS) */
        <div>
          <div style={styles.infoBanner}>
            Staff & Super Admin portal access with authorized credentials.
          </div>

          <div style={styles.inputWrapper}>
            <FiUser style={styles.icon} />
            <input
              style={styles.input}
              type="text"
              name="username"
              placeholder="Username or Email"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>

          <div style={styles.inputWrapper}>
            <FiLock style={styles.icon} />
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <button
            type="button"
            disabled={loadingCreds}
            style={styles.submitBtn}
            onClick={() => handlePasswordLogin()}
          >
            {loadingCreds ? "Logging in..." : "Staff / Admin Login"}
          </button>

          {/* 1-Click Role Logins */}
          <div style={{ marginTop: "16px" }}>
            <div style={styles.divider}>
              <span style={styles.dividerText}>ONE-CLICK DEMO ACCESS</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => handlePasswordLogin("admin", "Admin123!")}
                style={{
                  ...styles.roleCardBtn,
                  backgroundColor: "#EFF6FF",
                  borderColor: "#BFDBFE",
                  color: "#1D4ED8",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>👑</span>
                <strong>Super Admin</strong>
                <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handlePasswordLogin("staff", "Staff123!")}
                style={{
                  ...styles.roleCardBtn,
                  backgroundColor: "#ECFDF5",
                  borderColor: "#A7F3D0",
                  color: "#047857",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>💼</span>
                <strong>Staff / Trainer</strong>
                <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>Operations Desk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  tabContainer: {
    display: "flex",
    backgroundColor: "#F1F5F9",
    padding: "4px",
    borderRadius: "12px",
    marginBottom: "18px",
    gap: "4px",
  },
  tabBtn: {
    flex: 1,
    padding: "10px 8px",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  infoBanner: {
    padding: "8px 12px",
    backgroundColor: "#F8FAFC",
    borderRadius: "8px",
    fontSize: "0.8rem",
    color: "#475569",
    marginBottom: "14px",
    border: "1px solid #E2E8F0",
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: "10px",
  },
  icon: {
    padding: "12px",
    fontSize: "18px",
    color: "#64748B",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "12px 12px 12px 0",
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    backgroundColor: "transparent",
  },
  changeNumberBtn: {
    background: "none",
    border: "none",
    color: "#0288D1",
    fontSize: "0.78rem",
    fontWeight: "700",
    cursor: "pointer",
    padding: "0 12px",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0288D1",
    color: "white",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    borderBottom: "1px solid #E2E8F0",
    lineHeight: "0.1em",
    margin: "14px 0 10px 0",
  },
  dividerText: {
    background: "#fff",
    padding: "0 10px",
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#94A3B8",
    margin: "0 auto",
  },
  roleCardBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 8px",
    borderRadius: "10px",
    border: "1px solid",
    cursor: "pointer",
    gap: "2px",
  },
  demoLinkBtn: {
    background: "none",
    border: "none",
    color: "#0288D1",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LoginForm;
