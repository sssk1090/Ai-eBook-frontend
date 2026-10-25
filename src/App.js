import React, {
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";

/*
====================================================
USER PAGES - LAZY LOADED
====================================================
*/

const Home = lazy(() => import("./pages/Home"));

const Login = lazy(() => import("./pages/Login"));

const Signup = lazy(() => import("./pages/Signup"));

const Dashboard = lazy(
  () => import("./pages/Dashboard")
);

const CreateBook = lazy(
  () => import("./pages/CreateBook")
);

const Editor = lazy(
  () => import("./pages/Editor")
);

const Preview = lazy(
  () => import("./pages/Preview")
);

const Explore = lazy(
  () => import("./pages/Explore")
);

const Profile = lazy(
  () => import("./pages/Profile")
);

/*
====================================================
ADMIN PAGES - LAZY LOADED
====================================================
*/

const AdminLayout = lazy(
  () => import("./admin/AdminLayout")
);

const AdminDashboard = lazy(
  () => import("./admin/AdminDashboard")
);

const AdminUsers = lazy(
  () => import("./admin/AdminUsers")
);

const AdminBooks = lazy(
  () => import("./admin/AdminBooks")
);

const AdminAIUsage = lazy(
  () => import("./admin/AdminAIUsage")
);

const AdminAnalytics = lazy(
  () => import("./admin/AdminAnalytics")
);

const AdminSettings = lazy(
  () => import("./admin/AdminSettings")
);

const AdminRoute = lazy(
  () => import("./admin/AdminRoute")
);

const AdminPaymentAnalysis = lazy(
  () => import("./admin/AdminPaymentAnalysis")
);

/*
====================================================
APP
====================================================
*/

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <BrowserRouter>

          <Suspense
            fallback={
              <div
                style={{
                  minHeight: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#0f0f1a",
                  color: "white",
                  fontSize: "18px",
                }}
              >
                Loading...
              </div>
            }
          >

            <Routes>

              {/* =====================================
                  USER ROUTES
              ===================================== */}

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/signup"
                element={<Signup />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/create-book"
                element={<CreateBook />}
              />

              <Route
                path="/editor"
                element={<Editor />}
              />

              <Route
                path="/preview/:id"
                element={<Preview />}
              />

              <Route
                path="/explore"
                element={<Explore />}
              />

              <Route
                path="/profile"
                element={<Profile />}
              />

              {/* =====================================
                  ADMIN ROUTES
              ===================================== */}

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >

                <Route
                  index
                  element={<AdminDashboard />}
                />

                <Route
                  path="users"
                  element={<AdminUsers />}
                />

                <Route
                  path="books"
                  element={<AdminBooks />}
                />

                <Route
                  path="ai-usage"
                  element={<AdminAIUsage />}
                />

                <Route
                  path="analytics"
                  element={<AdminAnalytics />}
                />

                <Route
                  path="payment-analysis"
                  element={<AdminPaymentAnalysis />}
                />

                <Route
                  path="settings"
                  element={<AdminSettings />}
                />

              </Route>

            </Routes>

          </Suspense>

        </BrowserRouter>
      </BookProvider>
    </AuthProvider>
  );
}

export default App;