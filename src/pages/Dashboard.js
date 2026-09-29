import React, { useEffect, useState } from "react";
import api from "../api/api.js";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card" style={{ "--stat-color": color }}>
    <div className="stat-icon" style={{ background: `${color}18` }}>
      <span style={{ fontSize: "1.3rem" }}>{icon}</span>
    </div>
    <div className="stat-body">
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, usersRes] = await Promise.all([
          api.get("/sessions/all?limit=100&page=1"),
          api.get("/users/all?limit=100&page=1"),
        ]);

        const sessions = sessRes.data.sessions || [];
        const users = usersRes.data.users || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const planned = sessions.filter((s) => s.status === "מתוכנן");
        const todaySessions = planned.filter((s) => {
          const d = new Date(s.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        });

        const totalBookings = sessions.reduce(
          (acc, s) => acc + (s.participants?.length || 0),
          0
        );
        const members = users.filter((u) => u.role === "user");
        const staff = users.filter((u) => u.role === "staff" || u.role === "trainer");

        setStats({
          totalClasses: sessions.length,
          plannedClasses: planned.length,
          todayClasses: todaySessions.length,
          totalMembers: members.length,
          totalStaff: staff.length,
          totalBookings,
        });

        setRecentSessions(planned.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading dashboard…</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Studio overview at a glance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="🗓️" label="Upcoming Classes" value={stats?.plannedClasses} color="#6366f1" />
        <StatCard icon="📅" label="Today's Classes" value={stats?.todayClasses} color="#ec4899" />
        <StatCard icon="👥" label="Total Members" value={stats?.totalMembers} color="#10b981" />
        <StatCard icon="📋" label="Total Bookings" value={stats?.totalBookings} color="#f59e0b" />
        <StatCard icon="🛡️" label="Staff Members" value={stats?.totalStaff} color="#06b6d4" />
        <StatCard icon="📊" label="All Classes" value={stats?.totalClasses} color="#8b5cf6" />
      </div>

      {/* Upcoming Classes Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Upcoming Classes</div>
            <div className="card-subtitle">Next scheduled sessions</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table id="dashboard-upcoming-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Date</th>
                <th>Time</th>
                <th>Trainer</th>
                <th>Seats</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No upcoming classes</td>
                </tr>
              ) : (
                recentSessions.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.type}</div>
                      <div className="td-secondary">{s.difficulty || "—"}</div>
                    </td>
                    <td>{new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>{s.time}</td>
                    <td>{s.trainer?.name || "—"}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{s.participants?.length || 0}</span>
                      <span className="text-muted"> / {s.maxParticipants}</span>
                    </td>
                    <td>
                      <span className={`badge badge-planned`}>Planned</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
