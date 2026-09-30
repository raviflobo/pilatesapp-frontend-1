// EditSessionModal.js
import React, { useState, useEffect } from "react";
import Modal from "../SharedComponents/Modal";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";
import api from "../../api/api";

const PRESET_WORKOUT_TYPES = [
  "Reformer Core Power",
  "Classic Mat Pilates",
  "Reformer Flow & Flex",
  "Tower & Cadillac Stretch",
  "Athletic Reformer",
  "Beginner Mat & Align",
  "Full Body Cadillac",
  "Postural Alignment",
  "Prenatal & Postnatal Pilates",
];

const PRESET_LOCATIONS = [
  "Studio",
  "Reformer Studio (Room A)",
  "Mat Studio (Room B)",
  "Cadillac & Tower Room",
  "Private VIP Suite",
];

const PRESET_DURATIONS = [
  { label: "45 minutes", value: 45 },
  { label: "50 minutes", value: 50 },
  { label: "55 minutes (Standard)", value: 55 },
  { label: "60 minutes (1 Hour)", value: 60 },
  { label: "75 minutes", value: 75 },
  { label: "90 minutes (Masterclass)", value: 90 },
];

const EditSessionModal = ({ session, isOpen, onClose, setSessions }) => {
  const [form, setForm] = useState({});
  const [trainersList, setTrainersList] = useState(["Rotem", "Sarah Jenkins"]);
  const [isCustomType, setIsCustomType] = useState(false);
  const [isCustomTrainer, setIsCustomTrainer] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  const { handleUpdateSessionData } = useAdminHandler();

  useEffect(() => {
    if (session) {
      const typeVal = session.type || "";
      const trainerVal = session.trainer?.name || "Rotem";
      const locVal = session.location || "Studio";
      const durVal = Number(session.duration) || 55;

      setForm({
        date: session.date?.slice(0, 10) || "",
        time: session.time || "",
        duration: durVal,
        type: typeVal,
        difficulty: session.difficulty || "All Levels",
        trainerName: trainerVal,
        description: session.description || "",
        status: session.status || "Planned",
        location: locVal,
        notes: session.notes || "",
        maxParticipants: session.maxParticipants || 8,
      });

      setIsCustomType(typeVal && !PRESET_WORKOUT_TYPES.includes(typeVal));
      setIsCustomTrainer(false);
      setIsCustomLocation(locVal && !PRESET_LOCATIONS.includes(locVal));
      setIsCustomDuration(durVal && !PRESET_DURATIONS.some((d) => d.value === durVal));
    }
  }, [session]);

  // Fetch trainers
  useEffect(() => {
    if (isOpen) {
      const fetchTrainers = async () => {
        try {
          const res = await api.get("/api/users/all", { params: { limit: 200 } });
          const all = res.data?.users || [];
          const staffTrainers = all
            .filter((u) => ["trainer", "staff", "admin"].includes(u.role))
            .map((u) => u.fullName || u.username)
            .filter(Boolean);

          const merged = Array.from(new Set(["Rotem", "Sarah Jenkins", ...staffTrainers]));
          setTrainersList(merged);
        } catch (err) {
          console.warn("Could not load trainers list", err);
        }
      };
      fetchTrainers();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (sessionId) => {
    const payload = {
      ...form,
      duration: Number(form.duration) || 55,
      maxParticipants: Number(form.maxParticipants) || 8,
      trainer: {
        name: form.trainerName || "Rotem",
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
      <h2 style={{ margin: "0 0 16px 0", color: "#0F172A", fontSize: "1.35rem" }}>Edit Class Session</h2>

      <div style={styles.grid2}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Date:</label>
          <input
            name="date"
            type="date"
            value={form.date || ""}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Time:</label>
          <input
            name="time"
            type="time"
            value={form.time || ""}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      {/* Class Type (Dropdown + Custom) */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Class Type:</label>
        <select
          value={isCustomType ? "__custom__" : form.type || ""}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              setIsCustomType(true);
            } else {
              setIsCustomType(false);
              setForm((p) => ({ ...p, type: e.target.value }));
            }
          }}
          style={styles.input}
        >
          {PRESET_WORKOUT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value="__custom__">➕ Other / Custom Class Name...</option>
        </select>
        {isCustomType && (
          <input
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            placeholder="Enter custom class name..."
            style={{ ...styles.input, marginTop: "6px" }}
            autoFocus
          />
        )}
      </div>

      {/* Trainer Name (Dropdown + Custom) */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Trainer:</label>
        <select
          value={isCustomTrainer ? "__custom__" : form.trainerName || ""}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              setIsCustomTrainer(true);
            } else {
              setIsCustomTrainer(false);
              setForm((p) => ({ ...p, trainerName: e.target.value }));
            }
          }}
          style={styles.input}
        >
          {trainersList.map((tr) => (
            <option key={tr} value={tr}>{tr}</option>
          ))}
          <option value="__custom__">➕ Custom / Guest Trainer...</option>
        </select>
        {isCustomTrainer && (
          <input
            name="trainerName"
            value={form.trainerName || ""}
            onChange={handleChange}
            placeholder="Enter trainer name..."
            style={{ ...styles.input, marginTop: "6px" }}
            autoFocus
          />
        )}
      </div>

      <div style={styles.grid2}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Difficulty Level:</label>
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
          <label style={styles.label}>Location:</label>
          <select
            value={isCustomLocation ? "__custom__" : form.location || ""}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomLocation(true);
              } else {
                setIsCustomLocation(false);
                setForm((p) => ({ ...p, location: e.target.value }));
              }
            }}
            style={styles.input}
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
            <option value="__custom__">➕ Other Location...</option>
          </select>
          {isCustomLocation && (
            <input
              name="location"
              value={form.location || ""}
              onChange={handleChange}
              placeholder="Enter room/location..."
              style={{ ...styles.input, marginTop: "6px" }}
              autoFocus
            />
          )}
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Duration:</label>
          <select
            value={isCustomDuration ? "__custom__" : form.duration || 55}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomDuration(true);
              } else {
                setIsCustomDuration(false);
                setForm((p) => ({ ...p, duration: Number(e.target.value) }));
              }
            }}
            style={styles.input}
          >
            {PRESET_DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
            <option value="__custom__">Custom duration...</option>
          </select>
          {isCustomDuration && (
            <input
              name="duration"
              type="number"
              value={form.duration || ""}
              onChange={handleChange}
              placeholder="Minutes"
              style={{ ...styles.input, marginTop: "6px" }}
              min={15}
              max={240}
            />
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Max Capacity:</label>
          <input
            name="maxParticipants"
            type="number"
            value={form.maxParticipants || ""}
            onChange={handleChange}
            style={styles.input}
            min={1}
            max={50}
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Status:</label>
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
        <label style={styles.label}>Description:</label>
        <input
          name="description"
          placeholder="Short class summary"
          value={form.description || ""}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Notes:</label>
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          style={styles.textarea}
        />
      </div>

      <button
        id="btn-edit-session-save"
        type="button"
        onClick={() => handleSubmit(session._id)}
        style={styles.submitBtn}
      >
        Save Changes
      </button>
    </Modal>
  );
};

const styles = {
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    marginBottom: "0.85rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.925rem",
    direction: "ltr",
    backgroundColor: "#f8fafc",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.925rem",
    minHeight: "70px",
    resize: "vertical",
    backgroundColor: "#f8fafc",
    width: "100%",
    boxSizing: "border-box",
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
    width: "100%",
    marginTop: "0.5rem",
  },
};

export default EditSessionModal;
