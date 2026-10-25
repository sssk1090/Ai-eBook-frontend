import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  User,
  Sparkles,
  BookOpen,
  Bell,
  Shield,
  Save,
  RefreshCcw,
  CheckCircle,
  Lock,
  Mail,
  Globe,
  Wrench,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DEFAULTS = {
  general: {
    platformName: "AI eBook Creator",
    platformEmail: "admin@aebook.com",
    timezone: "Asia/Kolkata",
    language: "English",
  },
  ai: {
    model: "Gemini",
    maxTokens: "8000",
    temperature: "0.7",
    chapterWordLimit: "700",
    enableAI: true,
  },
  books: {
    defaultVisibility: "Private",
    maxChapters: "20",
    allowExport: true,
    allowPublicBooks: true,
  },
  users: {
    allowRegistration: true,
    requireEmailVerification: false,
    allowProfileEditing: true,
  },
  notifications: {
    newUserNotification: true,
    newBookNotification: true,
    aiFailureNotification: true,
    adminEmailNotification: true,
  },
  security: {
    requireStrongPassword: true,
    enableTwoFactor: false,
    sessionTimeout: "60",
  },
};

function AdminSettings() {
  const { token, user, login } = useAuth();

  const [activeSection, setActiveSection] = useState("general");

  const [generalSettings, setGeneralSettings] = useState(DEFAULTS.general);
  const [aiSettings, setAiSettings] = useState(DEFAULTS.ai);
  const [bookSettings, setBookSettings] = useState(DEFAULTS.books);
  const [userSettings, setUserSettings] = useState(DEFAULTS.users);
  const [notificationSettings, setNotificationSettings] = useState(
    DEFAULTS.notifications
  );
  const [securitySettings, setSecuritySettings] = useState(
    DEFAULTS.security
  );

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const sections = [
    { id: "general", label: "General", icon: <Settings size={17} /> },
    { id: "profile", label: "Admin Profile", icon: <User size={17} /> },
    { id: "ai", label: "AI Configuration", icon: <Sparkles size={17} /> },
    { id: "books", label: "eBook Settings", icon: <BookOpen size={17} /> },
    { id: "users", label: "User Settings", icon: <Users size={17} /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={17} />,
    },
    { id: "security", label: "Security", icon: <Shield size={17} /> },
  ];

  // API request helper
  // API request helper
const request = useCallback(async (url, options = {}) => {
  if (!token) {
    throw new Error("Your login token is missing. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}, [token]);

  // Load settings into React state
  const applySettings = useCallback((settings = {}) => {
    setGeneralSettings({
      platformName:
        settings.platformName ?? DEFAULTS.general.platformName,
      platformEmail:
        settings.platformEmail ?? DEFAULTS.general.platformEmail,
      timezone: settings.timezone ?? DEFAULTS.general.timezone,
      language: settings.language ?? DEFAULTS.general.language,
    });

    setAiSettings({
      model: settings.aiModel ?? DEFAULTS.ai.model,
      maxTokens: String(
        settings.maxTokens ?? DEFAULTS.ai.maxTokens
      ),
      temperature: String(
        settings.temperature ?? DEFAULTS.ai.temperature
      ),
      chapterWordLimit: String(
        settings.chapterWordLimit ?? DEFAULTS.ai.chapterWordLimit
      ),
      enableAI: settings.enableAI ?? DEFAULTS.ai.enableAI,
    });

    setBookSettings({
      defaultVisibility:
        settings.defaultVisibility ?? DEFAULTS.books.defaultVisibility,
      maxChapters: String(
        settings.maxChapters ?? DEFAULTS.books.maxChapters
      ),
      allowExport:
        settings.allowExport ?? DEFAULTS.books.allowExport,
      allowPublicBooks:
        settings.allowPublicBooks ?? DEFAULTS.books.allowPublicBooks,
    });

    setUserSettings({
      allowRegistration:
        settings.allowRegistration ?? DEFAULTS.users.allowRegistration,
      requireEmailVerification:
        settings.requireEmailVerification ??
        DEFAULTS.users.requireEmailVerification,
      allowProfileEditing:
        settings.allowProfileEditing ??
        DEFAULTS.users.allowProfileEditing,
    });

    setNotificationSettings({
      newUserNotification:
        settings.newUserNotification ??
        DEFAULTS.notifications.newUserNotification,
      newBookNotification:
        settings.newBookNotification ??
        DEFAULTS.notifications.newBookNotification,
      aiFailureNotification:
        settings.aiFailureNotification ??
        DEFAULTS.notifications.aiFailureNotification,
      adminEmailNotification:
        settings.adminEmailNotification ??
        DEFAULTS.notifications.adminEmailNotification,
    });

    setSecuritySettings({
      requireStrongPassword:
        settings.requireStrongPassword ??
        DEFAULTS.security.requireStrongPassword,
      enableTwoFactor:
        settings.enableTwoFactor ??
        DEFAULTS.security.enableTwoFactor,
      sessionTimeout: String(
        settings.sessionTimeout ?? DEFAULTS.security.sessionTimeout
      ),
    });

    setMaintenanceMode(settings.maintenanceMode ?? false);
}, []);

  // Load platform settings from MongoDB
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        setSettingsError("");

        const data = await request("/api/admin/settings");

        if (!cancelled) {
          applySettings(data.settings);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load settings error:", error);
          setSettingsError(
            error.message || "Failed to load settings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSettings(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [request, applySettings]);

  // Load administrator profile
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");

        const data = await request("/api/auth/me");

        if (!cancelled) {
          setProfile({
            fullName: data.user?.fullName || "",
            email: data.user?.email || "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load profile error:", error);
          setProfileError(
            error.message || "Failed to load profile."
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [request]);

  // Save all platform settings
  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      setSaved(false);
      setSettingsError("");

      const chapterWordLimit = Number(
        aiSettings.chapterWordLimit
      );

      if (
        !Number.isInteger(chapterWordLimit) ||
        chapterWordLimit < 100 ||
        chapterWordLimit > 5000
      ) {
        throw new Error(
          "Chapter Word Limit must be between 100 and 5000."
        );
      }

      const maxTokens = Number(aiSettings.maxTokens);
      const temperature = Number(aiSettings.temperature);

      if (
        !Number.isInteger(maxTokens) ||
        maxTokens < 100 ||
        maxTokens > 10000
      ) {
        throw new Error(
          "Maximum Tokens must be between 100 and 10000."
        );
      }

      if (
        !Number.isFinite(temperature) ||
        temperature < 0 ||
        temperature > 2
      ) {
        throw new Error(
          "Temperature must be between 0 and 2."
        );
      }

      const payload = {
        ...generalSettings,

        aiModel: aiSettings.model,
        maxTokens,
        temperature,
        chapterWordLimit,
        enableAI: aiSettings.enableAI,

        ...bookSettings,
        maxChapters: Number(bookSettings.maxChapters),

        ...userSettings,
        ...notificationSettings,

        ...securitySettings,
        sessionTimeout: Number(securitySettings.sessionTimeout),

        maintenanceMode,
      };

      const data = await request("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      applySettings(data.settings);
      setSaved(true);
    } catch (error) {
      console.error("Save settings error:", error);
      setSettingsError(
        error.message || "Failed to save settings."
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // Reset settings to backend defaults
  const resetSettings = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all platform settings to their defaults?"
    );

    if (!confirmed) return;

    try {
      setSavingSettings(true);
      setSaved(false);
      setSettingsError("");

      const data = await request("/api/admin/settings/reset", {
        method: "POST",
      });

      applySettings(data.settings);
      setSaved(true);
    } catch (error) {
      console.error("Reset settings error:", error);
      setSettingsError(
        error.message || "Failed to reset settings."
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // Save administrator profile
  const saveProfile = async () => {
    try {
      setProfileSaving(true);
      setProfileMessage("");
      setProfileError("");

      if (!profile.fullName.trim() || !profile.email.trim()) {
        throw new Error("Full name and email are required.");
      }

      const data = await request("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          email: profile.email.trim(),
        }),
      });

      const updatedProfile = {
        fullName: data.user.fullName,
        email: data.user.email,
      };

      setProfile(updatedProfile);

      if (login) {
        login(
          {
            ...(user || {}),
            ...data.user,
          },
          token
        );
      }

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);
      setProfileError(
        error.message || "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Update one field in a settings group
  const updateField = (setter, current, field, value) => {
    setter({
      ...current,
      [field]: value,
    });

    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Settings size={22} className="text-violet-400" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Settings
              </h1>
              <p className="text-slate-400 mt-1">
                Manage platform, AI, user and security settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetSettings}
              disabled={savingSettings || loadingSettings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 disabled:opacity-50 transition text-sm"
            >
              <RefreshCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              onClick={saveSettings}
              disabled={savingSettings || loadingSettings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition text-sm font-medium"
            >
              <Save size={16} />
              {savingSettings ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {loadingSettings && (
          <div className="mt-5 text-sm text-slate-400">
            Loading settings from the server...
          </div>
        )}

        {settingsError && (
          <div className="mt-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {settingsError}
          </div>
        )}

        {saved && (
          <div className="mt-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle size={17} />
            Settings saved successfully.
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 h-fit">
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  activeSection === section.id
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-slate-800">
            <p className="px-3 mb-3 text-xs uppercase tracking-wider text-slate-600">
              System
            </p>

            <button
              type="button"
              onClick={() => {
                setMaintenanceMode((previous) => !previous);
                setSaved(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                maintenanceMode
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Wrench size={17} />
              Maintenance Mode
            </button>
          </div>
        </div>

        {/* Settings content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7">
          {/* GENERAL */}
          {activeSection === "general" && (
            <SettingsSection
              icon={<Settings size={20} />}
              title="General Settings"
              description="Configure basic information about your platform."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Platform Name"
                  value={generalSettings.platformName}
                  onChange={(v) =>
                    updateField(
                      setGeneralSettings,
                      generalSettings,
                      "platformName",
                      v
                    )
                  }
                  icon={<Globe size={16} />}
                />

                <InputField
                  label="Platform Email"
                  value={generalSettings.platformEmail}
                  onChange={(v) =>
                    updateField(
                      setGeneralSettings,
                      generalSettings,
                      "platformEmail",
                      v
                    )
                  }
                  icon={<Mail size={16} />}
                />

                <SelectField
                  label="Timezone"
                  value={generalSettings.timezone}
                  onChange={(v) =>
                    updateField(
                      setGeneralSettings,
                      generalSettings,
                      "timezone",
                      v
                    )
                  }
                  options={[
                    "Asia/Kolkata",
                    "UTC",
                    "America/New_York",
                    "Europe/London",
                  ]}
                />

                <SelectField
                  label="Language"
                  value={generalSettings.language}
                  onChange={(v) =>
                    updateField(
                      setGeneralSettings,
                      generalSettings,
                      "language",
                      v
                    )
                  }
                  options={["English", "Hindi", "Gujarati"]}
                />
              </div>
            </SettingsSection>
          )}

          {/* ADMIN PROFILE */}
          {activeSection === "profile" && (
            <SettingsSection
              icon={<User size={20} />}
              title="Admin Profile"
              description="Manage your administrator account information."
            >
              {profileLoading ? (
                <p className="text-sm text-slate-400">
                  Loading administrator profile...
                </p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-5 mb-7">
                    <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center text-2xl font-bold">
                      {profile.fullName
                        ? profile.fullName.charAt(0).toUpperCase()
                        : "A"}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">
                        {profile.fullName || "Administrator"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {profile.email}
                      </p>

                      <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs">
                        {user?.role === "admin"
                          ? "Administrator"
                          : user?.role || "Account"}
                      </span>
                    </div>
                  </div>

                  {profileError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {profileError}
                    </div>
                  )}

                  {profileMessage && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                      <CheckCircle size={17} className="inline mr-2" />
                      {profileMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Full Name"
                      value={profile.fullName}
                      onChange={(value) => {
                        setProfile((previous) => ({
                          ...previous,
                          fullName: value,
                        }));
                        setProfileMessage("");
                      }}
                      icon={<User size={16} />}
                    />

                    <InputField
                      label="Email Address"
                      value={profile.email}
                      onChange={(value) => {
                        setProfile((previous) => ({
                          ...previous,
                          email: value,
                        }));
                        setProfileMessage("");
                      }}
                      icon={<Mail size={16} />}
                    />
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={profileSaving}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium transition"
                    >
                      {profileSaving ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </>
              )}
            </SettingsSection>
          )}

          {/* AI CONFIGURATION */}
          {activeSection === "ai" && (
            <SettingsSection
              icon={<Sparkles size={20} />}
              title="AI Configuration"
              description="Configure the AI generation settings used by your platform."
            >
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={20}
                    className="text-violet-400 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-medium text-violet-300">
                      AI Provider
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      AI provider keys must remain on the backend.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField
                  label="AI Model"
                  value={aiSettings.model}
                  onChange={(v) =>
                    updateField(setAiSettings, aiSettings, "model", v)
                  }
                  options={["Gemini", "Gemini Flash"]}
                />

                <InputField
                  label="Maximum Tokens"
                  type="number"
                  value={aiSettings.maxTokens}
                  onChange={(v) =>
                    updateField(
                      setAiSettings,
                      aiSettings,
                      "maxTokens",
                      v
                    )
                  }
                  icon={<Zap size={16} />}
                  min="100"
                  max="10000"
                  step="100"
                />

                <InputField
                  label="Temperature"
                  type="number"
                  value={aiSettings.temperature}
                  onChange={(v) =>
                    updateField(
                      setAiSettings,
                      aiSettings,
                      "temperature",
                      v
                    )
                  }
                  icon={<Sparkles size={16} />}
                  min="0"
                  max="2"
                  step="0.1"
                />

                {/* NEW: CHAPTER WORD LIMIT */}
                <InputField
                  label="Chapter Word Limit"
                  type="number"
                  value={aiSettings.chapterWordLimit}
                  onChange={(v) =>
                    updateField(
                      setAiSettings,
                      aiSettings,
                      "chapterWordLimit",
                      v
                    )
                  }
                  icon={<BookOpen size={16} />}
                  min="100"
                  max="5000"
                  step="100"
                />
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Set the target length for each AI-generated chapter.
                Allowed range: 100–5000 words.
              </p>

              <div className="mt-6">
                <Toggle
                  label="Enable AI Generation"
                  description="Allow users to generate eBooks using AI."
                  enabled={aiSettings.enableAI}
                  onChange={(v) =>
                    updateField(
                      setAiSettings,
                      aiSettings,
                      "enableAI",
                      v
                    )
                  }
                />
              </div>
            </SettingsSection>
          )}

          {/* EBOOK SETTINGS */}
          {activeSection === "books" && (
            <SettingsSection
              icon={<BookOpen size={20} />}
              title="eBook Settings"
              description="Control how users create and publish eBooks."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField
                  label="Default Book Visibility"
                  value={bookSettings.defaultVisibility}
                  onChange={(v) =>
                    updateField(
                      setBookSettings,
                      bookSettings,
                      "defaultVisibility",
                      v
                    )
                  }
                  options={["Private", "Public"]}
                />

                <InputField
                  label="Maximum Chapters"
                  type="number"
                  value={bookSettings.maxChapters}
                  onChange={(v) =>
                    updateField(
                      setBookSettings,
                      bookSettings,
                      "maxChapters",
                      v
                    )
                  }
                  icon={<BookOpen size={16} />}
                  min="1"
                  max="100"
                  step="1"
                />
              </div>

              <div className="mt-6 space-y-2">
                <Toggle
                  label="Allow Public Books"
                  description="Allow users to publish eBooks to the Explore section."
                  enabled={bookSettings.allowPublicBooks}
                  onChange={(v) =>
                    updateField(
                      setBookSettings,
                      bookSettings,
                      "allowPublicBooks",
                      v
                    )
                  }
                />

                <Toggle
                  label="Allow eBook Export"
                  description="Allow users to export their generated eBooks."
                  enabled={bookSettings.allowExport}
                  onChange={(v) =>
                    updateField(
                      setBookSettings,
                      bookSettings,
                      "allowExport",
                      v
                    )
                  }
                />
              </div>
            </SettingsSection>
          )}

          {/* USER SETTINGS */}
          {activeSection === "users" && (
            <SettingsSection
              icon={<Users size={20} />}
              title="User Settings"
              description="Control user registration and account features."
            >
              <div className="space-y-2">
                <Toggle
                  label="Allow New Registrations"
                  description="Allow new users to create accounts."
                  enabled={userSettings.allowRegistration}
                  onChange={(v) =>
                    updateField(
                      setUserSettings,
                      userSettings,
                      "allowRegistration",
                      v
                    )
                  }
                />

                <Toggle
                  label="Require Email Verification"
                  description="Users must verify their email before accessing the platform."
                  enabled={userSettings.requireEmailVerification}
                  onChange={(v) =>
                    updateField(
                      setUserSettings,
                      userSettings,
                      "requireEmailVerification",
                      v
                    )
                  }
                />

                <Toggle
                  label="Allow Profile Editing"
                  description="Allow users to update their profile information."
                  enabled={userSettings.allowProfileEditing}
                  onChange={(v) =>
                    updateField(
                      setUserSettings,
                      userSettings,
                      "allowProfileEditing",
                      v
                    )
                  }
                />
              </div>
            </SettingsSection>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <SettingsSection
              icon={<Bell size={20} />}
              title="Notification Settings"
              description="Choose which platform events should generate notifications."
            >
              <div className="space-y-2">
                <Toggle
                  label="New User Notification"
                  description="Notify administrators when a new user registers."
                  enabled={notificationSettings.newUserNotification}
                  onChange={(v) =>
                    updateField(
                      setNotificationSettings,
                      notificationSettings,
                      "newUserNotification",
                      v
                    )
                  }
                />

                <Toggle
                  label="New eBook Notification"
                  description="Notify administrators when a new eBook is created."
                  enabled={notificationSettings.newBookNotification}
                  onChange={(v) =>
                    updateField(
                      setNotificationSettings,
                      notificationSettings,
                      "newBookNotification",
                      v
                    )
                  }
                />

                <Toggle
                  label="AI Failure Notification"
                  description="Notify administrators when AI generation fails."
                  enabled={notificationSettings.aiFailureNotification}
                  onChange={(v) =>
                    updateField(
                      setNotificationSettings,
                      notificationSettings,
                      "aiFailureNotification",
                      v
                    )
                  }
                />

                <Toggle
                  label="Admin Email Notifications"
                  description="Send important platform notifications to the admin email."
                  enabled={notificationSettings.adminEmailNotification}
                  onChange={(v) =>
                    updateField(
                      setNotificationSettings,
                      notificationSettings,
                      "adminEmailNotification",
                      v
                    )
                  }
                />
              </div>
            </SettingsSection>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <SettingsSection
              icon={<Shield size={20} />}
              title="Security Settings"
              description="Configure account and authentication security."
            >
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                <div className="flex items-start gap-3">
                  <Lock
                    size={19}
                    className="text-amber-400 mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-medium text-amber-300">
                      Security Configuration
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      These options are saved, but must be enforced by
                      the corresponding backend authentication logic.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Toggle
                  label="Require Strong Passwords"
                  description="Require users to use stronger passwords."
                  enabled={securitySettings.requireStrongPassword}
                  onChange={(v) =>
                    updateField(
                      setSecuritySettings,
                      securitySettings,
                      "requireStrongPassword",
                      v
                    )
                  }
                />

                <Toggle
                  label="Two-Factor Authentication"
                  description="Require an additional authentication step for administrator accounts."
                  enabled={securitySettings.enableTwoFactor}
                  onChange={(v) =>
                    updateField(
                      setSecuritySettings,
                      securitySettings,
                      "enableTwoFactor",
                      v
                    )
                  }
                />
              </div>

              <div className="mt-6 max-w-md">
                <SelectField
                  label="Session Timeout"
                  value={securitySettings.sessionTimeout}
                  onChange={(v) =>
                    updateField(
                      setSecuritySettings,
                      securitySettings,
                      "sessionTimeout",
                      v
                    )
                  }
                  options={["15", "30", "60", "120"]}
                  formatOption={(v) => `${v} minutes`}
                />
              </div>
            </SettingsSection>
          )}
        </div>
      </div>

      {/* Maintenance mode notice */}
      {maintenanceMode && (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Wrench
              size={21}
              className="text-amber-400 mt-0.5"
            />

            <div>
              <h3 className="font-semibold text-amber-300">
                Maintenance Mode Enabled
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                This preference is saved. Maintenance restrictions still
                need to be implemented in the backend.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsSection({ icon, title, description, children }) {
  return (
    <div>
      <div className="flex items-start gap-3 pb-6 border-b border-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  min,
  max,
  step,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>

        <input
          type={type}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500 transition"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  formatOption = (option) => option,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500 transition"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 p-4 rounded-xl border border-slate-800 hover:bg-slate-950 transition">
      <div>
        <p className="text-sm font-medium text-slate-200">
          {label}
        </p>

        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition ${
          enabled ? "bg-violet-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default AdminSettings;