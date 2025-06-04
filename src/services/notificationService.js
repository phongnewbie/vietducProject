const API_URL =
  process.env.REACT_APP_API_URL || "https://student-info-be.onrender.com/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const notificationService = {
  async fetchNotifications(type = "", department = "") {
    try {
      const url = new URL(`${API_URL}/notifications`);
      if (type) url.searchParams.append("type", type);
      if (department) url.searchParams.append("department", department);

      const response = await fetch(url, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData); // Debug log

      // Check if responseData has a data property
      const notifications = responseData.data || responseData;

      // Ensure we have an array to work with
      if (!Array.isArray(notifications)) {
        console.error("Notifications data is not an array:", notifications);
        return [];
      }

      // Sort notifications by createdAt
      return notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return []; // Return empty array on error
    }
  },

  async fetchSavedNotifications() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found when fetching saved notifications");
        return [];
      }

      const response = await fetch(`${API_URL}/notifications/saved`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Saved notifications error response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        if (response.status === 500) {
          console.error("Server error when fetching saved notifications");
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Saved Notifications API Response:", responseData);

      // Check if responseData has a data property
      const notifications = responseData.data || responseData;

      // Ensure we have an array to work with
      if (!Array.isArray(notifications)) {
        console.error(
          "Saved notifications data is not an array:",
          notifications
        );
        return [];
      }

      // Sort notifications by createdAt
      return notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error fetching saved notifications:", error);
      if (error.message.includes("Failed to fetch")) {
        console.error("Network error when fetching saved notifications");
      }
      return [];
    }
  },

  async saveNotification(notificationId) {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/save`,
        {
          method: "PUT",
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        if (response.status === 500) {
          console.error("Server error when saving notification");
          throw new Error("Server error when saving notification");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Save notification response:", data);
      return data;
    } catch (error) {
      console.error("Error saving notification:", error);
      throw error;
    }
  },

  async unsaveNotification(notificationId) {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/unsave`,
        {
          method: "PUT",
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        if (response.status === 500) {
          console.error("Server error when unsaving notification");
          throw new Error("Server error when unsaving notification");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Unsave notification response:", data);
      return data;
    } catch (error) {
      console.error("Error unsaving notification:", error);
      throw error;
    }
  },

  async createNotification(notificationData) {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  async updateNotification(notificationId, notificationData) {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        {
          method: "PUT",
          headers: getAuthHeader(),
          body: JSON.stringify(notificationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  },

  async deleteNotification(notificationId) {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};
