import React from "react";
import { FiX } from "react-icons/fi";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <button style={modalStyles.closeBtn} onClick={onClose}>
          <FiX size={24} />
        </button>
        <div style={modalStyles.scrollable}>{children}</div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center", // Center of page
    zIndex: 1000,
    padding: "1.5rem",
    boxSizing: "border-box",
  },
  content: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: "#fff",
    borderRadius: "1rem",
    paddingTop: "3rem",
    paddingBottom: "1.5rem",
    paddingInline: "1.25rem",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    position: "relative",
    maxHeight: "85vh",
    overflow: "hidden",
  },
  scrollable: {
    overflowY: "auto",
    maxHeight: "calc(85vh - 3rem)",
    paddingBottom: "0.5rem",
  },
  closeBtn: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
  },
};

export default Modal;
