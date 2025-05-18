import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem thông tin");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://student-info-be.onrender.com/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Profile response:", response.data);

        if (response.data.status && response.data.data) {
          setUserData(response.data.data);
        } else {
          setError("Không thể lấy thông tin người dùng");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          // Token không hợp lệ hoặc hết hạn
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.message || "Không thể tải thông tin người dùng"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Đang tải thông tin...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!userData) {
    return (
      <div className="error-message">Không tìm thấy thông tin người dùng</div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Thông Tin Cá Nhân</h2>
      <div className="profile-info">
        <div className="info-item">
          <span className="label">Họ và tên:</span>
          <span className="value">{userData.name}</span>
        </div>
        <div className="info-item">
          <span className="label">Email:</span>
          <span className="value">{userData.email}</span>
        </div>
        <div className="info-item">
          <span className="label">Chức Danh:</span>
          <span className="value">{userData.role}</span>
        </div>
        {/* Thêm các trường thông tin khác nếu có */}
      </div>
    </div>
  );
};

export default UserProfile;
