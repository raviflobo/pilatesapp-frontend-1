import React, { useEffect, useState } from "react";
import AllSessionsTable from "./AllSessionsTable";
import {
  fetchFilteredSessions,
  bulkCreateWeeklyClasses,
} from "../../services/sessionService";
import { useErrorContext } from "../../context/errorContext";
import SessionFilterSection from "./SessionFilterSection";
import Pagination from "../SharedComponents/Pagination";
import CreateSessionModal from "./CreateSessionModal";
import { FiPlus, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";

const SessionsSection = ({ sessions }) => {
  const { setError } = useErrorContext();
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);
  const [generatingBulk, setGeneratingBulk] = useState(false);

  const [allSessions, setAllSessions] = useState(sessions?.sessions || []);
  const [totalPages, setTotalPages] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSortFieldChange = (e) => setSortField(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);

  const reloadSessions = async () => {
    try {
      const data = await fetchFilteredSessions(
        currentPage,
        10,
        search,
        sortField,
        sortOrder
      );
      setAllSessions(data.sessions || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      reloadSessions();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, sortField, sortOrder, currentPage, setError]);

  const handleBulkGenerate = async () => {
    const confirmed = window.confirm(
      "Generate 7-day weekly class schedule (6:00 AM to 9:00 PM) with trainers and difficulty levels?"
    );
    if (!confirmed) return;

    setGeneratingBulk(true);
    try {
      const res = await bulkCreateWeeklyClasses();
      toast.success(
        res.message || "Successfully generated 7 days of classes!"
      );
      await reloadSessions();
    } catch (err) {
      setError(err);
    } finally {
      setGeneratingBulk(false);
    }
  };

  return (
    <div
      style={{
        direction: "ltr",
        fontFamily: '"M PLUS Rounded 1c", sans-serif',
      }}
    >
      <SessionFilterSection
        search={search}
        handleSearchChange={handleSearchChange}
        sortField={sortField}
        handleSortFieldChange={handleSortFieldChange}
        sortOrder={sortOrder}
        handleSortOrderChange={handleSortOrderChange}
      />

      <div style={{ width: "100%", height: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setIsCreateSessionModalOpen(true)}
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              fontSize: "0.95rem",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
            }}
          >
            <FiPlus size={18} />
            Create Single Session
          </button>

          <button
            onClick={handleBulkGenerate}
            disabled={generatingBulk}
            style={{
              backgroundColor: "#059669",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              fontSize: "0.95rem",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: generatingBulk ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)",
            }}
          >
            <FiCalendar size={18} />
            {generatingBulk ? "Generating Schedule..." : "Bulk Generate 7-Day Schedule"}
          </button>
        </div>

        <AllSessionsTable sessions={allSessions} setSessions={setAllSessions} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
        <CreateSessionModal
          isOpen={isCreateSessionModalOpen}
          onClose={() => {
            setIsCreateSessionModalOpen(false);
          }}
          setSessions={setAllSessions}
        />
      </div>
    </div>
  );
};

export default SessionsSection;
