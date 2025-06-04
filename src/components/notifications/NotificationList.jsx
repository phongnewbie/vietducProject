import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationList.css";

const NotificationList = ({
  notifications,
  savedNotifications,
  userRole,
  onEdit,
  onDelete,
  onSave,
  onUnsave,
}) => {
  const navigate = useNavigate();

  const isAdmin = userRole === "admin";
  const isCoordinator = userRole === "coordinator";

  const handleEdit = (notification) => {
    if (isAdmin) {
      onEdit(notification);
    }
  };

  const handleDelete = (notificationId) => {
    if (isAdmin) {
      onDelete(notificationId);
    }
  };

  const handleSave = (notificationId) => {
    if (isCoordinator) {
      onSave(notificationId);
    }
  };

  const handleUnsave = (notificationId) => {
    if (isCoordinator) {
      onUnsave(notificationId);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "event":
        return "Sự kiện";
      case "scholarship":
        return "Học bổng";
      case "dataset":
        return "Dataset";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notification-list">
      {!Array.isArray(notifications) || notifications.length === 0 ? (
        <div className="no-notifications">Không có thông báo nào</div>
      ) : (
        notifications.map((notification) => {
          const isSaved = savedNotifications.some(
            (n) => n._id === notification._id
          );
          return (
            <div key={notification._id} className="notification-card">
              <div className="notification-header">
                <h3>{notification.title}</h3>
                <span className={`notification-type ${notification.type}`}>
                  {getTypeLabel(notification.type)}
                </span>
              </div>
              <div className="notification-content">
                <p>{notification.content}</p>
                {notification.startDate && (
                  <p>
                    <strong>Thời gian bắt đầu:</strong>{" "}
                    {formatDate(notification.startDate)}
                  </p>
                )}
                {notification.endDate && (
                  <p>
                    <strong>Thời gian kết thúc:</strong>{" "}
                    {formatDate(notification.endDate)}
                  </p>
                )}
                {notification.location && (
                  <p>
                    <strong>Địa điểm:</strong> {notification.location}
                  </p>
                )}
                {notification.contact && (
                  <p>
                    <strong>Liên hệ:</strong> {notification.contact}
                  </p>
                )}
                {notification.requirements && (
                  <p>
                    <strong>Yêu cầu:</strong> {notification.requirements}
                  </p>
                )}
                {notification.benefits && (
                  <p>
                    <strong>Quyền lợi:</strong> {notification.benefits}
                  </p>
                )}
                {notification.applicationProcess && (
                  <p>
                    <strong>Quy trình ứng tuyển:</strong>{" "}
                    {notification.applicationProcess}
                  </p>
                )}
                {notification.deadline && (
                  <p>
                    <strong>Hạn chót:</strong>{" "}
                    {formatDate(notification.deadline)}
                  </p>
                )}
                {notification.datasetUrl && (
                  <p>
                    <strong>Link dataset:</strong>{" "}
                    <a
                      href={notification.datasetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {notification.datasetUrl}
                    </a>
                  </p>
                )}
                {notification.datasetDescription && (
                  <p>
                    <strong>Mô tả dataset:</strong>{" "}
                    {notification.datasetDescription}
                  </p>
                )}
              </div>
              <div className="notification-footer">
                <div className="notification-actions">
                  {isAdmin && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(notification)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(notification._id)}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                  {isCoordinator && (
                    <button
                      className={isSaved ? "unsave-button" : "save-button"}
                      onClick={() =>
                        isSaved
                          ? handleUnsave(notification._id)
                          : handleSave(notification._id)
                      }
                    >
                      {isSaved ? "Bỏ lưu" : "Lưu"}
                    </button>
                  )}
                </div>
                <div className="notification-meta">
                  <span className="notification-date">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationList;
