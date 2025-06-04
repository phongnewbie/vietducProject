import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://student-info-be.onrender.com/api";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [savedNotifications, setSavedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNotifications = async (typeFilter = "", departmentFilter = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        return;
      }

      let url = `${API_URL}/notifications`;
      const params = [];

      if (typeFilter) params.push(`type=${typeFilter}`);
      if (departmentFilter) params.push(`department=${departmentFilter}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let notificationsData = [];
      if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        notificationsData = response.data.data;
      } else if (
        response.data?.notifications &&
        Array.isArray(response.data.notifications)
      ) {
        notificationsData = response.data.notifications;
      }

      notificationsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      handleError(err);
    }
  };

  const fetchSavedNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        return;
      }

      const response = await axios.get(`${API_URL}/notifications/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let savedData = [];
      if (response.data && response.data.status === true) {
        if (Array.isArray(response.data.data)) {
          savedData = response.data.data;
        } else if (
          response.data.savedNotifications &&
          Array.isArray(response.data.savedNotifications)
        ) {
          savedData = response.data.savedNotifications;
        } else if (
          response.data.notifications &&
          Array.isArray(response.data.notifications)
        ) {
          savedData = response.data.notifications;
        }
      }

      savedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSavedNotifications(savedData);
    } catch (err) {
      console.error("Error fetching saved notifications:", err);
      handleError(err);
    }
  };

  const handleSaveNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        return;
      }

      const response = await axios.put(
        `${API_URL}/notifications/${id}/save`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === true) {
        setSuccess("Đã lưu thông báo!");
        setTimeout(() => setSuccess(""), 2000);

        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === id
              ? { ...notification, isSaved: true }
              : notification
          )
        );

        const savedNotification = notifications.find((n) => n._id === id);
        if (savedNotification) {
          setSavedNotifications((prev) => {
            const exists = prev.some((n) => n._id === id);
            if (!exists) {
              return [...prev, { ...savedNotification, isSaved: true }];
            }
            return prev;
          });
        }

        await fetchSavedNotifications();
      } else {
        setError(response.data.message || "Không thể lưu thông báo");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error("Error saving notification:", err);
      handleError(err);
    }
  };

  const handleUnsaveNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        return;
      }

      const response = await axios.put(
        `${API_URL}/notifications/${id}/unsave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === true) {
        setSuccess("Đã bỏ lưu thông báo!");
        setTimeout(() => setSuccess(""), 2000);

        await Promise.all([fetchNotifications(), fetchSavedNotifications()]);

        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === id
              ? { ...notification, isSaved: false }
              : notification
          )
        );
      } else {
        setError(response.data.message || "Không thể bỏ lưu thông báo");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error("Error unsaving notification:", err);
      handleError(err);
    }
  };

  const handleError = (err) => {
    if (err.response?.status === 401) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 3000);
    } else {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
      setTimeout(() => setError(""), 3000);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSavedNotifications();
  }, []);

  return {
    notifications,
    savedNotifications,
    loading,
    error,
    success,
    fetchNotifications,
    fetchSavedNotifications,
    handleSaveNotification,
    handleUnsaveNotification,
  };
};
