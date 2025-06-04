import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("ProtectedRoute - Token:", token ? "exists" : "missing");
  console.log("ProtectedRoute - User:", user);

  if (!token) {
    console.log("ProtectedRoute - No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role dựa trên đường dẫn
  const path = window.location.pathname;

  // Kiểm tra cho AdminPage
  if (path === "/AdminPage" && user.role !== "admin") {
    console.log("ProtectedRoute - Not an admin, redirecting to main");
    return <Navigate to="/main" replace />;
  }

  // Kiểm tra cho CoordinatorPage
  if (path === "/CoordinatorPage" && user.role !== "coordinator") {
    console.log("ProtectedRoute - Not a coordinator, redirecting to main");
    return <Navigate to="/main" replace />;
  }

  // Kiểm tra cho MainPage (student)
  if (path === "/main" && user.role !== "student") {
    console.log(
      "ProtectedRoute - Not a student, redirecting to appropriate page"
    );
    if (user.role === "admin") {
      return <Navigate to="/AdminPage" replace />;
    } else if (user.role === "coordinator") {
      return <Navigate to="/CoordinatorPage" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;
