import React, { useState } from "react";
import { addComponentToDate, getDayName } from "../../../utils/homeUtils";

const days = Array.from({ length: 31 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const years = ["2025", "2026", "2027"];

const formatToYMD = (d) => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SelectDate = ({ selectedDate, setSelectedDate }) => {
  const [showDropdowns, setShowDropdowns] = useState(false);

  // Generate 7-day strip from today
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const ymd = formatToYMD(d);
    const dayOfWeek = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    return { ymd, dayOfWeek, dayNumber, monthName, isToday: i === 0 };
  });

  const handleChange = (component) => (e) => {
    setSelectedDate(
      addComponentToDate(selectedDate, component, e.target.value)
    );
  };

  const showDayName =
    selectedDate.split("-").filter((v) => v).length === 3
      ? getDayName(selectedDate)
      : "";

  return (
    <div style={{ direction: "ltr", width: "100%", marginBottom: "16px" }}>
      {/* 7-Day Interactive Strip */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#546E7A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Select Class Day (Next 7 Days)
          </span>
          <button
            type="button"
            onClick={() => setShowDropdowns((prev) => !prev)}
            style={{
              background: "none",
              border: "none",
              color: "#0288D1",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: "6px",
            }}
          >
            {showDropdowns ? "Hide Custom Picker" : "📅 Custom Date"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
            overflowX: "auto",
            padding: "4px 2px",
          }}
        >
          {next7Days.map((item) => {
            const isSelected = selectedDate === item.ymd;
            return (
              <button
                key={item.ymd}
                type="button"
                onClick={() => setSelectedDate(item.ymd)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 4px",
                  borderRadius: "14px",
                  border: isSelected ? "2px solid #0288D1" : "1px solid #E0E0E0",
                  backgroundColor: isSelected ? "#0288D1" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#37474F",
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(2, 136, 209, 0.25)"
                    : "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: isSelected ? "700" : "600",
                    textTransform: "uppercase",
                    color: isSelected ? "#E1F5FE" : "#78909C",
                    marginBottom: "2px",
                  }}
                >
                  {item.dayOfWeek}
                </span>
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "700",
                    lineHeight: 1.1,
                  }}
                >
                  {item.dayNumber}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: isSelected ? "#E1F5FE" : "#90A4AE",
                    marginTop: "2px",
                  }}
                >
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Custom Date Dropdowns */}
      {showDropdowns && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#F9FAFB",
            borderRadius: "12px",
            border: "1px dashed #B0BEC5",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            {/* Month */}
            <div style={containerStyle}>
              <label style={labelStyle}>Month</label>
              <select
                value={selectedDate.split("-")[1]}
                onChange={handleChange("month")}
                style={selectStyle}
              >
                <option value="">--</option>
                {months.map((month, i) => (
                  <option key={month} value={month}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div style={containerStyle}>
              <label style={labelStyle}>Day</label>
              <select
                value={selectedDate.split("-")[2]}
                onChange={handleChange("day")}
                style={selectStyle}
              >
                <option value="">--</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div style={containerStyle}>
              <label style={labelStyle}>Year</label>
              <select
                value={selectedDate.split("-")[0]}
                onChange={handleChange("year")}
                style={selectStyle}
              >
                <option value="">--</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Display selected date text */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 8px",
          backgroundColor: "#F1F5F9",
          borderRadius: "8px",
          fontSize: "0.85rem",
          color: "#455A64",
          marginTop: "6px",
        }}
      >
        <span>
          Selected: <strong>{selectedDate}</strong> {showDayName && `(${showDayName})`}
        </span>
        <span style={{ fontSize: "0.8rem", color: "#0288D1", fontWeight: "600" }}>
          Schedule: 6:00 AM - 9:00 PM
        </span>
      </div>
    </div>
  );
};

const containerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
};

const labelStyle = {
  fontSize: "0.75rem",
  color: "#6B6B6B",
  fontWeight: "500",
};

const selectStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #D0EAF5",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  color: "#2E2E2E",
  fontSize: "0.9rem",
  fontWeight: "500",
  outline: "none",
  cursor: "pointer",
  textAlign: "center",
  textAlignLast: "center",
};

export default SelectDate;
