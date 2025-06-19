import React from "react";
import "./NotificationList.css";

const NotificationFilter = ({
  filterType,
  setFilterType,
  filterDepartment,
  setFilterDepartment,
  departments,
}) => {
  return (
    <div className="notification-filters">
      <div className="filter-group">
        <label>Loại thông báo:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả</option>
          <option value="event">Sự kiện</option>
          <option value="scholarship">Học bổng</option>
          <option value="dataset">Dataset</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Khoa:</label>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả</option>
          {Array.isArray(departments) &&
            departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default NotificationFilter;
