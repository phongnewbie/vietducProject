import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPage.css";
import "../styles/theme.css";
import { useNavigate } from "react-router-dom";

// Add these constants at the top of the file
const API_URL = "https://student-info-be.onrender.com/api";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [majors, setMajors] = useState([]);
  const [users, setUsers] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newMajor, setNewMajor] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [newDataset, setNewDataset] = useState({
    key: "",
    value: "",
    category: "",
    department: null,
  });
  const [editingMajor, setEditingMajor] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingDataset, setEditingDataset] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showDatasetEditModal, setShowDatasetEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userFormErrors, setUserFormErrors] = useState({});
  const [datasetFormErrors, setDatasetFormErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    type: "general",
    department: "",
    startDate: "",
    endDate: "",
    isImportant: false,
  });
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [editNotification, setEditNotification] = useState({});
  const [savedNotifications, setSavedNotifications] = useState([]);
  const [activeNotificationTab, setActiveNotificationTab] = useState("all");
  const [notificationTypeFilter, setNotificationTypeFilter] = useState("");
  const [notificationDepartmentFilter, setNotificationDepartmentFilter] =
    useState("");
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    organizer: "",
    department: "",
    startDate: "",
    endDate: "",
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [eventDepartmentFilter, setEventDepartmentFilter] = useState("");
  const [scholarships, setScholarships] = useState([]);
  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [editingScholarshipId, setEditingScholarshipId] = useState(null);
  const [editScholarship, setEditScholarship] = useState(null);
  const [scholarshipDepartmentFilter, setScholarshipDepartmentFilter] =
    useState("");
  const [newScholarship, setNewScholarship] = useState({
    title: "",
    description: "",
    requirements: "",
    value: "",
    applicationDeadline: "",
    provider: "",
    department: "",
    eligibility: "",
    applicationProcess: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [token] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Add these state variables with other state declarations
  const [scholarshipFormData, setScholarshipFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    value: "",
    applicationDeadline: "",
    provider: "",
    department: "",
    eligibility: "",
    applicationProcess: "",
  });

  const [editingScholarship, setEditingScholarship] = useState(null);

  const [notificationFormData, setNotificationFormData] = useState({
    title: "",
    content: "",
    type: "general",
    department: "",
    priority: "normal",
  });

  useEffect(() => {
    fetchNotifications();
  }, [notificationTypeFilter, notificationDepartmentFilter]);

  const fetchNotifications = async () => {
    try {
      let url = `${API_URL}/notifications`;
      const params = [];
      if (notificationTypeFilter) params.push(`type=${notificationTypeFilter}`);
      if (notificationDepartmentFilter)
        params.push(`department=${notificationDepartmentFilter}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setNotifications(response.data.data);
      } else {
        console.error("Invalid notifications data format:", response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách thông báo"
      );
      setNotifications([]);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://student-info-be.onrender.com/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const fetchSavedNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/notifications/saved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (Array.isArray(response.data)) {
        setSavedNotifications(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setSavedNotifications(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách thông báo đã lưu");
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
      setSuccess("Đã lưu thông báo!");
      setTimeout(() => setSuccess(""), 2000);
      await fetchNotifications();
      await fetchSavedNotifications();
    } catch (err) {
      setError("Không thể lưu thông báo");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleUnsaveNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://student-info-be.onrender.com/api/notifications/${id}/unsave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Đã bỏ lưu thông báo!");
      setTimeout(() => setSuccess(""), 2000);
      await fetchNotifications();
      await fetchSavedNotifications();
    } catch (err) {
      setError("Không thể bỏ lưu thông báo");
      setTimeout(() => setError(""), 2000);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      let url = "https://student-info-be.onrender.com/api/events/all";
      if (eventDepartmentFilter) {
        url += `?department=${eventDepartmentFilter}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setEvents(response.data.data);
      } else {
        setError("Không thể tải danh sách sự kiện");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(
          err.response?.data?.message || "Không thể tải danh sách sự kiện"
        );
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Validate required fields
      if (
        !newEvent.title ||
        !newEvent.description ||
        !newEvent.location ||
        !newEvent.organizer ||
        !newEvent.startDate ||
        !newEvent.endDate
      ) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Validate dates
      if (new Date(newEvent.startDate) >= new Date(newEvent.endDate)) {
        setError("Ngày kết thúc phải sau ngày bắt đầu");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const response = await axios.post(
        "https://student-info-be.onrender.com/api/events",
        newEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Tạo sự kiện thành công!");
        setTimeout(() => setSuccess(""), 3000);

        // Reset form and close it
        setNewEvent({
          title: "",
          description: "",
          location: "",
          organizer: "",
          department: "",
          startDate: "",
          endDate: "",
        });
        setShowEventForm(false);

        // Update events state immediately with the new event
        const newEventData = response.data.data;
        setEvents((prevEvents) => [...prevEvents, newEventData]);
      } else {
        setError(response.data?.message || "Không thể tạo sự kiện");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.message || "Không thể tạo sự kiện");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditEventClick = (event) => {
    setEditingEventId(event._id);
    setEditEvent({
      title: event.title,
      description: event.description,
      location: event.location,
      organizer: event.organizer,
      department: event.department ? event.department._id : "",
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
    });
  };

  const handleEditEventChange = (e) => {
    const { name, value } = e.target;
    setEditEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Validate required fields
      if (
        !editEvent.title ||
        !editEvent.description ||
        !editEvent.location ||
        !editEvent.organizer ||
        !editEvent.startDate ||
        !editEvent.endDate
      ) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Validate dates
      if (new Date(editEvent.startDate) >= new Date(editEvent.endDate)) {
        setError("Ngày kết thúc phải sau ngày bắt đầu");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const response = await axios.put(
        `https://student-info-be.onrender.com/api/events/${editingEventId}`,
        editEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Cập nhật sự kiện thành công!");
        setTimeout(() => setSuccess(""), 3000);

        // Update events state immediately with the updated event
        const updatedEventData = response.data.data;
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === editingEventId ? updatedEventData : event
          )
        );

        setEditingEventId(null);
        setEditEvent(null);
      } else {
        setError(response.data.message || "Không thể cập nhật sự kiện");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error updating event:", err);
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(err.response?.data?.message || "Không thể cập nhật sự kiện");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập lại");
          setTimeout(() => setError(""), 3000);
          return;
        }

        const response = await axios.delete(
          `https://student-info-be.onrender.com/api/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setSuccess("Xóa sự kiện thành công!");
          setTimeout(() => setSuccess(""), 3000);

          // Update events state immediately by removing the deleted event
          setEvents((prevEvents) =>
            prevEvents.filter((event) => event._id !== id)
          );
        } else {
          setError(response.data.message || "Không thể xóa sự kiện");
          setTimeout(() => setError(""), 3000);
        }
      } catch (err) {
        console.error("Error deleting event:", err);
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }, 3000);
        } else {
          setError(err.response?.data?.message || "Không thể xóa sự kiện");
          setTimeout(() => setError(""), 3000);
        }
      }
    }
  };

  const fetchScholarships = async () => {
    try {
      let url = `${API_URL}/scholarships`;
      if (scholarshipDepartmentFilter) {
        url += `?department=${scholarshipDepartmentFilter}`;
      }
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Scholarships API Response:", response.data); // Debug log

      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        setScholarships(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setScholarships(response.data.data);
      } else if (
        response.data &&
        response.data.scholarships &&
        Array.isArray(response.data.scholarships)
      ) {
        setScholarships(response.data.scholarships);
      } else {
        console.error("Invalid scholarships data format:", response.data);
        setScholarships([]);
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách học bổng"
      );
      setScholarships([]); // Set empty array on error
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const response = await axios.post(
        "https://student-info-be.onrender.com/api/scholarships",
        scholarshipFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Tạo học bổng thành công!");
        setTimeout(() => setSuccess(""), 3000);
        setScholarships((prevScholarships) => [
          ...prevScholarships,
          response.data.data,
        ]);
        setShowScholarshipForm(false);
        setScholarshipFormData({
          title: "",
          description: "",
          requirements: "",
          value: "",
          applicationDeadline: "",
          provider: "",
          department: "",
          eligibility: "",
          applicationProcess: "",
        });
      } else {
        setError(response.data.message || "Không thể tạo học bổng");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error creating scholarship:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(error.response?.data?.message || "Không thể tạo học bổng");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleUpdateScholarship = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const response = await axios.put(
        `https://student-info-be.onrender.com/api/scholarships/${editingScholarship._id}`,
        scholarshipFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Cập nhật học bổng thành công!");
        setTimeout(() => setSuccess(""), 3000);
        setScholarships((prevScholarships) =>
          prevScholarships.map((scholarship) =>
            scholarship._id === editingScholarship._id
              ? response.data.data
              : scholarship
          )
        );
        setEditingScholarship(null);
        setShowScholarshipForm(false);
        setScholarshipFormData({
          title: "",
          description: "",
          requirements: "",
          value: "",
          applicationDeadline: "",
          provider: "",
          department: "",
          eligibility: "",
          applicationProcess: "",
        });
      } else {
        setError(response.data.message || "Không thể cập nhật học bổng");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error updating scholarship:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(
          error.response?.data?.message || "Không thể cập nhật học bổng"
        );
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleDeleteScholarship = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học bổng này?")) {
      try {
        await axios.delete(`${API_URL}/scholarships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Học bổng đã được xóa thành công!");
        fetchScholarships();
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const handleEditScholarship = (scholarship) => {
    setEditingScholarship(scholarship);
    setScholarshipFormData({
      title: scholarship.title,
      description: scholarship.description,
      requirements: scholarship.requirements,
      value: scholarship.value,
      applicationDeadline: scholarship.applicationDeadline,
      provider: scholarship.provider,
      department: scholarship.department,
      eligibility: scholarship.eligibility,
      applicationProcess: scholarship.applicationProcess,
    });
    setShowScholarshipForm(true);
  };

  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScholarship) {
        await axios.put(
          `${API_URL}/scholarships/${editingScholarship._id}`,
          scholarshipFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccessMessage("Học bổng đã được cập nhật thành công!");
      } else {
        await axios.post(`${API_URL}/scholarships`, scholarshipFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Học bổng đã được thêm thành công!");
      }
      setShowScholarshipForm(false);
      setEditingScholarship(null);
      setScholarshipFormData({
        title: "",
        description: "",
        requirements: "",
        value: "",
        applicationDeadline: "",
        provider: "",
        department: "",
        eligibility: "",
        applicationProcess: "",
      });
      fetchScholarships();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleScholarshipInputChange = (e) => {
    const { name, value } = e.target;
    setScholarshipFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || user.role !== "admin") {
        window.location.href = "/login";
        return false;
      }
      return true;
    };

    const fetchMajors = async () => {
      if (!checkAuth()) return;

      try {
        const token = localStorage.getItem("token");
        console.log("Fetching departments with token:", token);

        const response = await axios.get(
          "https://student-info-be.onrender.com/api/departments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Departments response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setMajors(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setMajors(response.data.data);
        } else if (
          response.data &&
          response.data.departments &&
          Array.isArray(response.data.departments)
        ) {
          setMajors(response.data.departments);
        } else {
          console.error("Invalid departments data format:", response.data);
          setError("Dữ liệu ngành học không hợp lệ");
          setMajors([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching departments:", err);
        console.error("Error response:", err.response);

        if (err.code === "ERR_NETWORK") {
          setError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
          );
        } else if (err.response?.status === 401) {
          window.location.href = "/login";
        } else {
          setError(
            err.response?.data?.message || "Không thể tải danh sách ngành học"
          );
        }
        setLoading(false);
        setMajors([]);
      }
    };

    const fetchUsers = async () => {
      if (!checkAuth()) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://student-info-be.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setUsers(response.data.data);
        } else if (
          response.data &&
          response.data.users &&
          Array.isArray(response.data.users)
        ) {
          setUsers(response.data.users);
        } else {
          console.error("Invalid users data format:", response.data);
          setError("Dữ liệu người dùng không hợp lệ");
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        if (err.code === "ERR_NETWORK") {
          setError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
          );
        } else if (err.response?.status === 401) {
          window.location.href = "/login";
        } else {
          setError(
            err.response?.data?.message || "Không thể tải danh sách người dùng"
          );
        }
        setUsers([]);
      }
    };

    const fetchDatasets = async () => {
      if (!checkAuth()) return;

      try {
        const token = localStorage.getItem("token");
        console.log("Fetching datasets with token:", token);

        const response = await axios.get(
          "https://student-info-be.onrender.com/api/dataset",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Datasets response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setDatasets(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setDatasets(response.data.data);
        } else if (
          response.data &&
          response.data.datasets &&
          Array.isArray(response.data.datasets)
        ) {
          setDatasets(response.data.datasets);
        } else {
          console.error("Invalid datasets data format:", response.data);
          setError("Dữ liệu dataset không hợp lệ");
          setDatasets([]);
        }
      } catch (err) {
        console.error("Error fetching datasets:", err);
        console.error("Error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });

        if (err.code === "ERR_NETWORK") {
          setError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
          );
        } else if (err.response?.status === 401) {
          window.location.href = "/login";
        } else if (err.response?.status === 404) {
          setError(
            "API endpoint không tồn tại. Vui lòng kiểm tra lại đường dẫn."
          );
          setDatasets([]);
        } else {
          setError(
            err.response?.data?.message || "Không thể tải danh sách dataset"
          );
        }
        setDatasets([]);
      }
    };

    fetchNotifications();
    fetchMajors();
    fetchUsers();
    fetchDatasets();
    fetchEvents();
    fetchScholarships();
  }, [eventDepartmentFilter, scholarshipDepartmentFilter]);

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = "Tên ngành là bắt buộc";
    if (!data.code) errors.code = "Mã ngành là bắt buộc";
    if (!data.description) errors.description = "Mô tả là bắt buộc";
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal) {
      setEditingMajor((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setNewMajor((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(newMajor);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      window.location.href = "/login";
      return;
    }

    try {
      console.log("Submitting new department:", newMajor);
      const response = await axios.post(
        "https://student-info-be.onrender.com/api/departments",
        newMajor,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Add department response:", response.data);
      setSuccess("Thêm ngành học thành công!");
      setTimeout(() => setSuccess(""), 3000);
      await refreshDepartments();
      setNewMajor({ name: "", code: "", description: "" });
      setFormErrors({});
    } catch (err) {
      console.error("Error adding department:", err.response || err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else {
        setError(err.response?.data?.message || "Không thể thêm ngành học mới");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEdit = (major) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      setError(
        "Bạn không có quyền chỉnh sửa ngành học. Chỉ Admin mới có quyền này."
      );
      setTimeout(() => setError(""), 3000);
      return;
    }
    setEditingMajor({ ...major });
    setShowEditModal(true);
    setFormErrors({});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      setError(
        "Bạn không có quyền cập nhật ngành học. Chỉ Admin mới có quyền này."
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    const errors = validateForm(editingMajor);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `https://student-info-be.onrender.com/api/departments/${editingMajor._id}`,
        editingMajor,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update department response:", response.data);
      setSuccess("Cập nhật ngành học thành công!");
      setTimeout(() => setSuccess(""), 3000);
      await refreshDepartments();
      setShowEditModal(false);
      setEditingMajor(null);
      setFormErrors({});
    } catch (err) {
      console.error("Error updating department:", err.response || err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else if (err.response?.status === 403) {
        setError(
          "Bạn không có quyền cập nhật ngành học. Chỉ Admin mới có quyền này."
        );
      } else {
        setError(err.response?.data?.message || "Không thể cập nhật ngành học");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token) {
        setError("Không tìm thấy token xác thực");
        return;
      }

      if (user?.role !== "admin") {
        setError("Bạn không có quyền xóa khoa");
        return;
      }

      // Kiểm tra department có coordinator không
      const department = majors.find((m) => m._id === id);
      if (!department) {
        setError("Không tìm thấy ngành học cần xóa");
        return;
      }

      if (!window.confirm("Bạn có chắc chắn muốn xóa ngành học này?")) {
        return;
      }

      // Nếu department có coordinator, xóa coordinator trước
      if (department.coordinator) {
        try {
          // Xóa coordinator trước
          const updateResponse = await axios.put(
            `https://student-info-be.onrender.com/api/departments/${id}`,
            { coordinator: null },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!updateResponse.data.success) {
            setError("Không thể xóa người phụ trách. Vui lòng thử lại sau.");
            setTimeout(() => setError(""), 3000);
            return;
          }
        } catch (err) {
          console.error("Error removing coordinator:", err.response || err);
          setError("Không thể xóa người phụ trách. Vui lòng thử lại sau.");
          setTimeout(() => setError(""), 3000);
          return;
        }
      }

      // Sau đó xóa department bằng cách gửi request DELETE với ID
      const response = await axios({
        method: "delete",
        url: `https://student-info-be.onrender.com/api/departments/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          id,
          method: "findByIdAndDelete", // Thêm phương thức xóa vào request
        },
      });

      if (response.data.success) {
        setSuccess("Xóa ngành học thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshDepartments();
      } else {
        setError(response.data.message || "Không thể xóa ngành học");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      console.error("Error details:", err.response?.data);

      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else if (err.response?.status === 403) {
        setError(
          "Bạn không có quyền xóa ngành học. Chỉ Admin mới có quyền này."
        );
      } else if (err.response?.status === 404) {
        setError("Không tìm thấy ngành học cần xóa. Vui lòng thử lại.");
      } else if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || "Lỗi server";
        setError(`Lỗi server: ${errorMessage}. Vui lòng thử lại sau.`);
      } else {
        setError(err.response?.data?.message || "Không thể xóa ngành học");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUserEdit = (user) => {
    setEditingUser({ ...user });
    setShowUserEditModal(true);
    setUserFormErrors({});
  };

  const validateUserForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = "Tên là bắt buộc";
    if (!data.email) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!data.role) errors.role = "Vai trò là bắt buộc";
    return errors;
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Debug logs
    console.log("Current user:", currentUser);
    console.log("Editing user:", editingUser);
    console.log("Token:", token);

    // Kiểm tra quyền admin
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      window.location.href = "/login";
      return;
    }

    if (currentUser.role !== "admin") {
      setError("Bạn không có quyền admin");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Validate form
    const errors = validateUserForm(editingUser);
    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      return;
    }

    try {
      // Kiểm tra user cần cập nhật
      const userToUpdate = users.find((u) => u._id === editingUser._id);
      if (!userToUpdate) {
        setError("Không tìm thấy người dùng cần cập nhật");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Debug log
      console.log("User to update:", userToUpdate);

      // Kiểm tra nếu đang cập nhật chính mình
      if (editingUser._id === currentUser._id) {
        setError("Bạn không thể thay đổi vai trò của chính mình");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Kiểm tra nếu đang cập nhật admin khác
      if (
        userToUpdate.role === "admin" &&
        currentUser._id !== userToUpdate._id
      ) {
        setError("Bạn không thể cập nhật tài khoản admin khác");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Gửi request với cấu trúc data đúng
      const requestData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        currentUserId: currentUser._id, // Thêm ID của user hiện tại
        currentUserRole: currentUser.role, // Thêm role của user hiện tại
      };

      // Debug log
      console.log("Request data:", requestData);

      const response = await axios({
        method: "put",
        url: `https://student-info-be.onrender.com/api/users/${editingUser._id}`,
        data: requestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Debug log
      console.log("Response:", response.data);

      if (response.data.message === "User updated successfully") {
        setSuccess("Cập nhật người dùng thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshUsers();
        setShowUserEditModal(false);
        setEditingUser(null);
      } else {
        setError(response.data.message || "Không thể cập nhật người dùng");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error updating user:", err.response || err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      if (err.code === "ERR_NETWORK") {
        setError("Không thể kết nối đến máy chủ");
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền cập nhật người dùng này");
      } else {
        setError(
          err.response?.data?.message || "Không thể cập nhật người dùng"
        );
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUserDelete = async (id) => {
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || currentUser.role !== "admin") {
      window.location.href = "/login";
      return;
    }

    const userToDelete = users.find((u) => u._id === id);
    if (userToDelete?.role === "admin") {
      setError("Không thể xóa tài khoản admin");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      const response = await axios({
        method: "delete",
        url: `https://student-info-be.onrender.com/api/users/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setSuccess("Xóa người dùng thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshUsers();
      } else {
        setError(response.data.message || "Không thể xóa người dùng");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting user:", err.response || err);
      if (err.code === "ERR_NETWORK") {
        setError("Không thể kết nối đến máy chủ");
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền xóa người dùng");
      } else {
        setError(err.response?.data?.message || "Không thể xóa người dùng");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const refreshDepartments = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/departments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setMajors(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setMajors(response.data.data);
      } else if (
        response.data &&
        response.data.departments &&
        Array.isArray(response.data.departments)
      ) {
        setMajors(response.data.departments);
      }
    } catch (err) {
      console.error("Error refreshing departments:", err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      }
    }
  };

  const refreshUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setUsers(response.data.data);
      } else if (
        response.data &&
        response.data.users &&
        Array.isArray(response.data.users)
      ) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error("Error refreshing users:", err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      }
    }
  };

  const validateDatasetForm = (data) => {
    const errors = {};
    if (!data.key) errors.key = "Key là bắt buộc";
    if (!data.value) errors.value = "Value là bắt buộc";
    if (!data.category) errors.category = "Category là bắt buộc";
    return errors;
  };

  const handleDatasetInputChange = (e) => {
    const { name, value } = e.target;
    if (showDatasetEditModal) {
      setEditingDataset((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setNewDataset((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setDatasetFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDatasetSubmit = async (e) => {
    e.preventDefault();
    const errors = validateDatasetForm(newDataset);
    if (Object.keys(errors).length > 0) {
      setDatasetFormErrors(errors);
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || (user.role !== "admin" && user.role !== "coordinator")) {
      window.location.href = "/login";
      return;
    }

    try {
      const datasetData = {
        ...newDataset,
        createdBy: user._id,
        updatedBy: user._id,
      };

      const response = await axios.post(
        "https://student-info-be.onrender.com/api/dataset",
        datasetData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Thêm dataset thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshDatasets();
        setNewDataset({ key: "", value: "", category: "", department: null });
        setDatasetFormErrors({});
      } else {
        setError(response.data.message || "Không thể thêm dataset mới");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error adding dataset:", err.response || err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else {
        setError(err.response?.data?.message || "Không thể thêm dataset mới");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDatasetEdit = (dataset) => {
    setEditingDataset({ ...dataset });
    setShowDatasetEditModal(true);
    setDatasetFormErrors({});
  };

  const handleDatasetUpdate = async (e) => {
    e.preventDefault();
    const errors = validateDatasetForm(editingDataset);
    if (Object.keys(errors).length > 0) {
      setDatasetFormErrors(errors);
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || (user.role !== "admin" && user.role !== "coordinator")) {
      window.location.href = "/login";
      return;
    }

    try {
      const datasetData = {
        ...editingDataset,
        updatedBy: user._id,
      };

      const response = await axios.put(
        `https://student-info-be.onrender.com/api/dataset/${editingDataset._id}`,
        datasetData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Cập nhật dataset thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshDatasets();
        setShowDatasetEditModal(false);
        setEditingDataset(null);
        setDatasetFormErrors({});
      } else {
        setError(response.data.message || "Không thể cập nhật dataset");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error updating dataset:", err.response || err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else {
        setError(err.response?.data?.message || "Không thể cập nhật dataset");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDatasetDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dataset này?")) {
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || (user.role !== "admin" && user.role !== "coordinator")) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.delete(
        `https://student-info-be.onrender.com/api/dataset/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Xóa dataset thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshDatasets();
      } else {
        setError(response.data.message || "Không thể xóa dataset");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting dataset:", err.response || err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      } else if (err.response?.status === 401) {
        window.location.href = "/login";
      } else {
        setError(err.response?.data?.message || "Không thể xóa dataset");
      }
      setTimeout(() => setError(""), 3000);
    }
  };

  const refreshDatasets = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://student-info-be.onrender.com/api/dataset",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setDatasets(response.data);
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setDatasets(response.data.data);
      } else if (
        response.data &&
        response.data.datasets &&
        Array.isArray(response.data.datasets)
      ) {
        setDatasets(response.data.datasets);
      }
    } catch (err) {
      console.error("Error refreshing datasets:", err);
      if (err.code === "ERR_NETWORK") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        );
      }
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      console.log("Creating notification with data:", newNotification);

      const response = await axios.post(
        "https://student-info-be.onrender.com/api/notifications",
        newNotification,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        setSuccess("Tạo thông báo thành công!");
        setTimeout(() => setSuccess(""), 3000);

        // Cập nhật state ngay lập tức với thông báo mới
        const newNotificationData = response.data.data;
        console.log("New notification data:", newNotificationData);

        setNotifications((prevNotifications) => {
          console.log("Previous notifications:", prevNotifications);
          const updatedNotifications = [
            newNotificationData,
            ...prevNotifications,
          ];
          console.log("Updated notifications:", updatedNotifications);
          return updatedNotifications;
        });

        // Reset form và đóng form
        setShowNotificationForm(false);
        setNewNotification({
          title: "",
          content: "",
          type: "general",
          department: "",
          startDate: "",
          endDate: "",
          isImportant: false,
        });
      } else {
        setError(response.data.message || "Không thể tạo thông báo");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(error.response?.data?.message || "Không thể tạo thông báo");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleEditNotificationClick = (notification) => {
    setEditingNotificationId(notification._id);
    setEditNotification({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      department: notification.department?._id || "",
      startDate: notification.startDate
        ? notification.startDate.slice(0, 16)
        : "",
      endDate: notification.endDate ? notification.endDate.slice(0, 16) : "",
      isImportant: notification.isImportant || false,
    });
  };

  const handleEditNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditNotification((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const response = await axios.put(
        `https://student-info-be.onrender.com/api/notifications/${editingNotificationId}`,
        editNotification,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Cập nhật thông báo thành công!");
        setTimeout(() => setSuccess(""), 3000);
        setEditingNotificationId(null);
        setEditNotification({});
        // Cập nhật lại danh sách thông báo
        await fetchNotifications();
      } else {
        setError(response.data.message || "Không thể cập nhật thông báo");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(
          error.response?.data?.message || "Không thể cập nhật thông báo"
        );
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const response = await axios.delete(
        `https://student-info-be.onrender.com/api/notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Xóa thông báo thành công!");
        setTimeout(() => setSuccess(""), 3000);
        // Cập nhật lại danh sách thông báo
        await fetchNotifications();
      } else {
        setError(response.data.message || "Không thể xóa thông báo");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(error.response?.data?.message || "Không thể xóa thông báo");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // Thêm useEffect để fetch thông báo khi component mount và khi activeTab thay đổi
  useEffect(() => {
    if (activeTab === "notifications_all") {
      fetchNotifications();
    } else if (activeTab === "notifications_saved") {
      fetchSavedNotifications();
    }
  }, [activeTab]);

  // Thêm useEffect để fetch thông báo khi bộ lọc thay đổi
  useEffect(() => {
    if (activeTab === "notifications_all") {
      fetchNotifications();
    }
  }, [notificationTypeFilter, notificationDepartmentFilter]);

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

  const renderNotifications = () => (
    <div className="notifications-section">
      <div className="section-header">
        <h2>Tất cả thông báo</h2>
        <button
          className="add-button"
          onClick={() => setShowNotificationForm(true)}
        >
          <i className="fas fa-plus"></i> Tạo thông báo mới
        </button>
      </div>

      <div className="notification-filters">
        <select
          value={notificationTypeFilter}
          onChange={(e) => setNotificationTypeFilter(e.target.value)}
        >
          <option value="">Tất cả loại</option>
          <option value="general">Chung</option>
          <option value="scholarship">Học bổng</option>
          <option value="event">Sự kiện</option>
          <option value="department">Theo ngành</option>
        </select>
        <select
          value={notificationDepartmentFilter}
          onChange={(e) => setNotificationDepartmentFilter(e.target.value)}
        >
          <option value="">Tất cả ngành</option>
          {majors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button
          className="submit-button"
          onClick={() => {
            console.log("Filtering with:", {
              notificationTypeFilter,
              notificationDepartmentFilter,
            });
            fetchNotifications();
          }}
        >
          Lọc
        </button>
      </div>

      {showNotificationForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tạo thông báo mới</h2>
            <form onSubmit={handleCreateNotification}>
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                  value={newNotification.content}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      content: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại thông báo:</label>
                <select
                  value={newNotification.type}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="general">Thông báo chung</option>
                  <option value="scholarship">Học bổng</option>
                  <option value="event">Sự kiện</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ngành (để trống nếu là thông báo chung):</label>
                <select
                  value={newNotification.department}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      department: e.target.value,
                    })
                  }
                >
                  <option value="">Thông báo chung</option>
                  {majors.map((major) => (
                    <option key={major._id} value={major._id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu:</label>
                <input
                  type="datetime-local"
                  value={newNotification.startDate}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc (không bắt buộc):</label>
                <input
                  type="datetime-local"
                  value={newNotification.endDate}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newNotification.isImportant}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        isImportant: e.target.checked,
                      })
                    }
                  />
                  Thông báo quan trọng
                </label>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Tạo thông báo
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowNotificationForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div>Không có thông báo nào</div>
        ) : (
          notifications.map((notification) => {
            const isSaved = savedNotifications.some(
              (n) => n._id === notification._id
            );
            return (
              <div className="notification-card" key={notification._id}>
                {editingNotificationId === notification._id ? (
                  <div className="modal">
                    <div className="modal-content">
                      <h2>Chỉnh sửa thông báo</h2>
                      <form onSubmit={handleUpdateNotification}>
                        <div className="form-group">
                          <label>Tiêu đề</label>
                          <input
                            type="text"
                            name="title"
                            value={editNotification.title || ""}
                            onChange={handleEditNotificationChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Nội dung</label>
                          <textarea
                            name="content"
                            value={editNotification.content || ""}
                            onChange={handleEditNotificationChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Loại thông báo</label>
                          <select
                            name="type"
                            value={editNotification.type || "general"}
                            onChange={handleEditNotificationChange}
                          >
                            <option value="general">Chung</option>
                            <option value="scholarship">Học bổng</option>
                            <option value="event">Sự kiện</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Khoa</label>
                          <select
                            name="department"
                            value={editNotification.department || ""}
                            onChange={handleEditNotificationChange}
                          >
                            <option value="">Tất cả</option>
                            {majors.map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Thời gian bắt đầu</label>
                          <input
                            type="datetime-local"
                            name="startDate"
                            value={editNotification.startDate || ""}
                            onChange={handleEditNotificationChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Thời gian kết thúc</label>
                          <input
                            type="datetime-local"
                            name="endDate"
                            value={editNotification.endDate || ""}
                            onChange={handleEditNotificationChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              name="isImportant"
                              checked={editNotification.isImportant || false}
                              onChange={handleEditNotificationChange}
                            />
                            Quan trọng
                          </label>
                        </div>
                        <div className="modal-buttons">
                          <button type="submit" className="submit-button">
                            Lưu
                          </button>
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => setEditingNotificationId(null)}
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="notification-header">
                      <h3>{notification.title}</h3>
                      <span
                        className={`notification-type ${notification.type}`}
                      >
                        {notification.type === "general"
                          ? "Thông báo chung"
                          : notification.type === "scholarship"
                          ? "Học bổng"
                          : notification.type === "event"
                          ? "Sự kiện"
                          : "Theo ngành"}
                      </span>
                    </div>
                    <div className="notification-department">
                      {notification.department && (
                        <>
                          <i className="fas fa-building"></i>{" "}
                          {notification.department.name}
                        </>
                      )}
                    </div>
                    <div className="notification-content">
                      {notification.content}
                    </div>
                    <div className="notification-footer">
                      <span className="notification-time">
                        <i className="fas fa-clock"></i>{" "}
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <div>
                        {(user.role === "admin" ||
                          user.role === "coordinator") && (
                          <>
                            <button
                              className="submit-button"
                              onClick={() =>
                                handleEditNotificationClick(notification)
                              }
                            >
                              Sửa
                            </button>
                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDeleteNotification(notification._id)
                              }
                            >
                              Xóa
                            </button>
                          </>
                        )}
                        {user.role !== "admin" && (
                          <button
                            className="save-button"
                            onClick={() =>
                              isSaved
                                ? handleUnsaveNotification(notification._id)
                                : handleSaveNotification(notification._id)
                            }
                          >
                            {isSaved ? "Bỏ lưu" : "Lưu"}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderSavedNotifications = () => (
    <div className="notifications-section">
      <div className="section-header">
        <h2>Thông báo đã lưu</h2>
      </div>
      <div className="notifications-list">
        {savedNotifications.length === 0 ? (
          <div>Không có thông báo đã lưu</div>
        ) : (
          savedNotifications.map((notification) => (
            <div className="notification-card" key={notification._id}>
              <div className="notification-header">
                <h3>{notification.title}</h3>
                <span className={`notification-type ${notification.type}`}>
                  {notification.type === "general"
                    ? "Thông báo chung"
                    : notification.type === "scholarship"
                    ? "Học bổng"
                    : notification.type === "event"
                    ? "Sự kiện"
                    : "Theo ngành"}
                </span>
              </div>
              <div className="notification-department">
                {notification.department && (
                  <>
                    <i className="fas fa-building"></i>{" "}
                    {notification.department.name}
                  </>
                )}
              </div>
              <div className="notification-content">{notification.content}</div>
              <div className="notification-footer">
                <span className="notification-time">
                  <i className="fas fa-clock"></i>{" "}
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                <div>
                  <button
                    className="save-button"
                    onClick={() => handleUnsaveNotification(notification._id)}
                  >
                    Bỏ lưu
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="events-section">
      <div className="section-header">
        <h2>Quản lý sự kiện</h2>
        {user.role === "admin" && (
          <button className="add-button" onClick={() => setShowEventForm(true)}>
            <i className="fas fa-plus"></i> Tạo sự kiện mới
          </button>
        )}
      </div>

      {showEventForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tạo sự kiện mới</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa điểm:</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Người tổ chức:</label>
                <input
                  type="text"
                  value={newEvent.organizer}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, organizer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngành:</label>
                <select
                  value={newEvent.department}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, department: e.target.value })
                  }
                >
                  <option value="">Sự kiện chung</option>
                  {majors.map((major) => (
                    <option key={major._id} value={major._id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu:</label>
                <input
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc:</label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Tạo
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEventForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="event-filters">
        <select
          value={eventDepartmentFilter}
          onChange={(e) => setEventDepartmentFilter(e.target.value)}
        >
          <option value="">Tất cả ngành</option>
          {majors.map((d) => (
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
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Địa điểm</th>
                <th>Người tổ chức</th>
                <th>Ngành</th>
                <th>Thời gian</th>
                {user.role === "admin" && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{event.location}</td>
                  <td>{event.organizer}</td>
                  <td>{event.department ? event.department.name : "Chung"}</td>
                  <td>
                    {new Date(event.startDate).toLocaleString()} -{" "}
                    {new Date(event.endDate).toLocaleString()}
                  </td>
                  {user.role === "admin" && (
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEditEventClick(event)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingEventId && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sửa sự kiện</h2>
            <form onSubmit={handleUpdateEvent}>
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  name="title"
                  value={editEvent.title}
                  onChange={handleEditEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  name="description"
                  value={editEvent.description}
                  onChange={handleEditEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa điểm:</label>
                <input
                  type="text"
                  name="location"
                  value={editEvent.location}
                  onChange={handleEditEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Người tổ chức:</label>
                <input
                  type="text"
                  name="organizer"
                  value={editEvent.organizer}
                  onChange={handleEditEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngành:</label>
                <select
                  name="department"
                  value={editEvent.department}
                  onChange={handleEditEventChange}
                >
                  <option value="">Sự kiện chung</option>
                  {majors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu:</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={editEvent.startDate}
                  onChange={handleEditEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc:</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={editEvent.endDate}
                  onChange={handleEditEventChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setEditingEventId(null);
                    setEditEvent(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderScholarships = () => {
    return (
      <div className="scholarships-section">
        <div className="section-header">
          <h2>Scholarships</h2>
          {user.role === "admin" && (
            <button
              className="add-button"
              onClick={() => {
                setEditingScholarship(null);
                setScholarshipFormData({
                  title: "",
                  description: "",
                  requirements: "",
                  value: "",
                  applicationDeadline: "",
                  provider: "",
                  department: "",
                  eligibility: "",
                  applicationProcess: "",
                });
                setShowScholarshipForm(true);
              }}
            >
              <i className="fas fa-plus"></i> Add Scholarship
            </button>
          )}
        </div>

        <div className="scholarship-list">
          {scholarships.length === 0 ? (
            <p>Không có học bổng nào</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Value</th>
                  <th>Provider</th>
                  <th>Department</th>
                  <th>Deadline</th>
                  {user.role === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {scholarships.map((scholarship) => (
                  <tr key={scholarship._id}>
                    <td>{scholarship.title}</td>
                    <td>{scholarship.value}</td>
                    <td>{scholarship.provider}</td>
                    <td>{scholarship.department?.name || "All Departments"}</td>
                    <td>
                      {new Date(
                        scholarship.applicationDeadline
                      ).toLocaleDateString()}
                    </td>
                    {user.role === "admin" && (
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => handleEditScholarship(scholarship)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteScholarship(scholarship._id)
                          }
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showScholarshipForm && (
          <div className="modal">
            <div className="modal-content">
              <h2>
                {editingScholarship
                  ? "Edit Scholarship"
                  : "Create New Scholarship"}
              </h2>
              <form
                onSubmit={
                  editingScholarship
                    ? handleScholarshipSubmit
                    : handleCreateScholarship
                }
              >
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={scholarshipFormData.title}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={scholarshipFormData.description}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Requirements</label>
                  <textarea
                    value={scholarshipFormData.requirements}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input
                    type="text"
                    value={scholarshipFormData.value}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={scholarshipFormData.applicationDeadline}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Provider</label>
                  <input
                    type="text"
                    value={scholarshipFormData.provider}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={scholarshipFormData.department}
                    onChange={handleScholarshipInputChange}
                  >
                    <option value="">All Departments</option>
                    {majors.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Eligibility</label>
                  <textarea
                    value={scholarshipFormData.eligibility}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Application Process</label>
                  <textarea
                    value={scholarshipFormData.applicationProcess}
                    onChange={handleScholarshipInputChange}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">
                    {editingScholarship ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowScholarshipForm(false);
                      setEditingScholarship(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className={`admin-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="admin-header">
        <h1>Quản Lý Hệ Thống</h1>
        <div className="admin-tabs">
          <button
            className={`tab-button ${
              activeTab === "notifications_all" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("notifications_all");
              fetchNotifications();
            }}
          >
            Tất cả thông báo
          </button>
          {user.role !== "admin" && (
            <button
              className={`tab-button ${
                activeTab === "notifications_saved" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("notifications_saved");
                fetchSavedNotifications();
              }}
            >
              Thông báo đã lưu
            </button>
          )}
          <button
            className={`tab-button ${
              activeTab === "departments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("departments")}
          >
            Ngành Học
          </button>
          <button
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Người Dùng
          </button>
          <button
            className={`tab-button ${activeTab === "datasets" ? "active" : ""}`}
            onClick={() => setActiveTab("datasets")}
          >
            Dữ Liệu
          </button>
          <button
            className={`tab-button ${
              activeTab === "scholarships" ? "active" : ""
            }`}
            onClick={() => setActiveTab("scholarships")}
          >
            Scholarships
          </button>
          <button
            className={`tab-button ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            Sự Kiện
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

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
          <button onClick={() => setErrorMessage("")} className="close-btn">
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button onClick={() => setSuccessMessage("")} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="tab-content">
        {activeTab === "departments" && (
          <>
            <div className="section-header">
              <h2>Danh Sách Ngành Học</h2>
              <button
                className="add-button"
                onClick={() => setShowEditModal(true)}
              >
                <i className="fas fa-plus"></i> Thêm Ngành Mới
              </button>
            </div>

            <div className="majors-list">
              {majors.length === 0 ? (
                <p>Không có ngành học nào</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Tên Ngành</th>
                      <th>Mã Ngành</th>
                      <th>Mô Tả</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {majors.map((major) => (
                      <tr key={major._id}>
                        <td>{major.name}</td>
                        <td>{major.code}</td>
                        <td>{major.description}</td>
                        <td className="Button_Major">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(major)}
                          >
                            Sửa
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteDepartment(major._id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="users-list">
            <h2>Danh Sách Người Dùng</h2>
            {users.length === 0 ? (
              <p>Không có người dùng nào</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => handleUserEdit(user)}
                        >
                          Sửa
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleUserDelete(user._id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "datasets" && (
          <>
            <div className="section-header">
              <h2>Danh Sách Dataset</h2>
              <button
                className="add-button"
                onClick={() => setShowDatasetEditModal(true)}
              >
                <i className="fas fa-plus"></i> Thêm Dataset Mới
              </button>
            </div>

            <div className="datasets-list">
              {datasets.length === 0 ? (
                <p>Không có dataset nào</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((dataset) => (
                      <tr key={dataset._id}>
                        <td>{dataset.key}</td>
                        <td>{dataset.value}</td>
                        <td>{dataset.category}</td>
                        <td>
                          {dataset.department
                            ? majors.find((m) => m._id === dataset.department)
                                ?.name
                            : "Không có"}
                        </td>
                        <td>
                          <button
                            className="edit-button"
                            onClick={() => handleDatasetEdit(dataset)}
                          >
                            Sửa
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDatasetDelete(dataset._id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === "scholarships" && renderScholarships()}

        {activeTab === "notifications_all" && renderNotifications()}
        {activeTab === "notifications_saved" && renderSavedNotifications()}
        {activeTab === "events" && renderEvents()}
      </div>

      {/* Add/Edit Department Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingMajor ? "Sửa Ngành Học" : "Thêm Ngành Học Mới"}</h2>
            <form onSubmit={editingMajor ? handleUpdate : handleSubmit}>
              <div className="form-group">
                <label>Tên ngành:</label>
                <input
                  type="text"
                  name="name"
                  value={editingMajor ? editingMajor.name : newMajor.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "error" : ""}
                />
                {formErrors.name && (
                  <span className="error-text">{formErrors.name}</span>
                )}
              </div>
              <div className="form-group">
                <label>Mã ngành:</label>
                <input
                  type="text"
                  name="code"
                  value={editingMajor ? editingMajor.code : newMajor.code}
                  onChange={handleInputChange}
                  className={formErrors.code ? "error" : ""}
                />
                {formErrors.code && (
                  <span className="error-text">{formErrors.code}</span>
                )}
              </div>
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  name="description"
                  value={
                    editingMajor
                      ? editingMajor.description
                      : newMajor.description
                  }
                  onChange={handleInputChange}
                  className={formErrors.description ? "error" : ""}
                />
                {formErrors.description && (
                  <span className="error-text">{formErrors.description}</span>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  {editingMajor ? "Lưu" : "Thêm"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMajor(null);
                    setNewMajor({ name: "", code: "", description: "" });
                    setFormErrors({});
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sửa Người Dùng</h2>
            <form onSubmit={handleUserUpdate}>
              <div className="form-group">
                <label>Tên:</label>
                <input
                  type="text"
                  name="name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className={userFormErrors.name ? "error" : ""}
                />
                {userFormErrors.name && (
                  <span className="error-text">{userFormErrors.name}</span>
                )}
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className={userFormErrors.email ? "error" : ""}
                />
                {userFormErrors.email && (
                  <span className="error-text">{userFormErrors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  name="role"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className={userFormErrors.role ? "error" : ""}
                >
                  <option value="student">Sinh viên</option>
                  <option value="coordinator">Người phụ trách</option>
                  <option value="admin">Admin</option>
                </select>
                {userFormErrors.role && (
                  <span className="error-text">{userFormErrors.role}</span>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowUserEditModal(false);
                    setEditingUser(null);
                    setUserFormErrors({});
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDatasetEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingDataset ? "Sửa Dataset" : "Thêm Dataset Mới"}</h2>
            <form
              onSubmit={
                editingDataset ? handleDatasetUpdate : handleDatasetSubmit
              }
            >
              <div className="form-group">
                <label>Key:</label>
                <input
                  type="text"
                  name="key"
                  value={editingDataset ? editingDataset.key : newDataset.key}
                  onChange={handleDatasetInputChange}
                  className={datasetFormErrors.key ? "error" : ""}
                />
                {datasetFormErrors.key && (
                  <span className="error-text">{datasetFormErrors.key}</span>
                )}
              </div>
              <div className="form-group">
                <label>Value:</label>
                <textarea
                  name="value"
                  value={
                    editingDataset ? editingDataset.value : newDataset.value
                  }
                  onChange={handleDatasetInputChange}
                  className={datasetFormErrors.value ? "error" : ""}
                />
                {datasetFormErrors.value && (
                  <span className="error-text">{datasetFormErrors.value}</span>
                )}
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  name="category"
                  value={
                    editingDataset
                      ? editingDataset.category
                      : newDataset.category
                  }
                  onChange={handleDatasetInputChange}
                  className={datasetFormErrors.category ? "error" : ""}
                >
                  <option value="">Chọn category</option>
                  <option value="general">General</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="event">Event</option>
                  <option value="department">Department</option>
                  <option value="faq">FAQ</option>
                </select>
                {datasetFormErrors.category && (
                  <span className="error-text">
                    {datasetFormErrors.category}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Department:</label>
                <select
                  name="department"
                  value={
                    editingDataset
                      ? editingDataset.department
                      : newDataset.department
                  }
                  onChange={handleDatasetInputChange}
                >
                  <option value="">Không có</option>
                  {majors.map((major) => (
                    <option key={major._id} value={major._id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  {editingDataset ? "Lưu" : "Thêm"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowDatasetEditModal(false);
                    setEditingDataset(null);
                    setNewDataset({
                      key: "",
                      value: "",
                      category: "",
                      department: null,
                    });
                    setDatasetFormErrors({});
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
