import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import "../styles/theme.css";

const MainPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Add useEffect to handle dark mode persistence
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setIsDarkMode(JSON.parse(savedMode));
    }
  }, []);

  // Add useEffect to update dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // ... rest of your existing code ...

  return (
    <div className={`main-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="header">
        <h1>Student Information System</h1>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <i className={`fas fa-${isDarkMode ? "sun" : "moon"}`}></i>
            {isDarkMode ? " Light Mode" : " Dark Mode"}
          </button>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
      {/* ... rest of your existing JSX ... */}
    </div>
  );
};

export default MainPage;
