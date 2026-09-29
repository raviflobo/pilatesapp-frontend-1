import React, { useState } from "react";
import Modal from "../SharedComponents/Modal";
import { useErrorContext } from "../../context/errorContext";
import { validateForm } from "../../utils/sharedUtils";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";

const CreateSessionModal = ({ isOpen, onClose, setSessions }) => {
  const { setError } = useErrorContext();
  const { handleCreateSession } = useAdminHandler();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "55",
    type: "Reformer Core",
    difficulty: "All Levels",
    trainerName: "Rotem",
    description: "",
    notes: "",
    status: "מתוכנן",
    location: "סטודיו",
    maxParticipants: 10,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (
      !validateForm({
        date: formData.date,
        time: formData.time,
        type: formData.type,
        duration: formData.duration,
        location: formData.location,
        maxParticipants: formData.maxParticipants,
      })
    ) {
      setError(new Error("Please fill in all required fields"));
      return;
    }

    const payload = {
      ...formData,
      trainer: {
        name: formData.trainerName || "Rotem",
        bio: "Certified Classical Pilates Master",
      },
    };
    delete payload.trainerName;

    const res = await handleCreateSession(payload);
    if (res.success) {
      setSessions((prev) => (prev ? [res.response, ...prev] : [res.response]));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ margin: "0 0 16px 0", color: "#0F172A" }}>Create New Session</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Date:</label>
          <input
            name="date"
            type="date"
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Time:</label>
          <input
            name="time"
            type="time"
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Duration (minutes):</label>
          <input
            name="duration"
            type="number"
            defaultValue={55}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Workout Type:</label>
          <input
            name="type"
            type="text"
            placeholder="e.g. Reformer Pilates, Mat Pilates, Tower Strength"
            value={formData.type}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Difficulty Level:</label>
          <select
            name="difficulty"
            value={formData.difficulty}
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
            type="text"
            value={formData.trainerName}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Description:</label>
          <input
            name="description"
            type="text"
            placeholder="Short class summary or focus"
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Notes:</label>
          <textarea name="notes" onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
            <option value="מתוכנן">Scheduled</option>
            <option value="בוטל">Cancelled</option>
            <option value="הושלם">Completed</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label>Location:</label>
          <input
            name="location"
            type="text"
            defaultValue="Studio"
            onChange={(e) => {
              const val = e.target.value === "Studio" ? "סטודיו" : e.target.value;
              setFormData({ ...formData, location: val });
            }}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Max Participants:</label>
          <input
            name="maxParticipants"
            type="number"
            defaultValue={10}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <button
          type="button"
          onClick={() => handleSubmit()}
          style={styles.submitBtn}
        >
          Create Session
        </button>
      </form>
    </Modal>
  );
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
    padding: "0.5rem",
    direction: "ltr",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
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
    marginTop: "0.8rem",
    transition: "background 0.2s ease",
  },
};

export default CreateSessionModal;
