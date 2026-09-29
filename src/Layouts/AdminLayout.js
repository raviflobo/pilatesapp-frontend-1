import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext.js";
import { toast } from "react-toastify";

const NAV_ITEMS = [
  { to: "/dashboard",     icon: "📊", label: "Dashboard",     section: "Overview" },
  { to: "/classes",       icon: "🗓️", label: "Classes",       section: "Manage" },
  { to: "/bookings",      icon: "📋", label: "Bookings",      section: "Manage" },
  { to: "/members",       icon: "👥", label: "Members",       section: "People" },
  { to: "/staff",         icon: "🛡️", label: "Staff",         section: "People" },
  { to: "/subscriptions", icon: "💳", label: "Subscriptions", section: "Finance" },
  { to: "/trainers",      icon: "🏋️", label: "Trainers",      section: "Studio" },
];

const AdminLayout = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Group nav items by section
  const sections = [...new Set(NAV_ITEMS.map((n) => n.section))];

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "SA";

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" id="admin-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🧘</div>
          <div>
            <div className="sidebar-brand-text">Pilates Studio</div>
            <div className="sidebar-brand-sub">Super Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Admin Navigation">
          {sections.map((section) => (
            <React.Fragment key={section}>
              <div className="sidebar-section-label">{section}</div>
              {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  id={`nav-${item.label.toLowerCase()}`}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            id="admin-logout-btn"
            className="nav-link full-width"
            onClick={handleLogout}
            style={{ color: "var(--brand-danger)" }}
          >
            <span className="nav-icon">🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-title" id="topbar-page-title">Admin Panel</div>
          <div className="topbar-right">
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {user?.fullName || "Super Admin"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {user?.email || ""}
              </div>
            </div>
            <div className="topbar-avatar" title="Admin">{initials}</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
