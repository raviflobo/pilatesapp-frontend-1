import React, { useState } from "react";
import Modal from "../SharedComponents/Modal";
import { recordBodyStats } from "../../services/userService";
import { useErrorContext } from "../../context/errorContext";
import { toast } from "react-toastify";

const RecordBodyStatsModal = ({ user, isOpen, onClose, setUsers }) => {
  const { setError } = useErrorContext();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    weight: "",
    height: "",
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
    note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStats((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!stats.weight) {
      toast.error("Please enter at least member's weight.");
      return;
    }

    setLoading(true);
    try {
      const res = await recordBodyStats(user._id, {
        weight: Number(stats.weight),
        height: stats.height ? Number(stats.height) : undefined,
        bodyFat: stats.bodyFat ? Number(stats.bodyFat) : undefined,
        chest: stats.chest ? Number(stats.chest) : undefined,
        waist: stats.waist ? Number(stats.waist) : undefined,
        hips: stats.hips ? Number(stats.hips) : undefined,
        arms: stats.arms ? Number(stats.arms) : undefined,
        thighs: stats.thighs ? Number(stats.thighs) : undefined,
        note: stats.note,
      });

      toast.success("Body metrics recorded successfully!");
      if (res?.bodyStats && setUsers) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, bodyStats: res.bodyStats } : u))
        );
      }
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ margin: "0 0 6px 0", color: "#0F172A" }}>
        Record Body Stats
      </h2>
      <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748B" }}>
        Logging physical metrics for member: <strong>{user.fullName || user.username}</strong>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px",
          direction: "ltr",
        }}
      >
        <div style={formGroup}>
          <label style={label}>Weight (kg) *</label>
          <input
            name="weight"
            type="number"
            step="0.1"
            placeholder="e.g. 68.5"
            value={stats.weight}
            onChange={handleChange}
            style={input}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Height (cm)</label>
          <input
            name="height"
            type="number"
            step="0.5"
            placeholder="e.g. 172"
            value={stats.height}
            onChange={handleChange}
            style={input}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Body Fat (%)</label>
          <input
            name="bodyFat"
            type="number"
            step="0.1"
            placeholder="e.g. 21.5"
            value={stats.bodyFat}
            onChange={handleChange}
            style={input}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Waist (cm)</label>
          <input
            name="waist"
            type="number"
            step="0.5"
            placeholder="e.g. 74"
            value={stats.waist}
            onChange={handleChange}
            style={input}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Hips (cm)</label>
          <input
            name="hips"
            type="number"
            step="0.5"
            placeholder="e.g. 96"
            value={stats.hips}
            onChange={handleChange}
            style={input}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Chest (cm)</label>
          <input
            name="chest"
            type="number"
            step="0.5"
            placeholder="e.g. 90"
            value={stats.chest}
            onChange={handleChange}
            style={input}
          />
        </div>
      </div>

      <div style={formGroup}>
        <label style={label}>Trainer Evaluation & Notes</label>
        <textarea
          name="note"
          rows={3}
          placeholder="e.g. Great core engagement improvement, posture alignment progressing well."
          value={stats.note}
          onChange={handleChange}
          style={{ ...input, resize: "vertical" }}
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "16px",
          backgroundColor: "#059669",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "8px",
          fontWeight: "700",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving Stats..." : "Save Body Evaluation"}
      </button>
    </Modal>
  );
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const label = {
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "#475569",
};

const input = {
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #CBD5E1",
  fontSize: "0.9rem",
  outline: "none",
};

export default RecordBodyStatsModal;
