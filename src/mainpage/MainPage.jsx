import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserProfile from "../components/UserProfile";
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [departments, setDepartments] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [openedNotificationId, setOpenedNotificationId] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventDepartmentFilter, setEventDepartmentFilter] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserName(user.name);
      setUserRole(user.role);
      if (user.role === "admin") {
        navigate("/AdminPage");
        return;
      }
    } else {
      navigate("/login");
      return;
    }
    fetchNotifications();
    fetchChatHistory();
    fetchDepartments();
    fetchScholarships();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "https://student-info-be.onrender.com/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        const unread = response.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } else if (response.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/chat/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChatHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setChatHistory([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "https://student-info-be.onrender.com/api/events";
      if (eventDepartmentFilter) {
        url += `?department=${eventDepartmentFilter}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/departments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchScholarships = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/scholarships",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Scholarships response:", response.data);
      if (response.data && response.data.scholarships) {
        setScholarships(response.data.scholarships);
      } else if (Array.isArray(response.data)) {
        setScholarships(response.data);
      } else {
        setScholarships([]);
      }
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setScholarships([]);
    }
  };

  const handleSaveNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://student-info-be.onrender.com/api/notifications/${id}/save`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchNotifications();
    } catch (err) {
      console.error("Error saving notification:", err);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(
        `https://student-info-be.onrender.com/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
    setOpenedNotificationId((prevId) =>
      prevId === notificationId ? null : notificationId
    );
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://student-info-be.onrender.com/api/chat/ask",
        { question: newQuestion },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewQuestion("");
      await fetchChatHistory();
    } catch (err) {
      console.error("Error sending question:", err);
    }
  };

  const handleRateChat = async (id, rating) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://student-info-be.onrender.com/api/chat/rate",
        { chatId: id, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchChatHistory();
    } catch (err) {
      console.error("Error rating chat:", err);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://student-info-be.onrender.com/api/chat/session/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchChatHistory();
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderNotifications = () => (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Thông báo</h3>
        <button onClick={() => setShowNotifications(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <div
                className={`notification-item ${
                  !notification.isRead ? "unread" : ""
                }`}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className="notification-content">
                  <div className="notification-header-info">
                    <h4>{notification.title}</h4>
                    <span className={`notification-type ${notification.type}`}>
                      {notification.type === "general"
                        ? "Thông báo chung"
                        : notification.type === "scholarship"
                        ? "Học bổng"
                        : "Sự kiện"}
                    </span>
                  </div>
                  <p className="notification-short-content">
                    {notification.content.slice(0, 60)}
                    {notification.content.length > 60 ? "..." : ""}
                  </p>
                  {notification.department && (
                    <span className="notification-department">
                      <i className="fas fa-building"></i>{" "}
                      {notification.department.name}
                    </span>
                  )}
                  <span className="notification-time">
                    <i className="fas fa-clock"></i>{" "}
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {openedNotificationId === notification._id && (
                <div className="notification-detail-box">
                  <div className="notification-detail-header">
                    <strong>{notification.title}</strong>
                    <button
                      className="close-detail-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenedNotificationId(null);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="notification-detail-content">
                    {notification.content}
                  </div>
                  {notification.department && (
                    <div className="notification-detail-department">
                      <i className="fas fa-building"></i>{" "}
                      {notification.department.name}
                    </div>
                  )}
                  <div className="notification-detail-time">
                    <i className="fas fa-clock"></i>{" "}
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="no-notifications">Không có thông báo mới</div>
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="chat-section">
      <div className="chat-history">
        {chatHistory.map((chat) => (
          <div key={chat._id} className="chat-card">
            <p>
              <strong>Ngày:</strong> {new Date(chat.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Câu hỏi:</strong> {chat.question}
            </p>
            <p>
              <strong>Trả lời:</strong> {chat.answer}
            </p>
            <div className="chat-actions">
              <button onClick={() => handleRateChat(chat._id, 5)}>
                <i className="fas fa-star"></i> Đánh giá
              </button>
              <button onClick={() => handleDeleteChat(chat._id)}>
                <i className="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendQuestion} className="chat-input">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
        />
        <button type="submit">
          <i className="fas fa-paper-plane"></i> Gửi
        </button>
      </form>
    </div>
  );

  const renderDepartments = () => (
    <div className="departments-section">
      <h2>Danh sách ngành học</h2>
      <div className="departments-list">
        {departments && departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept._id} className="department-card">
              <h3>{dept.name}</h3>
              <p>
                <strong>Mã Ngành:</strong> {dept.name}
              </p>
              <p>
                <strong>Mô tả:</strong> {dept.description}
              </p>
            </div>
          ))
        ) : (
          <div className="no-data">Không có dữ liệu khoa</div>
        )}
      </div>
    </div>
  );

  const renderScholarships = () => (
    <div className="scholarships-section">
      <h2>Học bổng</h2>
      <div className="scholarships-list">
        {scholarships && scholarships.length > 0 ? (
          scholarships.map((scholarship) => (
            <div key={scholarship._id} className="scholarship-card">
              <h3>{scholarship.name}</h3>
              <p>
                <strong>Mô tả:</strong> {scholarship.description}
              </p>
              <p>
                <strong>Giá trị:</strong> {scholarship.amount}
              </p>
              <p>
                <strong>Hạn nộp:</strong>{" "}
                {new Date(scholarship.deadline).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="no-data">Không có dữ liệu học bổng</div>
        )}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="events-section">
      <div className="section-header">
        <h2>Sự Kiện</h2>
      </div>

      <div className="event-filters">
        <select
          value={eventDepartmentFilter}
          onChange={(e) => setEventDepartmentFilter(e.target.value)}
        >
          <option value="">Tất cả ngành</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="submit-button" onClick={fetchEvents}>
          Lọc
        </button>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div>Không có sự kiện nào</div>
        ) : (
          events.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className="event-department">
                  {event.department ? (
                    <>
                      <i className="fas fa-building"></i>{" "}
                      {event.department.name}
                    </>
                  ) : (
                    <span className="event-general">Sự kiện chung</span>
                  )}
                </span>
              </div>
              <div className="event-content">
                <p>{event.description}</p>
                <div className="event-details">
                  <p>
                    <i className="fas fa-map-marker-alt"></i> {event.location}
                  </p>
                  <p>
                    <i className="fas fa-user"></i> {event.organizer}
                  </p>
                  <p>
                    <i className="fas fa-clock"></i>{" "}
                    {new Date(event.startDate).toLocaleString()} -{" "}
                    {new Date(event.endDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="main-container">
      <div className="header">
        <h1>Trang Chính</h1>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">
              {" "}
              Xin chào {userName || "Người dùng"}
            </span>
          </div>
          <div
            className="notifications-icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
            {showNotifications && renderNotifications()}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <i className="fas fa-user"></i> Thông Tin Cá Nhân
        </button>
        <button
          className={`tab-button ${
            activeTab === "departments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("departments")}
        >
          <i className="fas fa-building"></i> Khoa
        </button>
        <button
          className={`tab-button ${
            activeTab === "scholarships" ? "active" : ""
          }`}
          onClick={() => setActiveTab("scholarships")}
        >
          <i className="fas fa-graduation-cap"></i> Học Bổng
        </button>
        <button
          className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <i className="fas fa-comments"></i> Hỏi Đáp
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <i className="fas fa-calendar"></i> Sự Kiện
        </button>
      </div>

      <div className="tab-content">
        {error && <div className="error-message">{error}</div>}
        {activeTab === "profile" && <UserProfile />}
        {activeTab === "departments" && renderDepartments()}
        {activeTab === "scholarships" && renderScholarships()}
        {activeTab === "chat" && renderChat()}
        {activeTab === "events" && renderEvents()}
      </div>
    </div>
  );
};

export default MainPage;
