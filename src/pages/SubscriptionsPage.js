import React, { useState } from "react";
import useAllUsersFromDB from "../hooks/AdminsHooks/useAllUsersFromDB.js";
import api from "../api/api.js";
import { toast } from "react-toastify";


const PLANS = [
  "Monthly Membership",
  "Quarterly Membership",
  "Annual Membership",
  "Trial (3 days / 3 classes)",
  "Drop-in",
];

const SubscriptionsPage = () => {
  const { allUsers, setAllUsers, loading } = useAllUsersFromDB();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [inlineEdit, setInlineEdit] = useState(null); // { userId, planName, startDate, endDate }
  const [saving, setSaving] = useState(false);

  const members = (allUsers || []).filter((u) => u.role === "user");

  const isActive = (u) => u.subscription?.endDate && new Date(u.subscription.endDate) > new Date();
  const isExpiringSoon = (u) => {
    if (!u.subscription?.endDate) return false;
    const days = (new Date(u.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  };

  const filtered = members.filter((u) => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const active = isActive(u);
    if (filterStatus === "active" && !active) return false;
    if (filterStatus === "expired" && active) return false;
    if (filterStatus === "expiring" && !isExpiringSoon(u)) return false;
    return matchSearch;
  });

  const handleSaveSubscription = async () => {
    if (!inlineEdit) return;
    setSaving(true);
    try {
      const res = await api.put(`/users/update/${inlineEdit.userId}`, {
        subscription: {
          planName: inlineEdit.planName,
          startDate: inlineEdit.startDate,
          endDate: inlineEdit.endDate,
          isActive: new Date(inlineEdit.endDate) > new Date(),
        },
      });
      setAllUsers((prev) =>
        prev.map((u) => u._id === inlineEdit.userId ? { ...u, ...res.data.user || res.data } : u)
      );
      toast.success("Subscription updated!");
      setInlineEdit(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const startInlineEdit = (u) => {
    setInlineEdit({
      userId: u._id,
      planName: u.subscription?.planName || PLANS[0],
      startDate: u.subscription?.startDate
        ? new Date(u.subscription.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: u.subscription?.endDate
        ? new Date(u.subscription.endDate).toISOString().split("T")[0]
        : "",
    });
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <div style={{ color: "var(--text-muted)" }}>Loading subscriptions…</div>
    </div>
  );

  const expiring = members.filter(isExpiringSoon).length;
  const expired = members.filter((u) => !isActive(u)).length;
  const active = members.filter(isActive).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">Manage member plan dates — updated offline by Super Admin</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex gap-sm" style={{ marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {[
          { label: "Active", value: active, cls: "badge-active" },
          { label: "Expiring ≤7 days", value: expiring, cls: "badge-warning" },
          { label: "Expired", value: expired, cls: "badge-inactive" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem" }}>
            <span className={`badge ${s.cls}`}>{s.value}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="subs-search"
            className="form-input search-input"
            placeholder="Search member…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="subs-status-filter"
          className="form-select"
          style={{ width: "170px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Members</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: "none", borderRadius: "var(--radius-md)" }}>
          <table id="subscriptions-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">💳</div>
                      <div className="empty-state-text">No members found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const active = isActive(u);
                  const expiring = isExpiringSoon(u);
                  const isEditing = inlineEdit?.userId === u._id;

                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.fullName || "—"}</div>
                        <div className="td-secondary">{u.email || u.phone || "@" + u.username}</div>
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            className="form-select"
                            style={{ minWidth: 180, padding: "0.3rem 0.5rem" }}
                            value={inlineEdit.planName}
                            onChange={(e) => setInlineEdit({ ...inlineEdit, planName: e.target.value })}
                          >
                            {PLANS.map((p) => <option key={p}>{p}</option>)}
                          </select>
                        ) : (
                          <div>{u.subscription?.planName || <span className="text-muted">—</span>}</div>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            className="form-input"
                            style={{ padding: "0.3rem 0.5rem" }}
                            value={inlineEdit.startDate}
                            onChange={(e) => setInlineEdit({ ...inlineEdit, startDate: e.target.value })}
                          />
                        ) : (
                          u.subscription?.startDate
                            ? new Date(u.subscription.startDate).toLocaleDateString("en-IN")
                            : <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            className="form-input"
                            style={{ padding: "0.3rem 0.5rem" }}
                            value={inlineEdit.endDate}
                            onChange={(e) => setInlineEdit({ ...inlineEdit, endDate: e.target.value })}
                          />
                        ) : (
                          u.subscription?.endDate
                            ? new Date(u.subscription.endDate).toLocaleDateString("en-IN")
                            : <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${expiring ? "badge-warning" : active ? "badge-active" : "badge-inactive"}`}>
                          {expiring ? "Expiring Soon" : active ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="flex gap-sm">
                            <button
                              id={`sub-save-${u._id}`}
                              className="btn btn-primary btn-sm"
                              onClick={handleSaveSubscription}
                              disabled={saving}
                            >
                              {saving ? "…" : "Save"}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setInlineEdit(null)}
                            >Cancel</button>
                          </div>
                        ) : (
                          <button
                            id={`sub-edit-${u._id}`}
                            className="btn btn-ghost btn-sm"
                            onClick={() => startInlineEdit(u)}
                          >✏️ Set Plan</button>
                        )}
                      </td>
                    </tr>
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

export default SubscriptionsPage;
