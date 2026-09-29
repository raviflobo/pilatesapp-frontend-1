import { useState, useEffect } from "react";
import { fetchAllUsers } from "../../services/userService";
import { useErrorContext } from "../../context/errorContext";

const useAllUsersFromDB = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useErrorContext();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAllUsers();
        // API returns { users: [], total, page, totalPages } or just array
        setAllUsers(Array.isArray(res) ? res : (res?.users || []));

      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { allUsers, setAllUsers, loading };
};

export default useAllUsersFromDB;
