import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyMemberOtp,
} from "../services/authService";
import {
  checkIfUserIsAuthenticated,
  fetchAuthenticatedUser,
  fetchAuthenticatedUserSessions,
} from "../services/userService";

const AuthContext = createContext();

export let globalSetUser = null; // This is a global variable to set the user in the context
export let globalLogOut = null; // This is a global variable to log out the user

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState(null);
  globalSetUser = setUser;

  // On load -----------------------------------------------
  // Check if user is already logged in
  useEffect(() => {
    globalLogOut = logout;
    const fetchUser = async () => {
      setLoading(true);
      try {
        await checkIfUserIsAuthenticated(); // Check authentication 200/401
        await loadUserData(); // Load user data after checking authentication
        await loadUserSessions(); // Fetch user sessions
      } catch (error) {
        console.error("Error fetching authenticated user:", error);
        console.log("Setting user to null due to authentication error");
        logout(); // Log out if there's an error
        return;
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    // Navigating automatically to the home page if user is logged in
  }, []);

  // Utils -----------------------------------------------

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await loginUser(username, password);
      console.log("Login response:", response);
      if (response.status === 200) {
        await loadUserData(); // Load user data after successful login
        await loadUserSessions(); // Fetch user sessions after login
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (phone, otp, fullName) => {
    setLoading(true);
    try {
      const response = await verifyMemberOtp(phone, otp, fullName);
      await loadUserData();
      await loadUserSessions();
      return response;
    } catch (error) {
      console.error("OTP login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setSessions(null); // Clear sessions on logout
      console.log("User logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; // Rethrow the error to handle it in the component
    }
  };

  const loadUserSessions = async () => {
    try {
      const response = await fetchAuthenticatedUserSessions();
      const sessions = response.filter(
        (session) => session.status === "מתוכנן"
      );
      setSessions(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      throw error; // Rethrow the error to handle it in the component
    }
  };

  const register = async (user) => {
    setLoading(true);
    try {
      const response = await registerUser(user);
      //console.log("User registered:", response.user);
      await login(response.user.username, user.password); // Automatically log in after registration
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Rethrow the error to handle it in the component
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const user = await fetchAuthenticatedUser();
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        sessions,
        setSessions,
        // Top-level convenience (used by admin panel)
        login,
        logout,
        loginWithOtp,
        // Legacy namespace (kept for mobile compatibility)
        auth: {
          login,
          loginWithOtp,
          logout,
        },
        register,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
};
