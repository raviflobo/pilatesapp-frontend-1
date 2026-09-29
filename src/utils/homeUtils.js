export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const addComponentToDate = (date, compName, newVal) => {
  const splitedDate = date.split("-");
  if (compName === "day") {
    splitedDate[2] = newVal;
  } else if (compName === "month") {
    splitedDate[1] = newVal;
  } else if (compName === "year") {
    splitedDate[0] = newVal;
  } else return date;
  return splitedDate.join("-");
};

export const getDayName = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  } catch {
    return "";
  }
};
