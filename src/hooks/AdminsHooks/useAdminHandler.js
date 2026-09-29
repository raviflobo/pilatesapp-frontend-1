import { useState } from "react";
import { useErrorContext } from "../../context/errorContext";
import {
  createSession__,
  registerUserToSession,
  unregisterUserFromSession,
  updateSession,
  deleteSession,
  cancelSession,
} from "../../services/sessionService";
import { toast } from "react-toastify";
import { deleteUser, updateUser } from "../../services/userService";

const useAdminHandler = () => {
  const [loading, setLoading] = useState(false);
  const { setError } = useErrorContext();

  const handleUnregisterUserFromSession = async (sessionId, userId) => {
    try {
      setLoading(true);
      const res = await unregisterUserFromSession(sessionId, userId);
      toast.success("User removed from session successfully!");
      return res;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSessionData = async (sessionId, sessionData) => {
    try {
      setLoading(true);
      const res = await updateSession(sessionId, sessionData);
      toast.success("Session updated successfully!");
      return { success: true, response: res };
    } catch (error) {
      setError(error);
      return { success: false, response: null };
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserToSession = async (sessionId, username) => {
    try {
      setLoading(true);
      const res = await registerUserToSession(sessionId, username);
      toast.success("User added to session successfully!");
      return { success: true, response: res };
    } catch (error) {
      setError(error);
      return { success: false, response: null };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserData = async (userId, userData) => {
    try {
      setLoading(true);
      const res = await updateUser(userId, userData);
      toast.success("User details updated successfully!");
      return { success: true, response: res };
    } catch (error) {
      setError(error);
      return { success: false, response: null };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      const res = await deleteUser(userId);
      toast.success("User deleted successfully!");
      return { success: true, response: res };
    } catch (error) {
      setError(error);
      return { success: false, response: null };
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData) => {
    try {
      setLoading(true);
      const res = await createSession__(sessionData);
      toast.success("Session created successfully!");
      return { success: true, response: res };
    } catch (error) {
      setError(error);
      return { success: false, response: null };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      setLoading(true);
      await deleteSession(sessionId);
      toast.success("Class deleted!");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      setLoading(true);
      const res = await cancelSession(sessionId);
      toast.success("Class cancelled!");
      return res;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cancel failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleUnregisterUserFromSession,
    handleUpdateSessionData,
    handleAddUserToSession,
    handleUpdateUserData,
    handleDeleteUser,
    handleCreateSession,
    handleDeleteSession,
    handleCancelSession,
    loading,
  };
};

export default useAdminHandler;
