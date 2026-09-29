import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/authContext.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// Pages
import AdminLogin from "./pages/AdminLogin.js";
import AdminLayout from "./Layouts/AdminLayout.js";
import Dashboard from "./pages/Dashboard.js";
import ClassesPage from "./pages/ClassesPage.js";
import MembersPage from "./pages/MembersPage.js";
import StaffPage from "./pages/StaffPage.js";
import BookingsPage from "./pages/BookingsPage.js";
import SubscriptionsPage from "./pages/SubscriptionsPage.js";
import TrainersPage from "./pages/TrainersPage.js";
import LoadingSpinner from "./components/Loading/LoadingSpinner.js";

// Guard: require super admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  if (loading) return <LoadingSpinner text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

// Guard: redirect admin away from login
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  if (loading) return <LoadingSpinner text="Loading..." />;
  return !user || user.role !== "admin" ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />

        {/* Super Admin Panel */}
        <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="trainers" element={<TrainersPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
