import React from "react";
import WorkoutCard from "./UpcomingWorkoutsListComponents/WorkoutCard";
import { useAuthContext } from "../../context/authContext";

const WorkoutSection = ({ upcomingWorkouts }) => {
  const { sessions: updatedSessions, setSessions: setUpdatedSessions } =
    useAuthContext();

  return (
    <div style={{ flex: 4, width: "90%", alignSelf: "center" }}>
      <h3 style={styles.sectionTitle}>My Upcoming Workouts</h3>
      <div style={styles.horizontalScroll}>
        {updatedSessions?.length > 0 ? (
          updatedSessions.map((session) => (
            <WorkoutCard
              key={session._id}
              session={session}
              updatedSessions={updatedSessions}
              setUpdatedSessions={setUpdatedSessions}
            />
          ))
        ) : (
          <p style={{ padding: 16 }}>No upcoming workouts</p>
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
    marginTop: 20,
  },
  horizontalScroll: {
    display: "flex",
    overflowX: "auto",
    gap: 12,
    padding: "10px 16px",
    scrollSnapType: "x mandatory",
    direction: "ltr",
    scrollBehavior: "smooth",
    marginLeft: 10,
  },
};

export default WorkoutSection;
