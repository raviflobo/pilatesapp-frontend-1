// EditUserModal.js
import React, { useState, useEffect } from "react";
import Modal from "../SharedComponents/Modal";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";
import { updateUserSubscription } from "../../services/userService";
import { useErrorContext } from "../../context/errorContext";
import { toast } from "react-toastify";

const EditUserModal = ({ user, isOpen, onClose, setUsers }) => {
  const [form, setForm] = useState({});
  const [subscriptionForm, setSubscriptionForm] = useState({
    planName: "Monthly Membership",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const { handleUpdateUserData } = useAdminHandler();
  const { setError } = useErrorContext();

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        fullName: user.fullName || "",
        email: user.email || "",
        birthDate: user.birthDate?.slice(0, 10) || "",
        gender: user.gender || "male",
        role: user.role || "user",
      });

      const sub = user.subscription || {};
      setSubscriptionForm({
        planName: sub.planName || "Monthly Membership",
        startDate: sub.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        endDate:
          sub.endDate?.slice(0, 10) ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        isActive: sub.isActive !== false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubscriptionForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (userId) => {
    try {
      const res = await handleUpdateUserData(userId, form);
      // Also update subscription
      const subRes = await updateUserSubscription(userId, subscriptionForm);
      if (res.success || subRes) {
        toast.success("User and subscription updated successfully!");
        setUsers((prev) =>
          prev.map((u) => {
            if (u._id === userId) {
              return {
                ...(res.response?.user || u),
                subscription: subRes?.subscription || subscriptionForm,
              };
            }
            return u;
          })
        );
        onClose();
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ margin: "0 0 16px 0", color: "#0F172A" }}>Edit Member</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #E2E8F0" }}>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: "none",
            fontWeight: activeTab === "profile" ? "700" : "500",
            color: activeTab === "profile" ? "#2563eb" : "#64748B",
            borderBottom: activeTab === "profile" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: "none",
            fontWeight: activeTab === "subscription" ? "700" : "500",
            color: activeTab === "subscription" ? "#2563eb" : "#64748B",
            borderBottom: activeTab === "subscription" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Manage Subscription
        </button>
      </div>

      {activeTab === "profile" ? (
        <>
          <div style={styles.formGroup}>
            <label>Username:</label>
            <input
              name="username"
              value={form.username || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Full Name:</label>
            <input
              name="fullName"
              value={form.fullName || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Date of Birth:</label>
            <input
              name="birthDate"
              type="date"
              value={form.birthDate || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Gender:</label>
            <select
              name="gender"
              value={form.gender || "male"}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label>Role:</label>
            <select
              name="role"
              value={form.role || "user"}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={styles.formGroup}>
            <label>Plan Name:</label>
            <input
              name="planName"
              placeholder="e.g. Monthly Unlimited, 10-Class Pack"
              value={subscriptionForm.planName}
              onChange={handleSubChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Start Date (Offline Payment):</label>
            <input
              name="startDate"
              type="date"
              value={subscriptionForm.startDate}
              onChange={handleSubChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>End Date (Expiry):</label>
            <input
              name="endDate"
              type="date"
              value={subscriptionForm.endDate}
              onChange={handleSubChange}
              style={styles.input}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <input
              id="isActiveCheck"
              name="isActive"
              type="checkbox"
              checked={subscriptionForm.isActive}
              onChange={handleSubChange}
              style={{ width: "18px", height: "18px" }}
            />
            <label htmlFor="isActiveCheck" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#334155" }}>
              Membership is Active
            </label>
          </div>
        </div>
      )}

      <button style={styles.submitBtn} onClick={() => handleSubmit(user._id)}>
        Save Changes
      </button>
    </Modal>
  );
};

const styles = {
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "0.85rem",
    direction: "ltr",
  },
  input: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "0.95rem",
    direction: "ltr",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "1rem",
    width: "100%",
    transition: "background 0.2s ease",
  },
};

export default EditUserModal;
