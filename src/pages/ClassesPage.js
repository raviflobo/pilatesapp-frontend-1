import React, { useState } from "react";
import useAllSessionsFromDB from "../hooks/AdminsHooks/useAllSessionsFromDB.js";
import useAdminHandler from "../hooks/AdminsHooks/useAdminHandler.js";
import EditSessionModal from "../components/AdminDashboardComponents/EditSessionModal.js";
import CreateSessionModal from "../components/AdminDashboardComponents/CreateSessionModal.js";
import AddUserToSessionModal from "../components/AdminDashboardComponents/AddUserToSessionModal.js";
import { toast } from "react-toastify";
import api from "../api/api.js";

const STATUS_MAP = {
  Planned: { label: "Planned", cls: "badge-planned" },
  Cancelled: { label: "Cancelled", cls: "badge-cancelled" },
  Completed: { label: "Completed", cls: "badge-completed" },
};

const ClassesPage = () => {
  const { allSessions, setAllSessions, loading } = useAllSessionsFromDB();
  const { handleDeleteSession, handleCancelSession } = useAdminHandler();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingSession, setEditingSession] = useState(null);
  const [addingUserSessionId, setAddingUserSessionId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleBulkCreate = async () => {
    setBulkLoading(true);
    try {
      const res = await api.post("/sessions/bulk-create-week");
      toast.success(res.data.message || "Classes created!");
      setAllSessions((prev) => [...prev, ...(res.data.sessions || [])]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk create failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (session) => {
    if (!window.confirm(`Delete "${session.type}" on ${new Date(session.date).toLocaleDateString()}?`)) return;
    const ok = await handleDeleteSession(session._id);
    if (ok) setAllSessions((prev) => prev.filter((s) => s._id !== session._id));
  };

  const handleCancel = async (session) => {
    if (!window.confirm(`Cancel "${session.type}"?`)) return;
    const res = await handleCancelSession(session._id);
    if (res) setAllSessions((prev) => prev.map((s) => s._id === session._id ? res.session : s));
  };

  const handleRemoveParticipant = async (sessionId, participant) => {
    const memberName = participant?.fullName || participant?.username || "this member";
    const memberId = participant?._id || participant?.phone || participant?.username;
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this class?`)) return;
    try {
      await api.post(`/api/sessions/unregister/${sessionId}/${memberId}`);
      toast.success(`${memberName} removed from class`);
      setAllSessions((prev) =>
        prev.map((s) => {
          if (s._id !== sessionId) return s;
          return {
            ...s,
            participants: (s.participants || []).filter(
              (p) => (p._id || p) !== participant._id
            ),
          };
        })
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  const [filterTrainer, setFilterTrainer] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const trainers = Array.from(
    new Set((allSessions || []).map((s) => s.trainer?.name).filter(Boolean))
  ).sort();

  const classTypes = Array.from(
    new Set((allSessions || []).map((s) => s.type).filter(Boolean))
  ).sort();

  const filtered = (allSessions || []).filter((s) => {
    const matchSearch =
      !search ||
      s.type?.toLowerCase().includes(search.toLowerCase()) ||
      s.trainer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchTrainer = filterTrainer === "all" || s.trainer?.name === filterTrainer;
    const matchType = filterType === "all" || s.type === filterType;
    return matchSearch && matchStatus && matchTrainer && matchType;
  });

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <div style={{ color: "var(--text-muted)" }}>Loading classes…</div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-subtitle">{filtered.length} class{filtered.length !== 1 ? "es" : ""} found</p>
        </div>
        <div className="flex gap-sm">
          <button
            id="bulk-create-btn"
            className="btn btn-ghost"
            onClick={handleBulkCreate}
            disabled={bulkLoading}
          >
            {bulkLoading ? "Creating…" : "⚡ Bulk Create 7 Days"}
          </button>
          <button
            id="create-class-btn"
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New Class
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <div className="search-input-wrapper" style={{ flex: "1 1 240px", minWidth: "200px" }}>
          <span className="search-icon">🔍</span>
          <input
            id="classes-search"
            className="form-input search-input"
            placeholder="Search by keyword, room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Trainer Dropdown */}
        <select
          id="classes-trainer-filter"
          className="form-select"
          style={{ width: "170px" }}
          value={filterTrainer}
          onChange={(e) => setFilterTrainer(e.target.value)}
        >
          <option value="all">All Trainers</option>
          {trainers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Class Type Dropdown */}
        <select
          id="classes-type-filter"
          className="form-select"
          style={{ width: "180px" }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Class Types</option>
          {classTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          id="classes-status-filter"
          className="form-select"
          style={{ width: "140px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Planned">Planned</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: "none", borderRadius: "var(--radius-md)" }}>
          <table id="classes-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Date & Time</th>
                <th>Trainer</th>
                <th>Seats</th>
                <th>Waiting</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">🗓️</div>
                      <div className="empty-state-text">No classes found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const status = STATUS_MAP[s.status] || { label: s.status, cls: "badge-planned" };
                  const isFull = (s.participants?.length || 0) >= s.maxParticipants;
                  return (
                    <React.Fragment key={s._id}>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.type}</div>
                          <div className="td-secondary">{s.difficulty || "—"} · {s.duration}min</div>
                        </td>
                        <td>
                          <div>{new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                          <div className="td-secondary">{s.time}</div>
                        </td>
                        <td>{s.trainer?.name || "—"}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: isFull ? "var(--brand-danger)" : "var(--brand-success)" }}>
                            {s.participants?.length || 0}
                          </span>
                          <span className="text-muted"> / {s.maxParticipants}</span>
                          {isFull && <span className="badge badge-inactive" style={{ marginLeft: "0.375rem", fontSize: "0.65rem" }}>Full</span>}
                        </td>
                        <td>
                          {(s.waitingList?.length || 0) > 0
                            ? <span className="badge badge-warning">{s.waitingList.length} waiting</span>
                            : <span className="text-muted">—</span>
                          }
                        </td>
                        <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                        <td>
                          <div className="flex gap-sm">
                            <button
                              id={`class-edit-${s._id}`}
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => setEditingSession(s)}
                              title="Edit"
                              disabled={s.status !== "Planned"}
                            >✏️</button>
                            <button
                              id={`class-members-${s._id}`}
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => setExpandedId(expandedId === s._id ? null : s._id)}
                              title="View members"
                            >👥</button>
                            <button
                              id={`class-add-member-${s._id}`}
                              className="btn btn-success btn-sm"
                              onClick={() => setAddingUserSessionId(s._id)}
                              title="Add member"
                              disabled={s.status !== "Planned"}
                            >+ Member</button>
                            {s.status === "Planned" && (
                              <button
                                id={`class-cancel-${s._id}`}
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleCancel(s)}
                                style={{ color: "var(--brand-warning)" }}
                                title="Cancel class"
                              >⊘ Cancel</button>
                            )}
                            <button
                              id={`class-delete-${s._id}`}
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => handleDelete(s)}
                              title="Delete permanently"
                            >🗑️</button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === s._id && (
                        <tr>
                          <td colSpan="7" style={{ background: "var(--bg-input)", padding: "1rem 1.25rem" }}>
                            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                              Participants ({s.participants?.length || 0})
                            </div>
                            {s.participants?.length > 0 ? (
                              <div className="flex" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
                                {s.participants.map((p) => (
                                  <span key={p._id || p} className="badge badge-active" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    <span>👤 {p.fullName || p.username || String(p)}{p.phone ? ` · 📞 ${p.phone}` : ""}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveParticipant(s._id, p)}
                                      title="Remove member from class"
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--brand-danger)",
                                        cursor: "pointer",
                                        fontWeight: "800",
                                        fontSize: "0.85rem",
                                        padding: "0 2px",
                                        marginLeft: "4px",
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted" style={{ fontSize: "0.85rem" }}>No participants yet</span>
                            )}
                            {(s.waitingList?.length || 0) > 0 && (
                              <div style={{ marginTop: "0.75rem" }}>
                                <div style={{ fontWeight: 600, marginBottom: "0.4rem", color: "var(--brand-warning)" }}>
                                  Waiting List ({s.waitingList.length})
                                </div>
                                <div className="flex" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
                                  {s.waitingList.map((w, i) => (
                                    <span key={w._id || i} className="badge badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                      <span>#{i + 1} {w.fullName || w.username || String(w)}{w.phone ? ` · 📞 ${w.phone}` : ""}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveParticipant(s._id, w)}
                                        title="Remove from waiting list"
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "var(--brand-danger)",
                                          cursor: "pointer",
                                          fontWeight: "800",
                                          fontSize: "0.85rem",
                                          padding: "0 2px",
                                          marginLeft: "4px",
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateSessionModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          setSessions={setAllSessions}
        />
      )}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          setSessions={setAllSessions}
        />
      )}
      {addingUserSessionId && (
        <AddUserToSessionModal
          sessionId={addingUserSessionId}
          isOpen={!!addingUserSessionId}
          onClose={() => setAddingUserSessionId(null)}
          setSessions={setAllSessions}
        />
      )}
    </>
  );
};

export default ClassesPage;
