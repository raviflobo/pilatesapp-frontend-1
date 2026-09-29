export const validateLogin = (username, password) => {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }
};
