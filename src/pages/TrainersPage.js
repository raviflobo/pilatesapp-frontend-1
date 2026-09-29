import React, { useState, useEffect } from "react";
import api from "../api/api.js";
import { toast } from "react-toastify";

const DEFAULT_TRAINER = {
  name: "",
  bio: "",
  photo: "",
};

const TrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ ...DEFAULT_TRAINER });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/all?limit=100&page=1");
        const trainerUsers = (res.data.users || []).filter(
          (u) => u.role === "trainer" || u.role === "staff"
        );
        // Extract trainer profile info from sessions + user list
        setTrainers(trainerUsers.map((u) => ({
          _id: u._id,
          name: u.fullName || u.username,
          bio: u.trainerBio || "",
          photo: u.trainerPhoto || "",
          role: u.role,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = editingTrainer || newTrainer;
    try {
      if (editingTrainer?._id) {
        await api.put(`/users/update/${editingTrainer._id}`, {
          trainerBio: data.bio,
          trainerPhoto: data.photo,
          fullName: data.name,
        });
        setTrainers((prev) => prev.map((t) => t._id === editingTrainer._id ? { ...t, ...data } : t));
        toast.success("Trainer updated!");
        setEditingTrainer(null);
      } else {
        toast.info("Create a trainer via the Staff page first, then edit their bio here.");
        setShowCreate(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <div style={{ color: "var(--text-muted)" }}>Loading trainers…</div>
    </div>
  );

  const modal = editingTrainer || (showCreate ? newTrainer : null);
  const isEditing = !!editingTrainer;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trainers</h1>
          <p className="page-subtitle">Manage trainer profiles, photos, and bios</p>
        </div>
      </div>

      {trainers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏋️</div>
            <div className="empty-state-text">
              No trainers found. Create staff members with the "Trainer" role via the Staff page.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {trainers.map((t) => (
            <div key={t._id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Avatar */}
              <div className="flex" style={{ gap: "1rem", alignItems: "center" }}>
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.name}
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.25rem", fontWeight: 700, color: "white", flexShrink: 0,
                  }}>
                    {t.name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{t.name}</div>
                  <span className={`badge ${t.role === "trainer" ? "badge-warning" : "badge-staff"}`} style={{ textTransform: "capitalize" }}>
                    {t.role}
                  </span>
                </div>
              </div>

              <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, minHeight: "3rem" }}>
                {t.bio || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No bio added yet</span>}
              </div>

              {t.photo && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace", wordBreak: "break-all" }}>
                  📷 {t.photo.length > 40 ? t.photo.slice(0, 40) + "…" : t.photo}
                </div>
              )}

              <button
                id={`trainer-edit-${t._id}`}
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingTrainer({ ...t })}
              >
                ✏️ Edit Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? "Edit Trainer" : "Add Trainer"}</h2>
              <button className="modal-close" onClick={() => { setEditingTrainer(null); setShowCreate(false); }}>✕</button>
            </div>
            <form id="trainer-edit-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={modal.name}
                  onChange={(e) => isEditing
                    ? setEditingTrainer({ ...modal, name: e.target.value })
                    : setNewTrainer({ ...modal, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Photo URL</label>
                <input
                  className="form-input"
                  placeholder="https://… or /local-path.jpg"
                  value={modal.photo}
                  onChange={(e) => isEditing
                    ? setEditingTrainer({ ...modal, photo: e.target.value })
                    : setNewTrainer({ ...modal, photo: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  placeholder="Certified Pilates instructor with 10 years experience…"
                  value={modal.bio}
                  onChange={(e) => isEditing
                    ? setEditingTrainer({ ...modal, bio: e.target.value })
                    : setNewTrainer({ ...modal, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setEditingTrainer(null); setShowCreate(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainersPage;
