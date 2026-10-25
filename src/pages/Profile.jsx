import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update Profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileLoading(true);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/profile`,
        {
          fullName,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update AuthContext and localStorage
      login(response.data.user, token);

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      setProfileMessage(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordMessage("");

    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please fill in both password fields.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.put(
       `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordMessage(
        response.data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Password change error:", error);

      setPasswordMessage(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        color: "#fff",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "50px 20px",
        }}
      >
        {/* Page Heading */}
        <div style={{ marginBottom: "35px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            My Profile
          </h1>

          <p
            style={{
              color: "#b8b8c7",
              fontSize: "16px",
            }}
          >
            Manage your account information and password.
          </p>
        </div>

        {/* Profile Information */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "30px",
            marginBottom: "25px",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "25px",
            }}
          >
            Profile Information
          </h2>

          <form onSubmit={handleProfileUpdate}>
            {/* Full Name */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#d5d5df",
                }}
              >
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#d5d5df",
                }}
              >
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "600",
                cursor: profileLoading ? "not-allowed" : "pointer",
                opacity: profileLoading ? 0.7 : 1,
              }}
            >
              {profileLoading
                ? "Updating..."
                : "Update Profile"}
            </button>

            {profileMessage && (
              <p
                style={{
                  marginTop: "15px",
                  color: profileMessage.includes("success")
                    ? "#4ade80"
                    : "#f87171",
                }}
              >
                {profileMessage}
              </p>
            )}
          </form>
        </div>

        {/* Change Password */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "30px",
            marginBottom: "25px",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "25px",
            }}
          >
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange}>
            {/* Current Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#d5d5df",
                }}
              >
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#d5d5df",
                }}
              >
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "600",
                cursor: passwordLoading
                  ? "not-allowed"
                  : "pointer",
                opacity: passwordLoading ? 0.7 : 1,
              }}
            >
              {passwordLoading
                ? "Changing..."
                : "Change Password"}
            </button>

            {passwordMessage && (
              <p
                style={{
                  marginTop: "15px",
                  color: passwordMessage.includes("success")
                    ? "#4ade80"
                    : "#f87171",
                }}
              >
                {passwordMessage}
              </p>
            )}
          </form>
        </div>

        {/* Account / Logout */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "30px",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "10px",
            }}
          >
            Account
          </h2>

          <p
            style={{
              color: "#b8b8c7",
              marginBottom: "20px",
            }}
          >
            Sign out of your AI eBook Creator account.
          </p>

          <button
            onClick={handleLogout}
            style={{
              padding: "12px 28px",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#f87171",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;