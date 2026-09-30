import React, { useState } from "react";
import { FiUsers, FiEdit, FiPlus, FiTrash2, FiInfo } from "react-icons/fi";
import useAdminHandler from "../../hooks/AdminsHooks/useAdminHandler";
import EditSessionModal from "./EditSessionModal";
import AddUserToSessionModal from "./AddUserToSessionModal";

const formatStatus = (status) => {
  return status || "Planned";
};

const formatLocation = (loc) => {
  return loc || "Studio";
};

const AllSessionsTable = ({ sessions, setSessions }) => {
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [infoExpandedId, setInfoExpandedId] = useState(null);

  const [editingSession, setEditingSession] = useState(null);
  const [addingUserSessionId, setAddingUserSessionId] = useState(null);

  const { handleUnregisterUserFromSession } = useAdminHandler();

  const handleUnregisterUserFromSessionHandler = async (sessionId, userId) => {
    const res = await handleUnregisterUserFromSession(sessionId, userId);
    if (res) {
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? res.session : s))
      );
    }
  };

  const toggleExpand = (id) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const toggleInfoExpand = (id) => {
    setInfoExpandedId((prev) => (prev === id ? null : id));
  };

  const getRowBackground = (session) => {
    const isFull = session.participants?.length >= session.maxParticipants;
    const isAvailable = session.status === "Planned";
    return isAvailable ? (isFull ? "#ffe4e6" : "#ecfdf5") : "#f8fafc";
  };

  const getIconBtnStyle = {
    backgroundColor: "#e0f2fe",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "6px 10px",
    color: "#0369a1",
    transition: "0.2s ease",
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <div style={styles.responsiveTableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions?.map((session) => {
                return (
                  <React.Fragment key={session._id}>
                    <tr
                      style={{
                        ...styles.row,
                        backgroundColor: getRowBackground(session),
                      }}
                    >
                      <td style={styles.cell}>
                        {new Date(session.date).toLocaleDateString("en-US", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td style={styles.cell}>{session.type}</td>
                      <td style={styles.cell}>
                        <span style={styles.statusBadge(session.status)}>
                          {formatStatus(session.status)}
                        </span>
                      </td>
                      <td style={styles.cell}>
                        <div style={styles.actions}>
                          <button
                            style={getIconBtnStyle}
                            onClick={() => setEditingSession(session)}
                            title="Edit Session"
                          >
                            <FiEdit />
                          </button>

                          <button
                            style={getIconBtnStyle}
                            onClick={() => toggleExpand(session._id)}
                            title="Participants"
                          >
                            <FiUsers />
                          </button>
                          <button
                            style={getIconBtnStyle}
                            onClick={() => toggleInfoExpand(session._id)}
                            title="Details"
                          >
                            <FiInfo />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {infoExpandedId === session._id && (
                      <tr>
                        <td colSpan="4" style={styles.expandBox}>
                          <div style={styles.infoLine}>
                            <strong>Time:</strong> {session.time}
                          </div>
                          <div style={styles.infoLine}>
                            <strong>Duration:</strong> {session.duration} minutes
                          </div>
                          <div style={styles.infoLine}>
                            <strong>Difficulty:</strong>{" "}
                            {session.difficulty || "All Levels"}
                          </div>
                          <div style={styles.infoLine}>
                            <strong>Trainer:</strong>{" "}
                            {session.trainer?.name || "Rotem (Lead Instructor)"}
                          </div>
                          <div style={styles.infoLine}>
                            <strong>Location:</strong> {formatLocation(session.location)}
                          </div>
                          <div style={styles.infoLine}>
                            <strong>Notes:</strong> {session.notes || "None"}
                          </div>
                          {session.waitingList?.length > 0 && (
                            <div style={{ ...styles.infoLine, color: "#d97706" }}>
                              <strong>⏳ Waiting List:</strong> {session.waitingList.length} members waiting
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                    {expandedSessionId === session._id && (
                      <tr>
                        <td colSpan="4" style={styles.expandBox}>
                          <div style={styles.infoLine}>
                            <strong>Participants:</strong>{" "}
                            {session.participants?.length || 0} of{" "}
                            {session.maxParticipants}
                          </div>
                          <div style={styles.participantsList}>
                            {session.participants?.length > 0 ? (
                              session.participants.map((p, i) => (
                                <div key={i} style={styles.participantCard}>
                                  <div>
                                    <strong>Full Name:</strong> {p.fullName || "—"}
                                  </div>
                                  <div>
                                    <strong>Username:</strong> {p.username}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {p.email}
                                  </div>
                                  <button
                                    style={styles.removeBtn}
                                    onClick={() =>
                                      handleUnregisterUserFromSessionHandler(
                                        session._id,
                                        p._id
                                      )
                                    }
                                  >
                                    <FiTrash2 /> Remove
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div style={styles.noParticipants}>
                                No participants registered
                              </div>
                            )}
                            <button
                              style={styles.addBtn}
                              onClick={() =>
                                setAddingUserSessionId(session._id)
                              }
                            >
                              <FiPlus /> Add Participant
                            </button>
                          </div>

                          {session.waitingList?.length > 0 && (
                            <div style={{ marginTop: "1rem" }}>
                              <strong style={{ color: "#d97706" }}>
                                Waiting List ({session.waitingList.length}):
                              </strong>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                                {session.waitingList.map((w, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      backgroundColor: "#fffbeb",
                                      border: "1px solid #fde68a",
                                      borderRadius: "6px",
                                      padding: "6px 10px",
                                      fontSize: "0.85rem",
                                      color: "#92400e",
                                    }}
                                  >
                                    #{idx + 1} - {w.fullName || w.username || w}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Editing Session */}
      <EditSessionModal
        session={editingSession}
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        setSessions={setSessions}
      />

      {/* Modal for Adding User to Session */}
      <AddUserToSessionModal
        sessionId={addingUserSessionId}
        isOpen={!!addingUserSessionId}
        onClose={() => setAddingUserSessionId(null)}
        setSessions={setSessions}
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
  statusBadge: (status) => ({
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    backgroundColor:
      status === "Planned"
        ? "#fef08a"
        : status === "Completed"
        ? "#bbf7d0"
        : "#fecaca",
    color:
      status === "Planned"
        ? "#92400e"
        : status === "Completed"
        ? "#166534"
        : "#991b1b",
  }),
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
  participantsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "0.75rem",
  },
  participantCard: {
    backgroundColor: "#fff",
    padding: "0.65rem 0.85rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  removeBtn: {
    marginTop: "0.4rem",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.65rem",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  addBtn: {
    alignSelf: "start",
    backgroundColor: "#d1fae5",
    color: "#166534",
    border: "none",
    borderRadius: "6px",
    padding: "0.55rem 1rem",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  noParticipants: {
    color: "#64748b",
    fontStyle: "italic",
    fontSize: "0.8rem",
  },
};

export default AllSessionsTable;
