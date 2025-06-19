import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/theme.css";
import Header from "../components/layout/Header";
import NotificationList from "../components/notifications/NotificationList";
import NotificationFilter from "../components/notifications/NotificationFilter";
import { notificationService } from "../services/notificationService";

const API_URL = "https://student-info-be.onrender.com/api";

const CoordinatorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications_all");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [savedNotifications, setSavedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === "notifications_all") {
      fetchNotifications();
    } else if (activeTab === "notifications_saved") {
      fetchSavedNotifications();
    } else if (activeTab === "events") {
      fetchNotifications("event");
    } else if (activeTab === "scholarships") {
      fetchNotifications("scholarship");
    } else if (activeTab === "dataset") {
      fetchNotifications("dataset");
    }
  }, [activeTab, filterType, filterDepartment]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      userData &&
      (userData.role === "admin" || userData.role === "coordinator")
    ) {
      setUser(userData);
      setUserRole(userData.role);
    } else {
      setError(
        "Không có quyền truy cập, chỉ Admin và Coordinator mới có quyền"
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/departments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Không thể tải danh sách khoa");
      setDepartments([]);
    }
  };

  const fetchNotifications = async (
    type = filterType,
    department = filterDepartment
  ) => {
    try {
      setLoading(true);
      const data = await notificationService.fetchNotifications(
        type,
        department
      );
      setNotifications(data);
      setError(null);
    } catch (error) {
      setError("Không thể tải danh sách thông báo");
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedNotifications = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds delay between retries

    const tryFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationService.fetchSavedNotifications();
        if (Array.isArray(data)) {
          setSavedNotifications(data);
          return true;
        }
        console.error("Invalid data format received:", data);
        return false;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        return false;
      } finally {
        setLoading(false);
      }
    };

    while (retryCount < maxRetries) {
      const success = await tryFetch();
      if (success) {
        return;
      }
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(
          `Retrying in ${retryDelay / 1000} seconds... (Attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    // If all retries failed
    setError("Không thể tải danh sách thông báo đã lưu. Vui lòng thử lại sau.");
    setSavedNotifications([]);
  };

  const handleSaveNotification = async (notificationId) => {
    try {
      setError(null);
      await notificationService.saveNotification(notificationId);
      setSuccessMessage("Đã lưu thông báo thành công");

      // Update notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isSaved: true }
            : notification
        )
      );

      // Add to saved notifications if not already present
      const notificationToSave = notifications.find(
        (n) => n._id === notificationId
      );
      if (
        notificationToSave &&
        !savedNotifications.some((n) => n._id === notificationId)
      ) {
        setSavedNotifications((prev) => [
          ...prev,
          { ...notificationToSave, isSaved: true },
        ]);
      }

      // Fetch saved notifications to ensure consistency
      await fetchSavedNotifications();
    } catch (error) {
      console.error("Error saving notification:", error);
      setError("Không thể lưu thông báo. Vui lòng thử lại sau.");
    }
  };

  const handleUnsaveNotification = async (notificationId) => {
    try {
      await notificationService.unsaveNotification(notificationId);
      setSuccessMessage("Đã bỏ lưu thông báo thành công");

      // Update notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isSaved: false }
            : notification
        )
      );

      // Remove from saved notifications
      setSavedNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      setError("Không thể bỏ lưu thông báo");
      console.error("Error unsaving notification:", error);
    }
  };

  const handleEditNotification = async (notification) => {
    try {
      // Navigate to edit page with notification data
      navigate(`/edit-notification/${notification._id}`, {
        state: {
          notification: {
            ...notification,
            type: notification.type || "event", // Default to event if type is not set
            department: notification.department || "",
            title: notification.title || "",
            content: notification.content || "",
            startDate: notification.startDate || "",
            endDate: notification.endDate || "",
            location: notification.location || "",
            contact: notification.contact || "",
            requirements: notification.requirements || "",
            benefits: notification.benefits || "",
            applicationProcess: notification.applicationProcess || "",
            deadline: notification.deadline || "",
            datasetUrl: notification.datasetUrl || "",
            datasetDescription: notification.datasetDescription || "",
          },
        },
      });
    } catch (error) {
      setError("Không thể chỉnh sửa thông báo");
      console.error("Error editing notification:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setSuccessMessage("Đã xóa thông báo thành công");

      // Update notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );

      // Remove from saved notifications if present
      setSavedNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      setError("Không thể xóa thông báo");
      console.error("Error deleting notification:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    setFilterType(""); // Reset filter when changing tabs
    setFilterDepartment(""); // Reset department filter when changing tabs
  };

  const renderContent = () => {
    switch (activeTab) {
      case "notifications_all":
        return (
          <>
            <NotificationFilter
              filterType={filterType}
              setFilterType={setFilterType}
              filterDepartment={filterDepartment}
              setFilterDepartment={setFilterDepartment}
              departments={departments}
            />
            <NotificationList
              notifications={notifications}
              savedNotifications={savedNotifications}
              userRole={userRole}
              onEdit={handleEditNotification}
              onDelete={handleDeleteNotification}
              onSave={handleSaveNotification}
              onUnsave={handleUnsaveNotification}
            />
          </>
        );
      case "notifications_saved":
        return (
          <NotificationList
            notifications={savedNotifications}
            savedNotifications={savedNotifications}
            userRole={userRole}
            onEdit={handleEditNotification}
            onDelete={handleDeleteNotification}
            onSave={handleSaveNotification}
            onUnsave={handleUnsaveNotification}
          />
        );
      case "events":
      case "scholarships":
      case "dataset":
        return (
          <>
            <NotificationFilter
              filterType={filterType}
              setFilterType={setFilterType}
              filterDepartment={filterDepartment}
              setFilterDepartment={setFilterDepartment}
              departments={departments}
            />
            <NotificationList
              notifications={notifications}
              savedNotifications={savedNotifications}
              userRole={userRole}
              onEdit={handleEditNotification}
              onDelete={handleDeleteNotification}
              onSave={handleSaveNotification}
              onUnsave={handleUnsaveNotification}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`coordinator-page ${isDarkMode ? "dark-mode" : ""}`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onTabChange={handleTabChange}
      />

      <div className="coordinator-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {renderContent()}
        {loading && <div className="loading">Đang tải...</div>}
      </div>
    </div>
  );
};

export default CoordinatorPage;
