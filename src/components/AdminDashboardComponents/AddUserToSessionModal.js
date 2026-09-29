// AddUserToSessionModal.js
import React, { useState, useEffect } from "react";
import Modal from "../SharedComponents/Modal";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";
import { useErrorContext } from "../../context/errorContext";
import { fetchAllUsers } from "../../services/userService";
import { createAndRegisterMemberToSession } from "../../services/sessionService";
import { toast } from "react-toastify";
import { FiUserCheck, FiUserPlus } from "react-icons/fi";

const AddUserToSessionModal = ({ sessionId, isOpen, onClose, setSessions }) => {
  const [activeTab, setActiveTab] = useState("existing"); // "existing" | "new"
  const [existingUsers, setExistingUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New member form
  const [newMember, setNewMember] = useState({
    fullName: "",
    username: "",
    email: "",
    gender: "female",
    birthDate: "1996-01-01",
  });

  const { handleAddUserToSession } = useAdminHandler();
  const { setError } = useErrorContext();

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await fetchAllUsers();
          // Filter to regular members (role === "user")
          const membersOnly = (res || []).filter((u) => u.role === "user");
          setExistingUsers(membersOnly);
          if (membersOnly.length > 0) {
            setSelectedUsername(membersOnly[0].username);
          }
        } catch (err) {
          console.error("Failed to load users", err);
        } finally {
          setLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isOpen]);

  const handleAddExisting = async () => {
    if (!selectedUsername) {
      toast.error("Please select a registered member");
      return;
    }
    setSubmitting(true);
    try {
      const res = await handleAddUserToSession(sessionId, selectedUsername);
      if (res?.success) {
        if (setSessions) {
          setSessions((prev) =>
            prev.map((s) => (s._id === sessionId ? res.response.session : s))
          );
        }
        onClose();
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewMember = async () => {
    if (!newMember.fullName || !newMember.username || !newMember.email) {
      toast.error("Full Name, Username, and Email are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createAndRegisterMemberToSession(sessionId, newMember);
      toast.success(res.message || "New member added to class!");
      if (setSessions && res.session) {
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? res.session : s))
        );
      }
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = existingUsers.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ margin: "0 0 16px 0", color: "#0F172A", fontSize: "1.25rem" }}>
        Add Member to Class
      </h2>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("existing")}
          style={{
            padding: "8px 14px",
            border: "none",
            background: "none",
            fontWeight: activeTab === "existing" ? "700" : "500",
            color: activeTab === "existing" ? "#2563eb" : "#64748B",
            borderBottom:
              activeTab === "existing" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.9rem",
          }}
        >
          <FiUserCheck /> Existing Registered Member
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("new")}
          style={{
            padding: "8px 14px",
            border: "none",
            background: "none",
            fontWeight: activeTab === "new" ? "700" : "500",
            color: activeTab === "new" ? "#2563eb" : "#64748B",
            borderBottom:
              activeTab === "new" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.9rem",
          }}
        >
          <FiUserPlus /> Quick Register New Member
        </button>
      </div>

      {activeTab === "existing" ? (
        <div>
          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Search Registered Members:</label>
            <input
              type="text"
              placeholder="Search by name, username or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Member:</label>
            {loadingUsers ? (
              <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Loading registered members...</p>
            ) : filteredMembers.length === 0 ? (
              <p style={{ color: "#EF4444", fontSize: "0.85rem" }}>
                No matching registered members found. Use "Quick Register New Member" tab to add them.
              </p>
            ) : (
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                style={styles.select}
                size={Math.min(5, Math.max(2, filteredMembers.length))}
              >
                {filteredMembers.map((m) => (
                  <option key={m._id} value={m.username} style={{ padding: "6px" }}>
                    {m.fullName || m.username} (@{m.username}) &bull; {m.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="button"
            disabled={submitting || !selectedUsername}
            style={styles.submitBtn}
            onClick={handleAddExisting}
          >
            {submitting ? "Adding to Class..." : "Add Member to Class"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              value={newMember.fullName}
              placeholder="e.g. Jessica Alba"
              onChange={(e) =>
                setNewMember({ ...newMember, fullName: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input
              value={newMember.username}
              placeholder="e.g. jessica_a"
              onChange={(e) =>
                setNewMember({ ...newMember, username: e.target.value.toLowerCase().replace(/\s+/g, "_") })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              value={newMember.email}
              placeholder="e.g. jessica@example.com"
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                value={newMember.birthDate}
                onChange={(e) =>
                  setNewMember({ ...newMember, birthDate: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gender</label>
              <select
                value={newMember.gender}
                onChange={(e) =>
                  setNewMember({ ...newMember, gender: e.target.value })
                }
                style={styles.input}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            style={{ ...styles.submitBtn, backgroundColor: "#059669" }}
            onClick={handleCreateNewMember}
          >
            {submitting ? "Registering & Adding..." : "Register & Add to Class"}
          </button>
        </div>
      )}
    </Modal>
  );
};

const styles = {
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    marginBottom: "0.85rem",
    direction: "ltr",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "0.95rem",
    direction: "ltr",
    outline: "none",
  },
  select: {
    padding: "0.4rem",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "0.9rem",
    direction: "ltr",
    outline: "none",
    width: "100%",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "0.75rem",
    fontSize: "0.95rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "0.8rem",
    width: "100%",
    transition: "background 0.2s ease",
  },
};

export default AddUserToSessionModal;
