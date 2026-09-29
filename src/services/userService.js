import api from "../api/api";
import { translateError } from "../utils/translateError";

export const fetchAuthenticatedUser = async () => {
  try {
    const response = await api.get("/api/users/get");
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

export const checkIfUserIsAuthenticated = async () => {
  try {
    const response = await api.get("/api/auth/checkauth");
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

export const fetchAuthenticatedUserSessions = async () => {
  try {
    const response = await api.get("/api/sessions/myupcoming");
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

export const fetchAllUsers = async () => {
  try {
    const res = await api.get("/api/users/all", {
      params: { sortOrder: "asc", sortField: "role", limit: 200 },
    });
    return res.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Admin - Create a new user (staff/member)
export const createUser = async (userData) => {
  try {
    const response = await api.post("/api/users/create", userData);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// ADMINS - Fetch all sessions with filters
export const fetchFilteredUsers = async (
  page,
  limit,
  search,
  sortField,
  sortOrder
) => {
  try {
    const response = await api.get(`api/users/all`, {
      params: {
        page: page,
        limit: limit,
        search: search,
        sortField: sortField,
        sortOrder: sortOrder,
      },
    });
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// For admins
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`api/users/update/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// For admins
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`api/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Admin / Trainer - Record body stats for user
export const recordBodyStats = async (userId, statsData) => {
  try {
    const response = await api.post(`/api/users/body-stats/${userId}`, statsData);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Admin - Update user subscription details
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const response = await api.put(`/api/users/subscription/${userId}`, subscriptionData);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// User - Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/api/users/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// User - Self-service account deletion
export const deleteMyAccount = async () => {
  try {
    const response = await api.delete(`/api/users/account`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};
