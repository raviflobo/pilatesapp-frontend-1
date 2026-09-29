import React, { useState, useEffect } from "react";
import { FaTimes, FaCalendarCheck, FaChartLine, FaIdCard, FaTrashAlt } from "react-icons/fa";
import { useAuthContext } from "../../context/authContext";
import { useErrorContext } from "../../context/errorContext";
import { deleteMyAccount } from "../../services/userService";
import { fetchCompletedSessions } from "../../services/sessionService";
import { formatDate } from "../../utils/homeUtils";
import { toast } from "react-toastify";

const MemberProfileModal = ({ isOpen, onClose }) => {
  const { user, auth } = useAuthContext();
  const { setError } = useErrorContext();
  const [activeTab, setActiveTab] = useState("subscription");
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      const loadHistory = async () => {
        setLoadingHistory(true);
        try {
          const data = await fetchCompletedSessions();
          setCompletedSessions(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingHistory(false);
        }
      };
      loadHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen || !user) return null;

  const subscription = user.subscription || {
    planName: "Active Studio Membership",
    startDate: user.createdAt,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  };

  const bodyStats = user.bodyStats || [];
  const latestStats = bodyStats.length > 0 ? bodyStats[bodyStats.length - 1] : null;

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteMyAccount();
      toast.info("Your account has been deleted.");
      auth.logout();
    } catch (err) {
      setError(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        direction: "ltr",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "#0288D1",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "700",
              }}
            >
              {user.fullName ? user.fullName.charAt(0) : "U"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0F172A" }}>
                {user.fullName || user.username}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
                @{user.username} &bull; {user.email}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              color: "#64748B",
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
          }}
        >
          {[
            { id: "subscription", label: "Subscription", icon: <FaIdCard /> },
            { id: "stats", label: "Body Stats", icon: <FaChartLine /> },
            { id: "history", label: "History", icon: <FaCalendarCheck /> },
            { id: "account", label: "Account", icon: <FaTrashAlt /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "12px 6px",
                border: "none",
                background: "none",
                fontSize: "0.85rem",
                fontWeight: activeTab === tab.id ? "700" : "500",
                color: activeTab === tab.id ? "#0288D1" : "#64748B",
                borderBottom:
                  activeTab === tab.id ? "3px solid #0288D1" : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {/* 1. Subscription Tab */}
          {activeTab === "subscription" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0288D1, #00BCD4)",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 20px rgba(2, 136, 209, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
                      Current Plan
                    </span>
                    <h2 style={{ margin: "4px 0 0 0", fontSize: "1.4rem" }}>
                      {subscription.planName || "Monthly Membership"}
                    </h2>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor: subscription.isActive !== false ? "#10B981" : "#EF4444",
                      color: "#FFFFFF",
                    }}
                  >
                    {subscription.isActive !== false ? "ACTIVE" : "EXPIRED"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginTop: "20px",
                    paddingTop: "14px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    <span style={{ opacity: 0.8, fontSize: "0.75rem" }}>Valid From:</span>
                    <div style={{ fontWeight: "600" }}>{formatDate(subscription.startDate)}</div>
                  </div>
                  <div>
                    <span style={{ opacity: 0.8, fontSize: "0.75rem" }}>Valid Until:</span>
                    <div style={{ fontWeight: "600" }}>{formatDate(subscription.endDate)}</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#F1F5F9",
                  borderRadius: "10px",
                  fontSize: "0.82rem",
                  color: "#475569",
                  lineHeight: 1.5,
                }}
              >
                ℹ️ <strong>Offline Management:</strong> Membership plans, renewals, and validity dates are managed directly by studio reception upon payment at the front desk.
              </div>
            </div>
          )}

          {/* 2. Body Stats Tab */}
          {activeTab === "stats" && (
            <div>
              {latestStats ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <span style={{ fontWeight: "700", color: "#0F172A", fontSize: "0.95rem" }}>
                      Latest Evaluation
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
                      Recorded: {formatDate(latestStats.date)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div style={statBoxStyle}>
                      <span style={statLabelStyle}>Weight</span>
                      <strong style={statValueStyle}>{latestStats.weight || "--"} kg</strong>
                    </div>
                    <div style={statBoxStyle}>
                      <span style={statLabelStyle}>Height</span>
                      <strong style={statValueStyle}>{latestStats.height || "--"} cm</strong>
                    </div>
                    <div style={statBoxStyle}>
                      <span style={statLabelStyle}>BMI</span>
                      <strong style={{ ...statValueStyle, color: "#0288D1" }}>
                        {latestStats.bmi || "--"}
                      </strong>
                    </div>
                    <div style={statBoxStyle}>
                      <span style={statLabelStyle}>Body Fat</span>
                      <strong style={statValueStyle}>{latestStats.bodyFat ? `${latestStats.bodyFat}%` : "--"}</strong>
                    </div>
                    <div style={statBoxStyle}>
                      <span style={statLabelStyle}>Waist</span>
                      <strong style={statValueStyle}>{latestStats.waist ? `${latestStats.waist} cm` : "--"}</strong>
                    </div>
                    <div style={statBoxStyle}>
                      <span style={statLabelStyle}>Hips</span>
                      <strong style={statValueStyle}>{latestStats.hips ? `${latestStats.hips} cm` : "--"}</strong>
                    </div>
                  </div>

                  {latestStats.note && (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "10px",
                        borderLeft: "4px solid #0288D1",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569" }}>
                        Trainer Note:
                      </span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#334155" }}>
                        {latestStats.note}
                      </p>
                    </div>
                  )}

                  {bodyStats.length > 1 && (
                    <div style={{ marginTop: "12px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#64748B" }}>
                        Previous Evaluations ({bodyStats.length - 1})
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                        {bodyStats
                          .slice(0, -1)
                          .reverse()
                          .map((entry, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                backgroundColor: "#F1F5F9",
                                fontSize: "0.8rem",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>{formatDate(entry.date)}</span>
                              <span>
                                {entry.weight} kg &bull; BMI: {entry.bmi || "--"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748B" }}>
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#334155" }}>
                    No body evaluations recorded yet
                  </p>
                  <p style={{ fontSize: "0.85rem" }}>
                    Your trainer will assess your physical metrics during your periodic studio check-ins and log them here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. History Tab */}
          {activeTab === "history" && (
            <div>
              {loadingHistory ? (
                <p style={{ color: "#64748B", textAlign: "center" }}>Loading workout history...</p>
              ) : completedSessions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {completedSessions.map((ses) => (
                    <div
                      key={ses._id}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "700", color: "#0F172A", fontSize: "0.95rem" }}>
                          {ses.type}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                          {formatDate(ses.date)} &bull; {ses.time}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          backgroundColor: "#DCFCE7",
                          color: "#15803D",
                        }}
                      >
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748B" }}>
                  <p style={{ fontSize: "1.05rem", fontWeight: "600" }}>No past completed workouts yet</p>
                  <p style={{ fontSize: "0.85rem" }}>
                    As you attend and complete your registered workouts, they will be logged here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Account Tab */}
          {activeTab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  fontSize: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div>
                  <strong>Username:</strong> {user.username}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Phone:</strong> {user.phone || "Not set"}
                </div>
                <div>
                  <strong>Role:</strong> {user.role}
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #FCA5A5",
                  backgroundColor: "#FEF2F2",
                }}
              >
                <h4 style={{ margin: "0 0 6px 0", color: "#991B1B", fontSize: "0.95rem" }}>
                  Danger Zone
                </h4>
                <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "#7F1D1D" }}>
                  Permanently delete your member account, active bookings, and personal records. This action cannot be reversed.
                </p>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {deleting ? "Deleting Account..." : "Delete My Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const statBoxStyle = {
  backgroundColor: "#F8FAFC",
  borderRadius: "10px",
  padding: "10px",
  textAlign: "center",
  border: "1px solid #E2E8F0",
};

const statLabelStyle = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: "600",
  color: "#64748B",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const statValueStyle = {
  fontSize: "1.1rem",
  color: "#0F172A",
};

export default MemberProfileModal;
