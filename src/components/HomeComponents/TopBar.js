import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/authContext";
import { FiSettings, FiLogOut, FiHome, FiBell, FiUser, FiCheck } from "react-icons/fi";
import MemberProfileModal from "./MemberProfileModal";
import { markNotificationAsRead } from "../../services/userService";
import { formatDate } from "../../utils/homeUtils";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, auth } = useAuthContext();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { fullName, notifications = [] } = user || {};
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isStaffOrAdmin = user?.role === "admin" || user?.role === "staff";
  const isCurrentPageAdminPage = location.pathname.includes("/dashboard");

  const onLogout = () => {
    auth.logout();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setUser((prev) => ({
        ...prev,
        notifications: (prev.notifications || []).map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <>
      <div style={styles.container}>
        {/* User Profile Summary */}
        <div
          style={{ ...styles.profile, cursor: "pointer" }}
          onClick={() => setShowProfileModal(true)}
          title="Click to view your profile and subscription"
        >
          <div style={styles.avatar}>
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={styles.text}>
            <div style={styles.greeting}>Welcome,</div>
            <div style={styles.name}>
              {fullName || user?.username}
              <span
                style={{
                  fontSize: "0.72rem",
                  marginLeft: "8px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  backgroundColor:
                    user?.role === "admin"
                      ? "#EFF6FF"
                      : user?.role === "staff"
                      ? "#ECFDF5"
                      : "#F3F4F6",
                  color:
                    user?.role === "admin"
                      ? "#1D4ED8"
                      : user?.role === "staff"
                      ? "#047857"
                      : "#4B5563",
                }}
              >
                {user?.role === "admin" ? "Admin" : user?.role === "staff" ? "Staff" : "Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              style={styles.iconButton}
              onClick={() => setShowNotifications((prev) => !prev)}
              title="Notifications"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span style={styles.badge}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationHeader}>
                  <strong style={{ fontSize: "0.95rem", color: "#0F172A" }}>
                    Notifications
                  </strong>
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                    {unreadCount} unread
                  </span>
                </div>

                <div style={styles.notificationList}>
                  {notifications && notifications.length > 0 ? (
                    notifications
                      .slice()
                      .reverse()
                      .map((item) => (
                        <div
                          key={item._id}
                          style={{
                            ...styles.notificationItem,
                            backgroundColor: item.read ? "#FFFFFF" : "#F0F9FF",
                            borderLeft: item.read
                              ? "3px solid transparent"
                              : "3px solid #0288D1",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: item.read ? "600" : "700",
                                fontSize: "0.85rem",
                                color: "#1E293B",
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "#475569",
                                margin: "2px 0",
                              }}
                            >
                              {item.message}
                            </div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#94A3B8",
                              }}
                            >
                              {formatDate(item.createdAt)}
                            </div>
                          </div>

                          {!item.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(item._id)}
                              title="Mark as read"
                              style={styles.markReadBtn}
                            >
                              <FiCheck size={14} />
                            </button>
                          )}
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Member Profile Button */}
          <button
            style={styles.iconButton}
            onClick={() => setShowProfileModal(true)}
            title="My Profile & Stats"
          >
            <FiUser size={20} />
          </button>

          {/* Admin & Staff Navigation */}
          {isStaffOrAdmin &&
            (isCurrentPageAdminPage ? (
              <button
                style={styles.iconButton}
                onClick={() => navigate("/home")}
                title="Home View"
              >
                <FiHome size={20} />
              </button>
            ) : (
              <button
                style={styles.iconButton}
                onClick={() => navigate("/dashboard")}
                title="Studio Dashboard"
              >
                <FiSettings size={20} />
              </button>
            ))}

          {/* Logout */}
          <button style={styles.iconButton} onClick={onLogout} title="Log Out">
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      {/* Member Profile Modal */}
      <MemberProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "28px",
    direction: "ltr",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    backgroundColor: "#0288D1",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "700",
  },
  text: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  greeting: {
    fontSize: "0.85rem",
    color: "#64748B",
  },
  name: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#0F172A",
    display: "flex",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconButton: {
    position: "relative",
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "50%",
    backgroundColor: "#F1F5F9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    outline: "none",
    color: "#334155",
  },
  badge: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    borderRadius: "999px",
    padding: "2px 6px",
    fontSize: "0.68rem",
    fontWeight: "700",
    border: "2px solid #FFFFFF",
  },
  notificationDropdown: {
    position: "absolute",
    top: "52px",
    right: 0,
    width: "320px",
    backgroundColor: "#FFFFFF",
    borderRadius: "14px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
    border: "1px solid #E2E8F0",
    zIndex: 1050,
    overflow: "hidden",
  },
  notificationHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  notificationList: {
    maxHeight: "340px",
    overflowY: "auto",
  },
  notificationItem: {
    padding: "12px 14px",
    borderBottom: "1px solid #F1F5F9",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  markReadBtn: {
    background: "#E2E8F0",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#334155",
    flexShrink: 0,
  },
};

export default TopBar;
