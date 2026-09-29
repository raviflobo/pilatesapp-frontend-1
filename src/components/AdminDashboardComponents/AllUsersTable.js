import React, { useState } from "react";
import { FiEdit, FiTrash2, FiInfo, FiActivity } from "react-icons/fi";
import EditUserModal from "./EditUserModal";
import RecordBodyStatsModal from "./RecordBodyStatsModal";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";
import { useAuthContext } from "../../context/authContext";

const AllUsersTable = ({ users, setUsers }) => {
  const { user: currentUser } = useAuthContext();
  const [infoExpandedId, setInfoExpandedId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [statsUser, setStatsUser] = useState(null);
  const { handleDeleteUser } = useAdminHandler();

  const toggleInfoExpand = (id) => {
    setInfoExpandedId((prev) => (prev === id ? null : id));
  };

  const formatGender = (gender) => {
    if (gender === "male") return "Male";
    if (gender === "female") return "Female";
    return "Other";
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <div style={styles.responsiveTableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <React.Fragment key={user._id}>
                  <tr style={styles.row}>
                    <td style={styles.cell}>{user.fullName}</td>
                    <td style={styles.cell}>{user.username}</td>
                    <td style={styles.cell}>
                      <span style={styles.roleBadge(user.role)}>
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td style={styles.cell}>
                      <div style={styles.actions}>
                        <button
                          style={styles.iconBtn}
                          onClick={() => setEditingUser(user)}
                          title="Edit User & Subscription"
                        >
                          <FiEdit />
                        </button>
                        <button
                          style={{
                            ...styles.iconBtn,
                            backgroundColor: "#DCFCE7",
                            borderColor: "#86EFAC",
                            color: "#15803D",
                          }}
                          onClick={() => setStatsUser(user)}
                          title="Record Body Stats"
                        >
                          <FiActivity />
                        </button>
                        {currentUser?.role === "admin" && (
                          <button
                            style={styles.iconBtn}
                            onClick={() => {
                              const confirmed = window.confirm(
                                "Are you sure you want to delete this user?"
                              );
                              if (confirmed) handleDeleteUser(user._id);
                            }}
                            title="Delete User (Super Admin)"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                        <button
                          style={styles.iconBtn}
                          onClick={() => toggleInfoExpand(user._id)}
                          title="Details"
                        >
                          <FiInfo />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {infoExpandedId === user._id && (
                    <tr>
                      <td colSpan="4" style={styles.expandBox}>
                        <div style={styles.infoLine}>
                          <strong>Email:</strong> {user.email}
                        </div>
                        <div style={styles.infoLine}>
                          <strong>Date of Birth:</strong>{" "}
                          {user.birthDate
                            ? new Date(user.birthDate).toLocaleDateString("en-US")
                            : "N/A"}
                        </div>
                        <div style={styles.infoLine}>
                          <strong>Gender:</strong>{" "}
                          {formatGender(user.gender)}
                        </div>
                        {user.subscription && (
                          <div style={{ ...styles.infoLine, marginTop: "6px" }}>
                            <strong>Subscription:</strong> {user.subscription.planName || "Monthly Membership"} &bull;{" "}
                            Valid until{" "}
                            {user.subscription.endDate
                              ? new Date(user.subscription.endDate).toLocaleDateString("en-US")
                              : "N/A"}
                          </div>
                        )}
                        {user.bodyStats?.length > 0 && (
                          <div style={{ ...styles.infoLine, color: "#059669" }}>
                            <strong>Latest Recorded Weight:</strong>{" "}
                            {user.bodyStats[user.bodyStats.length - 1].weight} kg (BMI:{" "}
                            {user.bodyStats[user.bodyStats.length - 1].bmi || "--"})
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Editing User & Subscription */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        setUsers={setUsers}
      />

      {/* Modal for Recording Body Stats */}
      <RecordBodyStatsModal
        user={statsUser}
        isOpen={!!statsUser}
        onClose={() => setStatsUser(null)}
        setUsers={setUsers}
      />
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "1rem 0.5rem",
    fontFamily: '"M PLUS Rounded 1c", sans-serif',
    backgroundColor: "#f9fafb",
    direction: "ltr",
  },
  tableContainer: {
    width: "100%",
  },
  responsiveTableWrapper: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    maxWidth: "100vw",
  },
  table: {
    width: "100%",
    minWidth: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 12px",
    direction: "ltr",
    fontSize: "0.95rem",
  },
  headerRow: {
    backgroundColor: "#f1f5f9",
    height: "44px",
  },
  row: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    height: "64px",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  cell: {
    verticalAlign: "middle",
    padding: "0.4rem 0.5rem",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: {
    backgroundColor: "#e0f2fe",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "6px 10px",
    color: "#0369a1",
    transition: "0.2s ease",
  },
  expandBox: {
    backgroundColor: "#f1f5f9",
    padding: "1rem 1rem",
    fontSize: "0.9rem",
    borderRadius: "0 0 10px 10px",
    textAlign: "left",
  },
  infoLine: {
    marginBottom: "0.4rem",
    color: "#334155",
  },
  roleBadge: (role) => ({
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    backgroundColor: role === "admin" ? "#dbeafe" : "#f3f4f6",
    color: role === "admin" ? "#1d4ed8" : "#374151",
    display: "inline-block",
  }),
};

export default AllUsersTable;
