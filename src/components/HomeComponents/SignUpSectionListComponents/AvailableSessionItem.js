import React, { useState } from "react";
import { formatDate } from "../../../utils/homeUtils";
import {
  registerToSelectedSession,
  joinWaitingList,
  leaveWaitingList,
} from "../../../services/sessionService";
import { useErrorContext } from "../../../context/errorContext";
import { useAuthContext } from "../../../context/authContext";
import AddUserToSessionModal from "../../AdminDashboardComponents/AddUserToSessionModal";
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

const getDifficultyBadge = (diff) => {
  const level = diff || "All Levels";
  let bg = "#E0F2FE";
  let color = "#0369A1";

  if (level === "Beginner") {
    bg = "#DCFCE7";
    color = "#15803D";
  } else if (level === "Intermediate") {
    bg = "#FEF3C7";
    color = "#B45309";
  } else if (level === "Advanced") {
    bg = "#F3E8FF";
    color = "#7E22CE";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: "700",
        backgroundColor: bg,
        color: color,
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      }}
    >
      {level}
    </span>
  );
};

const AvailableSessionItem = ({ session }) => {
  const { setError } = useErrorContext();
  const { user, setSessions } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(session);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";

  const maxSpots = currentSession.maxParticipants || 10;
  const takenSpots = currentSession.participants?.length || 0;
  const spotsLeft = Math.max(0, maxSpots - takenSpots);
  const isFull = spotsLeft <= 0;

  // Check if current user is registered or in waitlist
  const userIdStr = user?._id?.toString() || user?.id?.toString();
  const isRegistered = currentSession.participants?.some(
    (p) => (typeof p === "string" ? p : p?._id?.toString()) === userIdStr
  );
  const isInWaitlist = currentSession.waitingList?.some(
    (w) => (typeof w === "string" ? w : w?._id?.toString()) === userIdStr
  );

  const handleRegister = async () => {
    if (isStaffOrAdmin) {
      toast.warning("Staff cannot book themselves to class. Use 'Add Member' instead.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await registerToSelectedSession(currentSession._id);
      if (res?.session) {
        setCurrentSession(res.session);
        setSessions((prev) => [...(prev || []), res.session]);
      }
      toast.success("Successfully booked your spot!");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (isStaffOrAdmin) {
      toast.warning("Staff members cannot join class waiting lists.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await joinWaitingList(currentSession._id);
      if (res?.session) {
        setCurrentSession(res.session);
      }
      toast.info("Added to waiting list! You'll be notified if a spot opens.");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await leaveWaitingList(currentSession._id);
      if (res?.session) {
        setCurrentSession(res.session);
      }
      toast.info("Removed from waiting list.");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = `Join me for ${currentSession.type} at Pilates Studio on ${formatDate(
      currentSession.date
    )} at ${currentSession.time}!`;
    const shareUrl = `${window.location.origin}/sessions`;

    if (navigator.share) {
      navigator
        .share({
          title: "Pilates Studio Class",
          text: text,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${text} ${shareUrl}`
      )}`;
      navigator.clipboard?.writeText(`${text} ${shareUrl}`);
      toast.info("Class details copied! Opening WhatsApp...");
      window.open(waUrl, "_blank");
    }
  };

  const trainerName = currentSession.trainer?.name || "Rotem (Lead Instructor)";
  const trainerBio =
    currentSession.trainer?.bio || "Certified Classical Pilates Master";

  return (
    <>
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          position: "relative",
          opacity: currentSession?.status === "הושלם" ? 0.6 : 1,
          direction: "ltr",
        }}
      >
        {/* Top badges row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {getDifficultyBadge(currentSession.difficulty)}
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: isFull ? "#DC2626" : "#059669",
                backgroundColor: isFull ? "#FEE2E2" : "#ECFDF5",
                padding: "3px 8px",
                borderRadius: "999px",
              }}
            >
              {isFull ? "Class Full" : `${spotsLeft} spots left`}
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleShare}
              title="Share class"
              style={{
                background: "#F1F5F9",
                border: "none",
                borderRadius: "8px",
                padding: "5px 10px",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#334155",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>↗</span> Share
            </button>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#FFFFFF",
                backgroundColor:
                  currentSession.status === "בוטל"
                    ? "#EF5350"
                    : currentSession.status === "הושלם"
                    ? "#9CCC65"
                    : "#0288D1",
              }}
            >
              {formatStatus(currentSession.status)}
            </span>
          </div>
        </div>

        {/* Main Info */}
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "#E0F2FE",
              color: "#0288D1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              flexShrink: 0,
            }}
          >
            🧘‍♀️
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              {currentSession.type}
            </h4>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.88rem",
                color: "#475569",
                fontWeight: "500",
              }}
            >
              🗓 {formatDate(currentSession.date)} &bull; ⏰ {currentSession.time}{" "}
              (55 mins)
            </p>
            {currentSession.description && (
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "0.82rem",
                  color: "#64748B",
                }}
              >
                {currentSession.description}
              </p>
            )}
          </div>
        </div>

        {/* Trainer & Location Card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: "10px",
            padding: "10px 14px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            fontSize: "0.82rem",
            color: "#334155",
          }}
        >
          <div>
            <span style={{ color: "#64748B", fontWeight: "600" }}>Trainer:</span>{" "}
            <strong>{trainerName}</strong>
            <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
              {trainerBio}
            </div>
          </div>
          <div>
            <span style={{ color: "#64748B", fontWeight: "600" }}>Location:</span>{" "}
            <strong>{formatLocation(currentSession.location)}</strong>
            {currentSession.waitingList?.length > 0 && (
              <div style={{ fontSize: "0.75rem", color: "#F59E0B" }}>
                ⏳ {currentSession.waitingList.length} in waitlist
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Staff view vs Member view */}
        {isStaffOrAdmin ? (
          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
          >
            <span>👤</span> Add Member to Class (Registered or New)
          </button>
        ) : isRegistered ? (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              backgroundColor: "#ECFDF5",
              color: "#047857",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.95rem",
            }}
          >
            ✓ You are booked for this class
          </div>
        ) : isFull ? (
          isInWaitlist ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleLeaveWaitlist}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "#FFFBEB",
                color: "#B45309",
                border: "1px solid #FCD34D",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Leave Waiting List
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleJoinWaitlist}
              style={{
                width: "100%",
                height: "44px",
                backgroundColor: "#F59E0B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Join Waiting List
            </button>
          )
        ) : (
          <button
            type="button"
            disabled={loading || currentSession?.status === "הושלם"}
            onClick={handleRegister}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: "#0288D1",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0277BD")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0288D1")}
          >
            {loading ? "Booking..." : "Book Class"}
          </button>
        )}
      </div>

      {/* Staff Modal to Add Registered or New Member */}
      {showAddMemberModal && (
        <AddUserToSessionModal
          sessionId={currentSession._id}
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          setSessions={(updater) => {
            if (typeof updater === "function") {
              const updatedList = updater([currentSession]);
              if (updatedList && updatedList[0]) {
                setCurrentSession(updatedList[0]);
              }
            }
          }}
        />
      )}
    </>
  );
};

export default AvailableSessionItem;
