import React, { useEffect, useState } from "react";
import AllUsersTable from "./AllUsersTable";
import { fetchFilteredUsers } from "../../services/userService";
import { useErrorContext } from "../../context/errorContext";
import UserFilterSection from "./UserFilterSection";
import Pagination from "../SharedComponents/Pagination";

const UsersSection = ({ users }) => {
  const { setError } = useErrorContext();

  const [allUsers, setAllUsers] = useState(users?.users || []);
  const [totalPages, setTotalPages] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("role");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSortFieldChange = (e) => setSortField(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchData = async () => {
        try {
          const data = await fetchFilteredUsers(
            currentPage,
            10,
            search,
            sortField,
            sortOrder
          );
          setAllUsers(data.users || []);
          setTotalPages(data.totalPages || 1);
        } catch (e) {
          setError(e);
        }
      };
      fetchData();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, sortField, sortOrder, currentPage, setError]);

  return (
    <div
      style={{
        direction: "ltr",
        fontFamily: '"M PLUS Rounded 1c", sans-serif',
      }}
    >
      <UserFilterSection
        search={search}
        handleSearchChange={handleSearchChange}
        sortField={sortField}
        handleSortFieldChange={handleSortFieldChange}
        sortOrder={sortOrder}
        handleSortOrderChange={handleSortOrderChange}
      />

      <div style={{ width: "100%", height: "auto" }}>
        <AllUsersTable users={allUsers} setUsers={setAllUsers} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default UsersSection;
