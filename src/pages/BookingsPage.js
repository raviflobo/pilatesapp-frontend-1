import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { toast } from "react-toastify";

const BookingsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/sessions/all?limit=200&page=1");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemoveParticipant = async (sessionId, participant) => {
    const memberName = participant?.fullName || participant?.username || "this member";
    const memberId = participant?._id || participant?.phone || participant?.username;
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this class?`)) return;
    try {
      await api.post(`/api/sessions/unregister/${sessionId}/${memberId}`);
      toast.success(`${memberName} removed from class`);
      setSessions((prev) =>
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

  const STATUS_MAP = {
    "מתוכנן": { label: "Planned", cls: "badge-planned" },
    "בוטל":   { label: "Cancelled", cls: "badge-cancelled" },
    "הושלם":  { label: "Completed", cls: "badge-completed" },
  };

  const filtered = sessions.filter((s) => {
    const matchSearch = !search ||
      s.type?.toLowerCase().includes(search.toLowerCase()) ||
      s.trainer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalBookings = filtered.reduce((acc, s) => acc + (s.participants?.length || 0), 0);
  const totalWaiting = filtered.reduce((acc, s) => acc + (s.waitingList?.length || 0), 0);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <div style={{ color: "var(--text-muted)" }}>Loading bookings…</div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">
            {totalBookings} total bookings · {totalWaiting} on waiting lists
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="bookings-search"
            className="form-input search-input"
            placeholder="Search class or trainer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="bookings-status-filter"
          className="form-select"
          style={{ width: "160px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="מתוכנן">Planned</option>
          <option value="הושלם">Completed</option>
          <option value="בוטל">Cancelled</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: "none", borderRadius: "var(--radius-md)" }}>
          <table id="bookings-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Date & Time</th>
                <th>Trainer</th>
                <th>Booked</th>
                <th>Capacity</th>
                <th>Waiting</th>
                <th>Status</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-text">No bookings found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const status = STATUS_MAP[s.status] || { label: s.status, cls: "badge-planned" };
                  const pct = Math.round(((s.participants?.length || 0) / s.maxParticipants) * 100);
                  const isFull = (s.participants?.length || 0) >= s.maxParticipants;
                  return (
                    <React.Fragment key={s._id}>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.type}</div>
                          <div className="td-secondary">{s.location || "Studio"}</div>
                        </td>
                        <td>
                          {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          <div className="td-secondary">{s.time}</div>
                        </td>
                        <td>{s.trainer?.name || "—"}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: isFull ? "var(--brand-danger)" : "var(--brand-success)" }}>
                            {s.participants?.length || 0}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
                              <div style={{
                                height: "100%",
                                width: `${Math.min(pct, 100)}%`,
                                background: isFull ? "var(--brand-danger)" : "var(--brand-success)",
                                borderRadius: 10,
                              }} />
                            </div>
                            <span className="td-secondary">{s.maxParticipants}</span>
                          </div>
                        </td>
                        <td>
                          {(s.waitingList?.length || 0) > 0
                            ? <span className="badge badge-warning">{s.waitingList.length}</span>
                            : <span className="text-muted">—</span>
                          }
                        </td>
                        <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                        <td>
                          <button
                            id={`booking-expand-${s._id}`}
                            className="btn btn-ghost btn-sm"
                            onClick={() => setExpandedId(expandedId === s._id ? null : s._id)}
                          >
                            {expandedId === s._id ? "Hide" : "View"} ▾
                          </button>
                        </td>
                      </tr>
                      {expandedId === s._id && (
                        <tr>
                          <td colSpan="8" style={{ background: "var(--bg-input)", padding: "0.875rem 1.25rem" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                              PARTICIPANTS
                            </div>
                            {(s.participants?.length || 0) > 0 ? (
                              <div className="flex" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
                                {s.participants.map((p, i) => (
                                  <span key={p._id || i} className="badge badge-active" style={{ display: "inline-flex", alignItems: "center", gap: "6px", paddingRight: "8px" }}>
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
                              <span className="text-muted" style={{ fontSize: "0.85rem" }}>No participants booked</span>
                            )}
                            {(s.waitingList?.length || 0) > 0 && (
                              <>
                                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--brand-warning)", margin: "0.75rem 0 0.5rem" }}>
                                  WAITING LIST
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
                              </>
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
    </>
  );
};

export default BookingsPage;
