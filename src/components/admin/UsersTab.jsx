import React, { useState } from "react";
import axios from "axios";

const UsersTab = ({ users, refreshUsers }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [userFormErrors, setUserFormErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
 
  const handleUserEdit = (user) => {
    setEditingUser({ ...user });
    setShowUserEditModal(true);
    setUserFormErrors({});
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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

    const errors = validateUserForm(editingUser);
    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      return;
    }

    try {
      const userToUpdate = users.find((u) => u._id === editingUser._id);
      if (!userToUpdate) {
        setError("Không tìm thấy người dùng cần cập nhật");
        setTimeout(() => setError(""), 3000);
        return;
      }

      if (editingUser._id === currentUser._id) {
        setError("Bạn không thể thay đổi vai trò của chính mình");
        setTimeout(() => setError(""), 3000);
        return;
      }

      if (
        userToUpdate.role === "admin" &&
        currentUser._id !== userToUpdate._id
      ) {
        setError("Bạn không thể cập nhật tài khoản admin khác");
        setTimeout(() => setError(""), 3000);
        return;
      }

      const requestData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        currentUserId: currentUser._id,
        currentUserRole: currentUser.role,
      };

      const response = await axios({
        method: "put",
        url: `https://student-info-be.onrender.com/api/users/${editingUser._id}`,
        data: requestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  return (
    <>
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

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </>
  );
};

export default UsersTab;
