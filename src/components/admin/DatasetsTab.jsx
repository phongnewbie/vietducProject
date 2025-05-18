import React, { useState } from "react";
import axios from "axios";

const DatasetsTab = ({ datasets, majors, refreshDatasets }) => {
  const [newDataset, setNewDataset] = useState({
    key: "",
    value: "",
    category: "",
    department: null,
  });
  const [editingDataset, setEditingDataset] = useState(null);
  const [showDatasetEditModal, setShowDatasetEditModal] = useState(false);
  const [datasetFormErrors, setDatasetFormErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return (
    <>
      <div className="dataset-form">
        <h2>Thêm Dataset Mới</h2>
        <form onSubmit={handleDatasetSubmit}>
          <div className="form-group">
            <label>Key:</label>
            <input
              type="text"
              name="key"
              value={newDataset.key}
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
              value={newDataset.value}
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
              value={newDataset.category}
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
              <span className="error-text">{datasetFormErrors.category}</span>
            )}
          </div>
          <div className="form-group">
            <label>Department:</label>
            <select
              name="department"
              value={newDataset.department || ""}
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
          <button type="submit" className="submit-button">
            Thêm Dataset
          </button>
        </form>
      </div>

      <div className="datasets-list">
        <h2>Danh Sách Dataset</h2>
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
                      ? majors.find((m) => m._id === dataset.department)?.name
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

      {showDatasetEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sửa Dataset</h2>
            <form onSubmit={handleDatasetUpdate}>
              <div className="form-group">
                <label>Key:</label>
                <input
                  type="text"
                  name="key"
                  value={editingDataset.key}
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
                  value={editingDataset.value}
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
                  value={editingDataset.category}
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
                  value={editingDataset.department || ""}
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
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowDatasetEditModal(false);
                    setEditingDataset(null);
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

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </>
  );
};

export default DatasetsTab;
