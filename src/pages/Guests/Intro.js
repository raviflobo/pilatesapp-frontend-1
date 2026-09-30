import "./styles/layout.css";
import "./styles/navbar.css";
import "./styles/hero.css";
import "./styles/aboutMeSection.css";
import "./styles/contactMeSection.css";
import "./styles/responsive2Phone.css";
import "./styles/myClassesSection.css";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllSessionsForYear } from "../../services/sessionService";
import { formatDate } from "../../utils/homeUtils";
import { toast } from "react-toastify";

const formatToYMD = (d) => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Intro = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => formatToYMD(new Date()));
  const [scheduleSessions, setScheduleSessions] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Generate 7-day strip from today
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const ymd = formatToYMD(d);
    const dayOfWeek = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    return { ymd, dayOfWeek, dayNumber, monthName };
  });

  useEffect(() => {
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const data = await fetchAllSessionsForYear(selectedDate);
        setScheduleSessions(data || []);
      } catch (err) {
        console.error("Failed to load public schedule", err);
      } finally {
        setLoadingSchedule(false);
      }
    };
    loadSchedule();
  }, [selectedDate]);

  const filteredSessions = scheduleSessions.filter(
    (s) => s.date?.split("T")[0] === selectedDate && s.status === "Planned"
  );

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBookClick = () => {
    toast.info("Please log in or register to book your spot!");
    navigate("/intro/auth");
  };

  const handleStartTrial = () => {
    toast.info("Get 3 classes in 3 days! Log in to activate your trial pass.");
    navigate("/intro/auth");
  };

  return (
    <div className="intro-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-buttons">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button onClick={() => scrollToSection("schedule")}>7-Day Schedule</button>
          <button onClick={() => scrollToSection("trial")}>3-Day Trial</button>
          <button onClick={() => scrollToSection("about")}>About Me</button>
          <button onClick={() => scrollToSection("classes")}>Class Types</button>
          <button onClick={() => scrollToSection("contact")}>Contact</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="section">
        <div className="hero">
          <div className="hero-logo">
            <img
              src="/RotemLogo.png"
              alt="Rotem Logo"
              className="hero-logo-img"
            />
          </div>
          <h1>Rotem Pilates Studio</h1>
          <p style={{ color: "#475569", fontSize: "1.1rem", margin: "10px 0 20px 0" }}>
            Mindful movement, Reformer & Mat Pilates, core stability & rejuvenation
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="get-started-btn" onClick={() => navigate("/intro/auth")}>
              MEMBER LOGIN
            </button>
            <button
              onClick={() => scrollToSection("schedule")}
              style={{
                backgroundColor: "#0288D1",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              BROWSE SCHEDULE
            </button>
          </div>
        </div>
      </section>

      {/* 3-Day Trial Banner Section */}
      <section id="trial" style={styles.trialSection}>
        <div style={styles.trialCard}>
          <div style={{ flex: 1 }}>
            <span style={styles.trialBadge}>NEW VISITOR OFFER</span>
            <h2 style={{ margin: "8px 0 6px 0", color: "#0F172A", fontSize: "1.8rem" }}>
              3-Day Studio Trial Pass (3 Classes)
            </h2>
            <p style={{ color: "#475569", margin: "0 0 12px 0", fontSize: "0.95rem" }}>
              Experience Reformer, Mat, and Tower Pilates. Book up to 3 group classes within 3 days. One trial per member.
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "#059669" }}>₹499</span>
              <span style={{ color: "#64748B", fontSize: "0.85rem", textDecoration: "line-through" }}>₹1,500</span>
              <span style={{ color: "#059669", fontSize: "0.85rem", fontWeight: "600" }}>(Special Intro Price)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartTrial}
            style={styles.startTrialBtn}
          >
            Start 3-Day Trial
          </button>
        </div>
      </section>

      {/* Live 7-Day Class Schedule (Guest View) */}
      <section id="schedule" style={styles.scheduleSection}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ color: "#0288D1", fontWeight: "700", fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase" }}>
              Studio Schedule (6:00 AM – 9:00 PM)
            </span>
            <h2 style={{ margin: "6px 0 8px 0", fontSize: "2rem", color: "#0F172A" }}>
              Live 7-Day Class Schedule
            </h2>
            <p style={{ color: "#64748B", fontSize: "0.95rem" }}>
              Guests can browse all upcoming classes and trainer bios without logging in.
            </p>
          </div>

          {/* 7-Day Pill Strip */}
          <div style={styles.pillStrip}>
            {next7Days.map((item) => {
              const isSelected = selectedDate === item.ymd;
              return (
                <button
                  key={item.ymd}
                  type="button"
                  onClick={() => setSelectedDate(item.ymd)}
                  style={{
                    ...styles.pillBtn,
                    backgroundColor: isSelected ? "#0288D1" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#334155",
                    borderColor: isSelected ? "#0288D1" : "#CBD5E1",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", opacity: isSelected ? 0.9 : 0.7 }}>
                    {item.dayOfWeek}
                  </span>
                  <span style={{ fontSize: "1.2rem", fontWeight: "800" }}>
                    {item.dayNumber}
                  </span>
                  <span style={{ fontSize: "0.7rem", opacity: isSelected ? 0.9 : 0.7 }}>
                    {item.monthName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Classes for selected day */}
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {loadingSchedule ? (
              <p style={{ textAlign: "center", color: "#64748B", padding: "40px" }}>
                Loading live schedule...
              </p>
            ) : filteredSessions.length > 0 ? (
              filteredSessions.map((ses) => {
                const spotsLeft = Math.max(0, (ses.maxParticipants || 10) - (ses.participants?.length || 0));
                const isFull = spotsLeft <= 0;
                return (
                  <div key={ses._id} style={styles.classCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={styles.levelBadge}>{ses.difficulty || "All Levels"}</span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: isFull ? "#DC2626" : "#059669",
                              backgroundColor: isFull ? "#FEE2E2" : "#ECFDF5",
                              padding: "2px 8px",
                              borderRadius: "999px",
                            }}
                          >
                            {isFull ? "Class Full" : `${spotsLeft} spots left`}
                          </span>
                        </div>
                        <h3 style={{ margin: "8px 0 4px 0", fontSize: "1.25rem", color: "#0F172A" }}>
                          {ses.type}
                        </h3>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
                          🗓 {formatDate(ses.date)} &bull; ⏰ {ses.time} ({ses.duration || 55} mins)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleBookClick}
                        style={{
                          backgroundColor: isFull ? "#F59E0B" : "#0288D1",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "10px 18px",
                          borderRadius: "10px",
                          fontWeight: "700",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                        }}
                      >
                        {isFull ? "Join Waiting List" : "Book Class"}
                      </button>
                    </div>

                    <div style={styles.trainerRow}>
                      <span style={{ color: "#64748B" }}>Trainer:</span>{" "}
                      <strong>{ses.trainer?.name || "Rotem"}</strong> &bull;{" "}
                      <span style={{ color: "#64748B" }}>{ses.trainer?.bio || "Classical Pilates Master"}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "40px 16px", backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
                <p style={{ color: "#0F172A", fontWeight: "700", fontSize: "1.1rem" }}>
                  No classes scheduled for this date yet
                </p>
                <p style={{ color: "#64748B", fontSize: "0.9rem" }}>
                  Please pick another day from the 7-day schedule strip above.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="aboutme-section">
        <div className="aboutme-block left">
          <div className="bubble">
            <img src="/aboutme1.png" alt="Rotem 1" />
          </div>
          <div className="bubble-text">
            I'm Rotem, a certified instructor in Pilates, Yoga, Meditation, and Healing.
            I lead mindfulness practices, guide meditations, and teach private as well
            as group sessions. My passion lies in conscious movement and holistic wellness.
          </div>
        </div>

        <div className="aboutme-block right">
          <div className="bubble">
            <img src="/aboutme2.jpg" alt="Rotem 2" />
          </div>
          <div className="bubble-text">
            Movement is a universal language connecting mind and body.
            I integrate intentional techniques that inspire everyone to strengthen,
            recharge, and cultivate presence from within.
          </div>
        </div>
      </section>

      {/* Class Types Section */}
      <section id="classes" className="my-classes-section">
        <div className="classes-overlay">
          <h2>Studio Class Types</h2>
          <div className="classes-grid">
            <div className="class-card" style={{ backgroundImage: "url('/pilat.jpg')" }}>
              Reformer Pilates
            </div>
            <div className="class-card" style={{ backgroundImage: "url('/yogapic.jpg')" }}>
              Mat Pilates
            </div>
            <div className="class-card" style={{ backgroundImage: "url('/medicatepic.jpg')" }}>
              Tower & Equipment
            </div>
            <div className="class-card" style={{ backgroundImage: "url('/mindfoolnes.jpg')" }}>
              Core & Flexibility
            </div>
            <div className="class-card" style={{ backgroundImage: "url('/groupPrac.jpg')" }}>
              Strength Alignment
            </div>
            <div className="class-card" style={{ backgroundImage: "url('/classesyog.jpg')" }}>
              Deep Recovery
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-content">
        <div className="contact-text">
          <h2>Contact The Studio</h2>
          <p>Phone: 050-123-4567</p>
          <p>Address: Tel Aviv, Main Street 42</p>

          <div style={{ marginTop: "14px", fontSize: "0.85rem", color: "#64748B" }}>
            <span style={{ cursor: "pointer", textDecoration: "underline", marginRight: "12px" }}>
              Privacy Policy
            </span>
            <span style={{ cursor: "pointer", textDecoration: "underline" }}>
              Terms & Conditions
            </span>
          </div>
        </div>

        <div className="contact-image">
          <img
            src="/contactme.jpg"
            alt="Contact Me"
            className="background-img"
          />
          <img src="/YogaLogo2.png" alt="Logo" className="corner-logo" />
        </div>
      </section>
    </div>
  );
};

const styles = {
  trialSection: {
    padding: "30px 16px",
    backgroundColor: "#F0FDF4",
    direction: "ltr",
  },
  trialCard: {
    maxWidth: "960px",
    margin: "0 auto",
    backgroundColor: "#FFFFFF",
    borderRadius: "18px",
    padding: "24px 30px",
    border: "2px solid #86EFAC",
    boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  trialBadge: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    fontSize: "0.75rem",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "999px",
    letterSpacing: "0.5px",
  },
  startTrialBtn: {
    backgroundColor: "#059669",
    color: "#FFFFFF",
    padding: "14px 28px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "700",
    fontSize: "1.05rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
    transition: "background 0.2s ease",
  },
  scheduleSection: {
    padding: "50px 0",
    backgroundColor: "#F8FAFC",
    direction: "ltr",
  },
  pillStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    overflowX: "auto",
  },
  pillBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 4px",
    borderRadius: "14px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  classCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  levelBadge: {
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "999px",
    textTransform: "uppercase",
  },
  trainerRow: {
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid #F1F5F9",
    fontSize: "0.85rem",
    color: "#334155",
  },
};

export default Intro;
