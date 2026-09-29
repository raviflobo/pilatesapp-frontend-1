export const validateRegister = (
  username,
  password,
  confirmPassword,
  email,
  birthDate,
  gender,
  fullName
) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fullNameRegex = /^[a-zA-Z\s\u0590-\u05FF]+$/;

  if (
    !username ||
    !password ||
    !confirmPassword ||
    !email ||
    !birthDate ||
    !gender ||
    !fullName
  ) {
    throw new Error("All fields are required");
  }

  if (!usernameRegex.test(username)) {
    throw new Error("Username must contain only English letters, numbers, and underscores");
  }

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  if (!fullNameRegex.test(fullName)) {
    throw new Error("Full name must contain only letters and spaces");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
};
