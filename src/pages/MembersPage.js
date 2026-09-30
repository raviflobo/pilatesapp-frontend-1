import React, { useState } from "react";
import useAllUsersFromDB from "../hooks/AdminsHooks/useAllUsersFromDB.js";
import useAdminHandler from "../hooks/AdminsHooks/useAdminHandler.js";
import EditUserModal from "../components/AdminDashboardComponents/EditUserModal.js";
import RecordBodyStatsModal from "../components/AdminDashboardComponents/RecordBodyStatsModal.js";
import CreateMemberModal from "../components/AdminDashboardComponents/CreateMemberModal.js";

const MembersPage = () => {
  const { allUsers, setAllUsers, loading } = useAllUsersFromDB();
  const { handleDeleteUser } = useAdminHandler();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [statsUser, setStatsUser] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const members = (allUsers || []).filter((u) => u.role === "user");

  const filtered = members.filter((u) =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete member "${user.fullName}"? This cannot be undone.`)) return;
    const ok = await handleDeleteUser(user._id);
    if (ok !== false) setAllUsers((prev) => prev.filter((u) => u._id !== user._id));
  };

  const isSubActive = (user) => {
    if (!user.subscription?.endDate) return false;
    return new Date(user.subscription.endDate) > new Date();
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <div style={{ color: "var(--text-muted)" }}>Loading members…</div>
    </div>
  );

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          id="btn-open-create-member"
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span>+</span> New Member
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="members-search"
            className="form-input search-input"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: "none", borderRadius: "var(--radius-md)" }}>
          <table id="members-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Contact</th>
                <th>Subscription</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <div className="empty-state-text">No members found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const active = isSubActive(u);
                  return (
                    <React.Fragment key={u._id}>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.fullName || "—"}</div>
                          <div className="td-secondary">@{u.username}</div>
                        </td>
                        <td>
                          <div>{u.email || "—"}</div>
                          <div className="td-secondary">{u.phone || "—"}</div>
                        </td>
                        <td>
                          <span className={`badge ${active ? "badge-active" : "badge-inactive"}`}>
                            {active ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td>
                          <div>{u.subscription?.planName || "—"}</div>
                          {u.subscription?.endDate && (
                            <div className="td-secondary">
                              Until {new Date(u.subscription.endDate).toLocaleDateString("en-IN")}
                            </div>
                          )}
                        </td>
                        <td className="td-secondary">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td>
                          <div className="flex gap-sm">
                            <button
                              id={`member-edit-${u._id}`}
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => setEditingUser(u)}
                              title="Edit member"
                            >✏️</button>
                            <button
                              id={`member-stats-${u._id}`}
                              className="btn btn-success btn-sm btn-icon"
                              onClick={() => setStatsUser(u)}
                              title="Record body stats"
                            >📊</button>
                            <button
                              id={`member-info-${u._id}`}
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => setExpandedId(expandedId === u._id ? null : u._id)}
                              title="View details"
                            >ℹ️</button>
                            <button
                              id={`member-delete-${u._id}`}
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => handleDelete(u)}
                              title="Delete permanently"
                            >🗑️</button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === u._id && (
                        <tr>
                          <td colSpan="6" style={{ background: "var(--bg-input)", padding: "1rem 1.25rem" }}>
                            <div className="flex" style={{ flexWrap: "wrap", gap: "1.5rem", fontSize: "0.85rem" }}>
                              <div>
                                <div className="td-secondary" style={{ marginBottom: "0.25rem" }}>Date of Birth</div>
                                <div>{u.birthDate ? new Date(u.birthDate).toLocaleDateString("en-IN") : "—"}</div>
                              </div>
                              <div>
                                <div className="td-secondary" style={{ marginBottom: "0.25rem" }}>Gender</div>
                                <div style={{ textTransform: "capitalize" }}>{u.gender || "—"}</div>
                              </div>
                              {u.bodyStats?.length > 0 && (
                                <div>
                                  <div className="td-secondary" style={{ marginBottom: "0.25rem" }}>Latest Body Stats</div>
                                  <div>Weight: {u.bodyStats.at(-1).weight}kg · BMI: {u.bodyStats.at(-1).bmi || "—"}</div>
                                </div>
                              )}
                              <div>
                                <div className="td-secondary" style={{ marginBottom: "0.25rem" }}>Sub Start</div>
                                <div>{u.subscription?.startDate ? new Date(u.subscription.startDate).toLocaleDateString("en-IN") : "—"}</div>
                              </div>
                              <div>
                                <div className="td-secondary" style={{ marginBottom: "0.25rem" }}>Notifications</div>
                                <div>{u.notifications?.filter(n => !n.read).length || 0} unread</div>
                              </div>
                            </div>
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

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          setUsers={setAllUsers}
        />
      )}
      {statsUser && (
        <RecordBodyStatsModal
          user={statsUser}
          isOpen={!!statsUser}
          onClose={() => setStatsUser(null)}
          setUsers={setAllUsers}
        />
      )}
      {showCreate && (
        <CreateMemberModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onMemberCreated={(newMember) => {
            setAllUsers((prev) => [newMember, ...prev]);
          }}
        />
      )}
    </>
  );
};

export default MembersPage;
