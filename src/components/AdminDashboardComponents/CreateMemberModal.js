// CreateMemberModal.js
import React, { useState } from "react";
import Modal from "../SharedComponents/Modal";
import api from "../../api/api";
import { toast } from "react-toastify";

const CreateMemberModal = ({ isOpen, onClose, onMemberCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    username: "",
    password: "Member123!",
    gender: "female",
    birthDate: "1995-01-01",
    planName: "Active Membership",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.phone.trim() && !formData.email.trim()) {
      toast.error("Phone number or email is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        username: formData.username.trim() || undefined,
        password: formData.password || "Member123!",
        gender: formData.gender,
        birthDate: formData.birthDate,
        role: "user",
        subscription: {
          planName: formData.planName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        },
      };

      const res = await api.post("/api/users/create", payload);
      const createdUser = res.data?.user || res.data;
      toast.success(res.data?.message || "Member created successfully!");
      if (onMemberCreated) onMemberCreated(createdUser);
      onClose();

      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        username: "",
        password: "Member123!",
        gender: "female",
        birthDate: "1995-01-01",
        planName: "Active Membership",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        isActive: true,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: "0 0.5rem" }}>
        <div style={{ marginBottom: "1.25rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
            + Create New Member
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
            Add a new member profile and assign their initial membership plan
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Details */}
          <div style={styles.sectionTitle}>Personal Details</div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Full Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="new-member-fullname"
              name="fullName"
              type="text"
              placeholder="e.g. Jane Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Phone Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="new-member-phone"
                name="phone"
                type="tel"
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                id="new-member-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username (Optional)</label>
              <input
                id="new-member-username"
                name="username"
                type="text"
                placeholder="Auto-generated if empty"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Gender</label>
              <select
                id="new-member-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Birth Date</label>
              <input
                id="new-member-birthdate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Initial Password</label>
              <input
                id="new-member-password"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Membership Details */}
          <div style={{ ...styles.sectionTitle, marginTop: "1rem" }}>Membership Plan</div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Plan Name</label>
            <select
              id="new-member-plan"
              name="planName"
              value={formData.planName}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Active Membership">Active Membership</option>
              <option value="Monthly Unlimited">Monthly Unlimited</option>
              <option value="10-Class Pack">10-Class Pack</option>
              <option value="Annual VIP">Annual VIP</option>
              <option value="Free Trial">Free Trial</option>
            </select>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date</label>
              <input
                id="new-member-startdate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>End Date</label>
              <input
                id="new-member-enddate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.checkboxRow}>
            <input
              id="new-member-isactive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0284c7" }}
            />
            <label htmlFor="new-member-isactive" style={{ fontSize: "0.9rem", color: "#334155", cursor: "pointer", fontWeight: "500" }}>
              Membership is Active immediately
            </label>
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              id="submit-create-member-btn"
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? "Creating…" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  sectionTitle: {
    fontSize: "0.8rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "4px",
    marginBottom: "4px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "0.825rem",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "1.25rem",
  },
  cancelBtn: {
    padding: "9px 18px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  submitBtn: {
    padding: "9px 20px",
    backgroundColor: "#0284c7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
};

export default CreateMemberModal;
