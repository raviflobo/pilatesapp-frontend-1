// CreateSessionModal.js
import React, { useState, useEffect } from "react";
import Modal from "../SharedComponents/Modal";
import { useErrorContext } from "../../context/errorContext";
import { validateForm } from "../../utils/sharedUtils";
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

const PRESET_CAPACITIES = [
  { label: "6 seats (Intimate Reformer)", value: 6 },
  { label: "8 seats (Standard Reformer)", value: 8 },
  { label: "10 seats (Medium Group)", value: 10 },
  { label: "12 seats (Mat Pilates)", value: 12 },
  { label: "15 seats (Large Mat Group)", value: 15 },
  { label: "20 seats (Open Studio)", value: 20 },
];

const CreateSessionModal = ({ isOpen, onClose, setSessions }) => {
  const { setError } = useErrorContext();
  const { handleCreateSession } = useAdminHandler();

  const [trainersList, setTrainersList] = useState(["Rotem", "Sarah Jenkins"]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  const [isCustomType, setIsCustomType] = useState(false);
  const [isCustomTrainer, setIsCustomTrainer] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [isCustomCapacity, setIsCustomCapacity] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 55,
    type: "Reformer Core Power",
    difficulty: "All Levels",
    trainerName: "Rotem",
    description: "",
    notes: "",
    status: "Planned",
    location: "Studio",
    maxParticipants: 8,
  });

  // Load trainers from DB when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTrainers = async () => {
        setLoadingTrainers(true);
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
          console.warn("Could not load trainers dynamically", err);
        } finally {
          setLoadingTrainers(false);
        }
      };
      fetchTrainers();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      duration: Number(formData.duration) || 55,
      maxParticipants: Number(formData.maxParticipants) || 8,
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
      <h2 style={{ margin: "0 0 16px 0", color: "#0F172A", fontSize: "1.35rem" }}>
        + Create New Class Session
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={styles.form}>
        
        {/* Date and Time */}
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Class Date *</label>
            <input
              name="date"
              type="date"
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Start Time *</label>
            <input
              name="time"
              type="time"
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* Workout Type (Dropdown + Custom) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Workout Class Type *</label>
          <select
            value={isCustomType ? "__custom__" : formData.type}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomType(true);
                setFormData((p) => ({ ...p, type: "" }));
              } else {
                setIsCustomType(false);
                setFormData((p) => ({ ...p, type: e.target.value }));
              }
            }}
            style={styles.input}
          >
            {PRESET_WORKOUT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="__custom__">➕ Other / Custom Workout Type...</option>
          </select>
          {isCustomType && (
            <input
              name="type"
              type="text"
              placeholder="Enter custom class name..."
              value={formData.type}
              onChange={handleChange}
              style={{ ...styles.input, marginTop: "6px" }}
              autoFocus
              required
            />
          )}
        </div>

        {/* Trainer Name (Dropdown + Custom) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Assigned Trainer * {loadingTrainers ? <span style={{ fontSize: "0.75rem", color: "#64748b" }}>(loading...)</span> : null}
          </label>
          <select
            value={isCustomTrainer ? "__custom__" : formData.trainerName}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomTrainer(true);
                setFormData((p) => ({ ...p, trainerName: "" }));
              } else {
                setIsCustomTrainer(false);
                setFormData((p) => ({ ...p, trainerName: e.target.value }));
              }
            }}
            style={styles.input}
          >
            {trainersList.map((tr) => (
              <option key={tr} value={tr}>{tr}</option>
            ))}
            <option value="__custom__">➕ Add Custom / Guest Trainer...</option>
          </select>
          {isCustomTrainer && (
            <input
              name="trainerName"
              type="text"
              placeholder="Enter trainer name..."
              value={formData.trainerName}
              onChange={handleChange}
              style={{ ...styles.input, marginTop: "6px" }}
              autoFocus
              required
            />
          )}
        </div>

        {/* Difficulty & Location */}
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Difficulty Level</label>
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
            <label style={styles.label}>Studio Location</label>
            <select
              value={isCustomLocation ? "__custom__" : formData.location}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setIsCustomLocation(true);
                  setFormData((p) => ({ ...p, location: "" }));
                } else {
                  setIsCustomLocation(false);
                  setFormData((p) => ({ ...p, location: e.target.value }));
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
                type="text"
                placeholder="Enter custom room/location..."
                value={formData.location}
                onChange={handleChange}
                style={{ ...styles.input, marginTop: "6px" }}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Duration & Capacity */}
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Duration</label>
            <select
              value={isCustomDuration ? "__custom__" : formData.duration}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setIsCustomDuration(true);
                } else {
                  setIsCustomDuration(false);
                  setFormData((p) => ({ ...p, duration: Number(e.target.value) }));
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
                placeholder="Minutes"
                value={formData.duration}
                onChange={handleChange}
                style={{ ...styles.input, marginTop: "6px" }}
                min={15}
                max={240}
              />
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Available Seats</label>
            <select
              value={isCustomCapacity ? "__custom__" : formData.maxParticipants}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setIsCustomCapacity(true);
                } else {
                  setIsCustomCapacity(false);
                  setFormData((p) => ({ ...p, maxParticipants: Number(e.target.value) }));
                }
              }}
              style={styles.input}
            >
              {PRESET_CAPACITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
              <option value="__custom__">Custom seat count...</option>
            </select>
            {isCustomCapacity && (
              <input
                name="maxParticipants"
                type="number"
                placeholder="Max participants"
                value={formData.maxParticipants}
                onChange={handleChange}
                style={{ ...styles.input, marginTop: "6px" }}
                min={1}
                max={50}
              />
            )}
          </div>
        </div>

        {/* Description */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Class Description</label>
          <input
            name="description"
            type="text"
            placeholder="e.g. Core control, flexibility, and muscle elongation"
            value={formData.description}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {/* Status */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
            <option value="Planned">Planned</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          id="btn-create-session-submit"
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
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
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
