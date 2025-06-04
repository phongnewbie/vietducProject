import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onTabChange,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-header">
      <h1>Quản Lý Hệ Thống</h1>
      <div className="admin-tabs">
        <button
          className={`tab-button ${
            activeTab === "notifications_all" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("notifications_all");
            onTabChange("notifications_all");
          }}
        >
          Tất cả thông báo
        </button>
        <button
          className={`tab-button ${
            activeTab === "notifications_saved" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("notifications_saved");
            onTabChange("notifications_saved");
          }}
        >
          Thông báo đã lưu
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("events");
            onTabChange("events");
          }}
        >
          Sự Kiện
        </button>
        <button
          className={`tab-button ${
            activeTab === "scholarships" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("scholarships");
            onTabChange("scholarships");
          }}
        >
          Học Bổng
        </button>
        <button
          className={`tab-button ${activeTab === "dataset" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("dataset");
            onTabChange("dataset");
          }}
        >
          Dataset
        </button>
      </div>
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          <i className={`fas fa-${isDarkMode ? "sun" : "moon"}`}></i>
          {isDarkMode ? " Light Mode" : " Dark Mode"}
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Header;
