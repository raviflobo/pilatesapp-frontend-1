// src/utils/translateError.js
export const errorTranslations = {
  // --- AUTH ---
  "Invalid credentials": "Invalid username or password",
  "Username and password are required": "Username and password are required",
  "User not found": "User not found",
  "Not authenticated": "Please log in to continue",
  "Refresh token is blacklisted.": "Session expired, please log in again",
  "No access token, need to refresh.": "Access expired, refreshing session...",

  // NEW
  "Already logged out": "Already logged out",
  "No refresh token provided": "No refresh token provided",

  // --- USERS ---
  "All fields are required": "Please fill in all fields",
  "Invalid email format": "Invalid email format",
  "User already exists": "A user with this email already exists",
  "Invalid role value": "Invalid role value",
  "Invalid gender value": "Invalid gender value",

  // --- SESSIONS ---
  "Session not found": "Session not found",
  "Cannot register to a completed or cancelled session":
    "Cannot register to a completed or cancelled session",
  "Already registered to this session": "You are already registered to this session",
  "Session is full": "This session is full",
  "Invalid pagination parameters": "Invalid pagination parameters",
  "Cannot unregister from a completed or cancelled session":
    "Cannot unregister from a completed or cancelled session",
  "User is not registered to this session": "User is not registered to this session",
  "Session already cancelled": "Session already cancelled",
  "Invalid user ID": "Invalid user ID",
  "User already registered to this session": "User is already registered to this session",
  "Max participants must be greater than 0":
    "Max participants must be greater than 0",
  "Duration must be greater than 0": "Duration must be greater than 0",
  "Invalid status": "Invalid status",
  "Cannot create a session in the past": "Cannot create a session in the past",

  // NEW
  "Cannot update a cancelled or completed session":
    "Cannot update a cancelled or completed session",

  // --- By status ---
  400: "Invalid request",
  401: "Unauthorized action",
  403: "Access forbidden",
  404: "Resource not found",
  500: "Internal server error",

  // Default
  DEFAULT: "An error occurred, please try again later",
};

export const translateError = (error) => {
  if (!error?.response) {
    const customError = new Error(error.message || "An unexpected error occurred");
    customError.status = error.status || 500;
    return customError;
  }

  const message = error?.response?.data?.message;
  const status = error?.response?.status || 500;

  const translated =
    errorTranslations[message] ||
    message ||
    errorTranslations[status] ||
    errorTranslations.DEFAULT;

  const customError = new Error(translated);
  customError.status = status;

  return customError;
};
