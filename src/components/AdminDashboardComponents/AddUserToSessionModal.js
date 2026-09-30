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
          // API returns { users: [...], totalPages, ... } or an Array
          const all = Array.isArray(res) ? res : (res?.users || []);
          const membersOnly = all.filter(
            (u) => u.role === "user" || (!u.role && u.username !== "admin")
          );
          setExistingUsers(membersOnly);
          if (membersOnly.length > 0) {
            setSelectedUsername((prev) => {
              const stillExists = membersOnly.some((m) => m.username === prev);
              return stillExists ? prev : membersOnly[0].username;
            });
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

  const filteredMembers = existingUsers.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const selectedMemberObj = existingUsers.find(
    (u) => u.username === selectedUsername
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
          {/* Member Search */}
          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Search Registered Members:</label>
            <input
              type="text"
              placeholder="Search by name, username, phone or email..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
              }}
              style={styles.input}
            />
          </div>

          {/* Member Dropdown Picker */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Member ({filteredMembers.length} available):</label>
            {loadingUsers ? (
              <p style={{ color: "#64748B", fontSize: "0.85rem", padding: "8px 0" }}>
                Loading registered members...
              </p>
            ) : filteredMembers.length === 0 ? (
              <div style={{ padding: "12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px" }}>
                <p style={{ color: "#DC2626", fontSize: "0.85rem", margin: 0, fontWeight: "500" }}>
                  {existingUsers.length === 0
                    ? "No registered members found in database."
                    : `No members match "${userSearch}".`}
                </p>
                <p style={{ color: "#64748B", fontSize: "0.8rem", margin: "4px 0 0 0" }}>
                  Use the <strong>"Quick Register New Member"</strong> tab above to add a new member.
                </p>
              </div>
            ) : (
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                style={{
                  ...styles.select,
                  height: "44px",
                  fontWeight: "600",
                  color: "#0F172A",
                  backgroundColor: "#F8FAFC",
                }}
              >
                {filteredMembers.map((m) => (
                  <option key={m._id} value={m.username}>
                    {m.fullName || m.username} (@{m.username}) {m.phone ? `· 📞 ${m.phone}` : ""} {m.email ? `· ${m.email}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Member Preview Card */}
          {selectedMemberObj && (
            <div
              style={{
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "700", color: "#0F172A", fontSize: "0.95rem" }}>
                  {selectedMemberObj.fullName || selectedMemberObj.username}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "#DBEAFE",
                    color: "#1E40AF",
                    fontWeight: "600",
                  }}
                >
                  @{selectedMemberObj.username}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                ✉️ {selectedMemberObj.email || "No email"} {selectedMemberObj.phone ? ` · 📞 ${selectedMemberObj.phone}` : ""}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={submitting || !selectedUsername || filteredMembers.length === 0}
            style={{
              ...styles.submitBtn,
              opacity: (submitting || !selectedUsername || filteredMembers.length === 0) ? 0.6 : 1,
              cursor: (submitting || !selectedUsername || filteredMembers.length === 0) ? "not-allowed" : "pointer",
            }}
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
