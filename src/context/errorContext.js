import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

const errorContext = createContext();

export const ErrorProvider = ({ children }) => {
  // State
  const [error, setErrorState] = useState(null);

  // Functions
  const setError = useCallback((error) => {
    setErrorState({ message: error.message, status: error.status || null });
  }, []);
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Toasting auto when new error comes in
  useEffect(() => {
    if (error) {
      toast.error(
        `Error${error.status ? " " + error.status : ""}: ${error.message}`
      );
      clearError();
    }
  }, [error]);

  return (
    <errorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </errorContext.Provider>
  );
};

export const useErrorContext = () => {
  const context = useContext(errorContext);
  if (!context) {
    throw new Error("useerrorContext must be used within a errorProvider");
  }
  return context;
};
