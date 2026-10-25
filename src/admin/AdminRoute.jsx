import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait until AuthContext checks localStorage
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>

          <p className="text-slate-400">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin
  return children;
}

export default AdminRoute;