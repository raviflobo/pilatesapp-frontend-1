import React, { useState } from "react";
import { useAuthContext } from "../../context/authContext";
import { FiUser, FiLock, FiMail, FiCalendar, FiSmile } from "react-icons/fi";
import { useErrorContext } from "../../context/errorContext";
import { toast } from "react-toastify";
import { validateRegister } from "../../utils/registerUtils";

const RegisterForm = () => {
  const { register } = useAuthContext();
  const { setError } = useErrorContext();

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    birthDate: today,
    gender: "female",
    fullName: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async () => {
    try {
      const { username, password, email, birthDate, gender, fullName } =
        formData;
      validateRegister(
        username,
        password,
        formData.confirmPassword,
        email,
        birthDate,
        gender,
        fullName
      );
      const newUser = {
        username,
        password,
        email,
        birthDate,
        gender,
        fullName,
      };
      await register(newUser);
      toast.success("Registration completed successfully!");
    } catch (error) {
      setError(error);
    }
  };

  return (
    <>
      <div style={styles.inputWrapper}>
        <FiUser style={styles.icon} />
        <input
          style={styles.input}
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div style={styles.inputWrapper}>
        <FiLock style={styles.icon} />
        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div style={styles.inputWrapper}>
        <FiLock style={styles.icon} />
        <input
          style={styles.input}
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <div style={styles.inputWrapper}>
        <FiSmile style={styles.icon} />
        <input
          style={styles.input}
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>

      <div style={styles.inputWrapper}>
        <FiMail style={styles.icon} />
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div style={styles.inputWrapper}>
        <FiCalendar style={styles.icon} />
        <input
          style={{
            ...styles.input,
            color: formData.birthDate === today ? "#888" : "#333",
          }}
          type="date"
          name="birthDate"
          value={formData.birthDate === today ? "" : formData.birthDate}
          onChange={handleChange}
          onFocus={(e) => e.target.showPicker && e.target.showPicker()}
        />
        {formData.birthDate === today && (
          <div style={styles.datePlaceholder}>Date of Birth</div>
        )}
      </div>

      <div style={styles.selectWrapper}>
        <select
          style={styles.select}
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <div style={styles.selectArrow}>▼</div>
      </div>

      <button style={styles.button} onClick={handleRegister}>
        Sign Up
      </button>
    </>
  );
};

const styles = {
  inputWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    border: "1px solid #d0d7de",
    borderRadius: "8px",
    direction: "ltr",
  },
  icon: {
    padding: "10px",
    fontSize: "20px",
    color: "#7d8ca3",
    flexShrink: 0,
  },
  datePlaceholder: {
    position: "absolute",
    left: "50px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    pointerEvents: "none",
    fontSize: "16px",
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    backgroundColor: "transparent",
    textAlign: "left",
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    height: "30px",
    overflow: "hidden",
  },
  selectWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "14px",
  },
  select: {
    width: "100%",
    padding: "12px",
    paddingLeft: "14px",
    paddingRight: "36px",
    borderRadius: "8px",
    border: "1px solid #d0d7de",
    fontSize: "16px",
    backgroundColor: "#f9f9f9",
    color: "#333",
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    textAlign: "left",
  },
  selectArrow: {
    position: "absolute",
    top: "50%",
    right: "14px",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "18px",
    color: "#7d8ca3",
  },
  button: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#f4b183",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    transition: "background-color 0.3s ease",
  },
};

export default RegisterForm;
