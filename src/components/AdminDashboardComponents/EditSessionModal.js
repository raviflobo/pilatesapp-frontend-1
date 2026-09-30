// EditSessionModal.js
import React, { useState, useEffect } from "react";
import Modal from "../SharedComponents/Modal";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";

const EditSessionModal = ({ session, isOpen, onClose, setSessions }) => {
  const [form, setForm] = useState({});
  const { handleUpdateSessionData } = useAdminHandler();

  useEffect(() => {
    if (session) {
      setForm({
        date: session.date?.slice(0, 10) || "",
        time: session.time || "",
        duration: session.duration || "",
        type: session.type || "",
        difficulty: session.difficulty || "All Levels",
        trainerName: session.trainer?.name || "Rotem",
        description: session.description || "",
        status: session.status || "Planned",
        location: session.location || "",
        notes: session.notes || "",
        maxParticipants: session.maxParticipants || 0,
      });
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (sessionId) => {
    const payload = {
      ...form,
      trainer: {
        name: form.trainerName,
        bio: session?.trainer?.bio || "Certified Classical Pilates Master",
      },
    };
    delete payload.trainerName;

    const res = await handleUpdateSessionData(sessionId, payload);
    if (res.success) {
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? res.response.session : s))
      );
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ margin: "0 0 16px 0", color: "#0F172A" }}>Edit Session</h2>

      <div style={styles.formGroup}>
        <label>Date:</label>
        <input
          name="date"
          type="date"
          value={form.date || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Time:</label>
        <input
          name="time"
          type="time"
          value={form.time || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Duration (minutes):</label>
        <input
          name="duration"
          type="number"
          value={form.duration || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Class Type:</label>
        <input
          name="type"
          value={form.type || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Difficulty Level:</label>
        <select
          name="difficulty"
          value={form.difficulty || "All Levels"}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="All Levels">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label>Trainer Name:</label>
        <input
          name="trainerName"
          value={form.trainerName || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Description:</label>
        <input
          name="description"
          placeholder="Short class summary"
          value={form.description || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Status:</label>
        <select
          name="status"
          value={form.status || "Planned"}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="Planned">Planned</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label>Location:</label>
        <input
          name="location"
          value={form.location || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Notes:</label>
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          style={styles.textarea}
        />
      </div>

      <div style={styles.formGroup}>
        <label>Max Participants:</label>
        <input
          name="maxParticipants"
          type="number"
          value={form.maxParticipants ?? 10}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <button
        style={styles.submitBtn}
        onClick={() => handleSubmit(session._id)}
      >
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
  textarea: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "0.95rem",
    resize: "vertical",
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

export default EditSessionModal;
