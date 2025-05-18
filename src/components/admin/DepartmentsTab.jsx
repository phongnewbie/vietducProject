import React, { useState } from "react";
import axios from "axios";

const DepartmentsTab = ({ majors, refreshDepartments }) => {
  const [newMajor, setNewMajor] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [editingMajor, setEditingMajor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      if (response.data.success) {
        setSuccess("Thêm ngành học thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshDepartments();
        setNewMajor({ name: "", code: "", description: "" });
        setFormErrors({});
      } else {
        setError(response.data.message || "Không thể thêm ngành học mới");
        setTimeout(() => setError(""), 3000);
      }
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

      if (response.data.success) {
        setSuccess("Cập nhật ngành học thành công!");
        setTimeout(() => setSuccess(""), 3000);
        await refreshDepartments();
        setShowEditModal(false);
        setEditingMajor(null);
        setFormErrors({});
      } else {
        setError(response.data.message || "Không thể cập nhật ngành học");
        setTimeout(() => setError(""), 3000);
      }
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

  const handleDelete = async (id) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || user.role !== "admin") {
      window.location.href = "/login";
      return;
    }

    if (!id) {
      setError("ID ngành học không hợp lệ");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const department = majors.find((m) => m._id === id);
    if (department?.coordinator) {
      if (
        window.confirm(
          "Ngành học này đang có người phụ trách. Bạn có muốn xóa người phụ trách trước khi xóa ngành học không?"
        )
      ) {
        try {
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

          if (updateResponse.data.success) {
            const deleteResponse = await axios({
              method: "delete",
              url: `https://student-info-be.onrender.com/api/departments/${id}`,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            });

            if (deleteResponse.data.success) {
              setSuccess("Xóa ngành học thành công!");
              setTimeout(() => setSuccess(""), 3000);
              await refreshDepartments();
            } else {
              setError(
                deleteResponse.data.message || "Không thể xóa ngành học"
              );
              setTimeout(() => setError(""), 3000);
            }
          } else {
            setError("Không thể xóa người phụ trách. Vui lòng thử lại sau.");
            setTimeout(() => setError(""), 3000);
          }
        } catch (err) {
          console.error("Error removing coordinator:", err.response || err);
          setError("Không thể xóa người phụ trách. Vui lòng thử lại sau.");
          setTimeout(() => setError(""), 3000);
        }
      }
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa ngành học này?")) {
      return;
    }

    try {
      const response = await axios({
        method: "delete",
        url: `https://student-info-be.onrender.com/api/departments/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
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
      console.error("Error deleting department:", err.response || err);
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

  return (
    <>
      <div className="major-form">
        <h2>Thêm Ngành Học Mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên ngành:</label>
            <input
              type="text"
              name="name"
              value={newMajor.name}
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
              value={newMajor.code}
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
              value={newMajor.description}
              onChange={handleInputChange}
              className={formErrors.description ? "error" : ""}
            />
            {formErrors.description && (
              <span className="error-text">{formErrors.description}</span>
            )}
          </div>
          <button type="submit" className="submit-button">
            Thêm Ngành
          </button>
        </form>
      </div>

      <div className="majors-list">
        <h2>Danh Sách Ngành Học</h2>
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
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(major)}
                    >
                      Sửa
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(major._id)}
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

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sửa Ngành Học</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Tên ngành:</label>
                <input
                  type="text"
                  name="name"
                  value={editingMajor.name}
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
                  value={editingMajor.code}
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
                  value={editingMajor.description}
                  onChange={handleInputChange}
                  className={formErrors.description ? "error" : ""}
                />
                {formErrors.description && (
                  <span className="error-text">{formErrors.description}</span>
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
                    setShowEditModal(false);
                    setEditingMajor(null);
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

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </>
  );
};

export default DepartmentsTab;
