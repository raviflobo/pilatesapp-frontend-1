import React, { useState, useEffect } from "react";
import AvailableSessionItem from "./SignUpSectionListComponents/AvailableSessionItem";
import SelectDate from "./SignUpSectionListComponents/SelectDate";
import { fetchAllSessionsForYear } from "../../services/sessionService";
import { useErrorContext } from "../../context/errorContext";

const SignupSection = ({ availableSessions }) => {
  const { setError } = useErrorContext();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [sessions, setSessions] = useState(() => {
    return availableSessions.filter(
      (ses) => ses.date.split("T")[0] === selectedDate
    );
  });

  useEffect(() => {
    const fetchSessions = async () => {
      const selected = new Date(selectedDate);
      const currentYear = new Date().getFullYear();
      const isDateInCurrentYear = selected.getFullYear() === currentYear;
      if (!isDateInCurrentYear) {
        try {
          const sessionsF = await fetchAllSessionsForYear(selectedDate);
          setSessions(() => {
            return sessionsF.filter(
              (ses) => ses.date.split("T")[0] === selectedDate
            );
          });
        } catch (e) {
          setError(e);
        }
      } else {
        setSessions(() => {
          return availableSessions.filter(
            (ses) => ses.date.split("T")[0] === selectedDate
          );
        });
      }
    };
    fetchSessions();
  }, [selectedDate, availableSessions, setError]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto auto 1fr",
        height: "80vh",
        width: "90%",
        margin: "0 auto",
        gap: "20px",
        paddingBottom: "20px",
        direction: "ltr",
      }}
    >
      <h3 style={styles.sectionTitle}>Available Workouts for Registration</h3>

      <SelectDate
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div
        style={{
          overflowY: "visible",
          borderRadius: "10px",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {sessions && sessions.length > 0 ? (
          sessions.map((ses) => (
            <AvailableSessionItem key={ses._id} session={ses} />
          ))
        ) : (
          <p>No workouts found for this date</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  sectionTitle: {
    fontSize: 25,
    color: "black",
    marginBottom: 12,
    marginTop: "40px",
  },
};

export default SignupSection;
