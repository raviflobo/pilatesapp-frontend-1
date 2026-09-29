import React, { useState } from "react";
import { FaMapMarkerAlt, FaUsers, FaTimes } from "react-icons/fa";
import {
  unregisterFromSelectedSession,
  rescheduleSession,
  fetchAllSessionsForYear,
} from "../../../services/sessionService";
import { formatDate } from "../../../utils/homeUtils";
import { useErrorContext } from "../../../context/errorContext";
import { toast } from "react-toastify";

const formatStatus = (status) => {
  if (status === "מתוכנן") return "Scheduled";
  if (status === "בוטל") return "Cancelled";
  if (status === "הושלם") return "Completed";
  return status;
};

const formatLocation = (loc) => {
  if (loc === "סטודיו") return "Studio";
  return loc;
};

const WorkoutCard = ({ session, updatedSessions, setUpdatedSessions }) => {
  const { setError } = useErrorContext();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedNewSessionId, setSelectedNewSessionId] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // 4-hour rule calculation
  let hoursUntil = 999;
  try {
    const datePart = session.date ? session.date.split("T")[0] : "";
    const sessionTimeStr = session.time || "00:00";
    const sessionDateTime = new Date(`${datePart}T${sessionTimeStr}`);
    hoursUntil = (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  } catch (err) {
    hoursUntil = 999;
  }
  const isWithin4Hours = hoursUntil < 4 && hoursUntil > 0;

  const handleUnregister = async (sessionId) => {
    if (isWithin4Hours) {
      const proceed = window.confirm(
        "Warning: This class starts in less than 4 hours. The studio policy requires 4 hours notice for cancellations. Do you still wish to proceed?"
      );
      if (!proceed) return;
    } else {
      const isConfirmed = window.confirm(
        "Are you sure you want to cancel your booking for this workout?"
      );
      if (!isConfirmed) return;
    }

    try {
      await unregisterFromSelectedSession(sessionId);
      setUpdatedSessions(updatedSessions.filter((s) => s._id !== sessionId));
      toast.info("Booking cancelled successfully.");
    } catch (e) {
      setError(e);
    }
  };

  const handleOpenReschedule = async () => {
    if (isWithin4Hours) {
      toast.warning("Rescheduling is only permitted at least 4 hours before class time.");
      return;
    }
    setShowRescheduleModal(true);
    setLoadingClasses(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const data = await fetchAllSessionsForYear(todayStr);
      // Filter sessions that are upcoming, scheduled, have spots left, and not the current session
      const valid = (data || []).filter(
        (s) =>
          s._id !== session._id &&
          s.status === "מתוכנן" &&
          (s.participants?.length || 0) < (s.maxParticipants || 10)
      );
      setAvailableClasses(valid);
    } catch (e) {
      setError(e);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedNewSessionId) {
      toast.error("Please select a new class.");
      return;
    }
    setRescheduling(true);
    try {
      const res = await rescheduleSession(session._id, selectedNewSessionId);
      toast.success("Class rescheduled successfully!");
      // Update local sessions
      if (res?.newSession) {
        setUpdatedSessions((prev) =>
          prev.map((s) => (s._id === session._id ? res.newSession : s))
        );
      }
      setShowRescheduleModal(false);
    } catch (e) {
      setError(e);
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <>
      <div
        style={styles.card}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = styles.cardHover.boxShadow)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = styles.card.boxShadow)
        }
      >
        <div style={styles.header}>
          <div style={styles.dateBox}>
            <span style={styles.dateText}>{formatDate(session.date)}</span>
            <span style={styles.timeText}>{session.time}</span>
          </div>
          <span style={styles.status(session.status)}>
            {formatStatus(session.status)}
          </span>
        </div>

        <h3 style={styles.title}>{session.type}</h3>

        <div style={styles.row}>
          <FaMapMarkerAlt size={14} style={styles.icon} />
          <span style={styles.detailText}>{formatLocation(session.location)}</span>
        </div>

        <div style={styles.row}>
          <FaUsers size={14} style={styles.icon} />
          <span style={styles.detailText}>
            {session.participants?.length ?? 0}/{session.maxParticipants} participants
          </span>
        </div>

        {isWithin4Hours && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#DC2626",
              backgroundColor: "#FEF2F2",
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: "600",
            }}
          >
            ⚠️ Less than 4 hours until class
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
          <button
            type="button"
            style={{
              flex: 1,
              backgroundColor: isWithin4Hours ? "#E2E8F0" : "#E0F2FE",
              color: isWithin4Hours ? "#94A3B8" : "#0288D1",
              border: "none",
              padding: "8px 10px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: isWithin4Hours ? "not-allowed" : "pointer",
            }}
            onClick={handleOpenReschedule}
          >
            Reschedule
          </button>
          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => handleUnregister(session._id)}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            direction: "ltr",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0F172A" }}>
                Reschedule Class
              </h3>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "#64748B",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#475569", margin: "0 0 12px 0" }}>
              Currently booked: <strong>{session.type}</strong> on{" "}
              {formatDate(session.date)} at {session.time}.
            </p>

            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#FEF3C7",
                borderRadius: "8px",
                color: "#92400E",
                fontSize: "0.8rem",
                marginBottom: "16px",
              }}
            >
              ℹ️ Policy: Max 2 reschedules per booking, allowed up to 4 hours before start time.
            </div>

            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "0.88rem",
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              Select New Class:
            </label>

            {loadingClasses ? (
              <p style={{ color: "#64748B", fontSize: "0.9rem" }}>Loading available classes...</p>
            ) : availableClasses.length === 0 ? (
              <p style={{ color: "#EF4444", fontSize: "0.9rem" }}>
                No alternative open classes found in the schedule.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "240px",
                  overflowY: "auto",
                  marginBottom: "16px",
                }}
              >
                {availableClasses.map((cls) => {
                  const isSelected = selectedNewSessionId === cls._id;
                  return (
                    <div
                      key={cls._id}
                      onClick={() => setSelectedNewSessionId(cls._id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #0288D1" : "1px solid #E2E8F0",
                        backgroundColor: isSelected ? "#F0F9FF" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#0F172A" }}>
                          {cls.type}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                          🗓 {formatDate(cls.date)} &bull; ⏰ {cls.time}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#059669",
                          backgroundColor: "#ECFDF5",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontWeight: "600",
                        }}
                      >
                        {(cls.maxParticipants || 10) - (cls.participants?.length || 0)} spots left
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rescheduling || !selectedNewSessionId}
                onClick={handleConfirmReschedule}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: selectedNewSessionId ? "#0288D1" : "#94A3B8",
                  color: "#FFFFFF",
                  fontWeight: "700",
                  cursor: selectedNewSessionId ? "pointer" : "not-allowed",
                }}
              >
                {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  card: {
    minWidth: 280,
    backgroundColor: "#FFFFFF",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "box-shadow 0.3s ease",
    marginInlineEnd: "16px",
    direction: "ltr",
    border: "1px solid #F1F5F9",
  },
  cardHover: {
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  dateText: {
    fontSize: "0.9rem",
    color: "#444",
    fontWeight: "600",
  },
  timeText: {
    fontSize: "0.8rem",
    color: "#777",
  },
  status: (status) => ({
    fontSize: "0.75rem",
    padding: "4px 10px",
    borderRadius: "10px",
    fontWeight: "600",
    backgroundColor:
      status === "בוטל"
        ? "#ffe5e5"
        : status === "הושלם"
        ? "#e0f5e0"
        : "#fff6e5",
    color: status === "בוטל" ? "#a00" : status === "הושלם" ? "#0a0" : "#d76629",
  }),
  title: {
    fontSize: "1.1rem",
    color: "#1e1e1e",
    margin: "4px 0",
    fontWeight: "700",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  icon: {
    color: "#d76629",
  },
  detailText: {
    fontSize: "0.9rem",
    color: "#444",
  },
  cancelBtn: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
};

export default WorkoutCard;
