import React, { useState } from "react";
import useAllUsersFromDB from "../hooks/AdminsHooks/useAllUsersFromDB.js";
import useAdminHandler from "../hooks/AdminsHooks/useAdminHandler.js";
import EditUserModal from "../components/AdminDashboardComponents/EditUserModal.js";
import api from "../api/api.js";
import { toast } from "react-toastify";


const StaffPage = () => {
  const { allUsers, setAllUsers, loading } = useAllUsersFromDB();
  const { handleDeleteUser } = useAdminHandler();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: "", username: "", email: "", password: "", role: "staff", permissions: []
  });

  const staff = (allUsers || []).filter((u) => u.role === "staff" || u.role === "trainer");

  const filtered = staff.filter((u) =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.fullName || !newStaff.username || !newStaff.email || !newStaff.password) {
      toast.error("All fields required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/api/users/create", { ...newStaff, role: "staff" });
      setAllUsers((prev) => [...prev, res.data.user || res.data]);
      toast.success("Staff member created!");
      setShowCreate(false);
      setNewStaff({ fullName: "", username: "", email: "", password: "", role: "staff", permissions: [] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create staff");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove staff member "${user.fullName}"?`)) return;
    await handleDeleteUser(user._id);
    setAllUsers((prev) => prev.filter((u) => u._id !== user._id));
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <div style={{ color: "var(--text-muted)" }}>Loading staff…</div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">{filtered.length} staff member{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button id="create-staff-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Add Staff
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="staff-search"
            className="form-input search-input"
            placeholder="Search staff…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: "none", borderRadius: "var(--radius-md)" }}>
          <table id="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">🛡️</div>
                      <div className="empty-state-text">No staff members found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td><div style={{ fontWeight: 600 }}>{u.fullName || "—"}</div></td>
                    <td className="td-secondary">@{u.username}</td>
                    <td>{u.email || "—"}</td>
                    <td>
                      <span className={`badge ${u.role === "trainer" ? "badge-warning" : "badge-staff"}`} style={{ textTransform: "capitalize" }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="td-secondary">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button
                          id={`staff-edit-${u._id}`}
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setEditingUser(u)}
                          title="Edit"
                        >✏️</button>
                        <button
                          id={`staff-delete-${u._id}`}
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(u)}
                          title="Remove staff"
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Staff Member</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form id="create-staff-form" onSubmit={handleCreateStaff}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Jane Smith" value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" placeholder="janesmith" value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="jane@studio.com" value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="Min 8 chars" value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                    <option value="staff">Staff</option>
                    <option value="trainer">Trainer</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? "Creating…" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          setUsers={setAllUsers}
        />
      )}
    </>
  );
};

export default StaffPage;
