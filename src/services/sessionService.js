import api from "../api/api";
import { translateError } from "../utils/translateError";

// Unregister a session
export const unregisterFromSelectedSession = async (sessionId) => {
  try {
    const response = await api.post(`/api/sessions/unregister/${sessionId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw translateError(error);
  }
};

// Register a session
export const registerToSelectedSession = async (sessionId) => {
  try {
    const response = await api.post(`/api/sessions/register/${sessionId}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
    throw translateError(error);
  }
};

// Gets all sessions for year period of time
export const fetchAllSessionsForYear = async (selectedDate) => {
  try {
    console.log("Front calling API");
    const response = await api.get(`api/sessions/soon`, {
      params: { date: selectedDate },
    });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw translateError(error);
  }
};

// ADMINS - Fetch all sessions
export const fetchAllSessions = async () => {
  try {
    const response = await api.get(`api/sessions/all`, {
      params: { sortOrder: "desc" },
    });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw translateError(error);
  }
};

// ADMINS - Fetch all sessions with filters
export const fetchFilteredSessions = async (
  page,
  limit,
  search,
  sortField,
  sortOrder
) => {
  try {
    const response = await api.get(`api/sessions/all`, {
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

// ADMINS - Register a user to a session
export const registerUserToSession = async (sessionId, username) => {
  try {
    const response = await api.post(
      `api/sessions/register/${sessionId}/${username}`
    );
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// ADMINS - Unregister a user from a session
export const unregisterUserFromSession = async (sessionId, userId) => {
  try {
    const response = await api.post(
      `api/sessions/unregister/${sessionId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.log("Hi");
    throw translateError(error);
  }
};

// ADMINS - Update session data
export const updateSession = async (sessionId, sessionData) => {
  try {
    const response = await api.put(
      `api/sessions/update/${sessionId}`,
      sessionData
    );
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// ADMINS - Create a new session
export const createSession__ = async (sessionData) => {
  try {
    const response = await api.post(`api/sessions/create`, sessionData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw translateError(error);
  }
};

// Join waitlist for a full session
export const joinWaitingList = async (sessionId) => {
  try {
    const response = await api.post(`/api/sessions/waitlist/${sessionId}`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Leave waitlist for a session
export const leaveWaitingList = async (sessionId) => {
  try {
    const response = await api.delete(`/api/sessions/waitlist/${sessionId}`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Reschedule a session (4-hour rule, max 2 reschedules)
export const rescheduleSession = async (oldSessionId, newSessionId) => {
  try {
    const response = await api.post(`/api/sessions/reschedule`, {
      oldSessionId,
      newSessionId,
    });
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// ADMIN - Bulk create 7-day schedule
export const bulkCreateWeeklyClasses = async () => {
  try {
    const response = await api.post(`/api/sessions/bulk-create-week`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Fetch user completed sessions (history)
export const fetchCompletedSessions = async () => {
  try {
    const response = await api.get(`/api/sessions/mycompleted`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// Staff / Admin - Create new member and register directly to session
export const createAndRegisterMemberToSession = async (sessionId, memberData) => {
  try {
    const response = await api.post(`/api/sessions/create-and-register/${sessionId}`, memberData);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// ADMIN - Delete a session permanently
export const deleteSession = async (sessionId) => {
  try {
    const response = await api.delete(`api/sessions/delete/${sessionId}`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};

// ADMIN - Cancel a session
export const cancelSession = async (sessionId) => {
  try {
    const response = await api.put(`api/sessions/cancel/${sessionId}`);
    return response.data;
  } catch (error) {
    throw translateError(error);
  }
};
