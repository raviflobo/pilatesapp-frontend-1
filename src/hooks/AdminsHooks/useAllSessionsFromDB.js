import { useState, useEffect } from "react";
import { fetchAllSessions } from "../../services/sessionService.js";
import { useErrorContext } from "../../context/errorContext.js";

// ADMINS
const useAllSessionsFromDB = () => {
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useErrorContext();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAllSessions();
        // API returns { sessions: [], total, page, totalPages } or just array
        setAllSessions(Array.isArray(res) ? res : (res?.sessions || []));

      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { allSessions, setAllSessions, loading };
};

export default useAllSessionsFromDB;
