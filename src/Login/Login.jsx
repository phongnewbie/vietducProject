import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://student-info-be.onrender.com/api/auth/login",
        { email, password }
      );

      if (response.data?.data?.token) {
        const token = response.data.data.token;
        localStorage.setItem("token", token);

        const profileRes = await axios.get(
          "https://student-info-be.onrender.com/api/auth/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (profileRes.data?.data) {
          const user = profileRes.data.data;
          localStorage.setItem("user", JSON.stringify(user));

          // Kiểm tra role và chuyển hướng
          if (user.role === "admin") {
            window.location.href = "/AdminPage";
          } else {
            window.location.href = "/main";
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Email hoặc mật khẩu không đúng");
      } else {
        setError("Có lỗi xảy ra khi đăng nhập");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Đăng Nhập</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>
        <p className="register-link">
          Chưa có tài khoản? <a href="/register">Đăng ký</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
