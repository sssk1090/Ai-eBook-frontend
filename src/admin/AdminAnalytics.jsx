
import React, { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  Eye,
  Sparkles,
  Calendar,
  Activity,
  Trophy,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  LockKeyhole,
  Globe,
} from "lucide-react";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const getToken = () => {
  const directKeys = ["token", "authToken", "jwtToken"];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  for (const key of ["user", "auth", "authData"]) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed?.token) return parsed.token;
      if (parsed?.authToken) return parsed.authToken;
      if (parsed?.jwtToken) return parsed.jwtToken;
      if (parsed?.user?.token) return parsed.user.token;
    } catch {
      // Ignore values that are not JSON.
    }
  }

  return null;
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatDateLabel = (date, range) => {
  if (!date) return "";

  const parts = date.split("-");

  if (range === "7d" || range === "30d") {
    return `${parts[2]}/${parts[1]}`;
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${monthNames[Number(parts[1]) - 1]} ${parts[0].slice(2)}`;
};

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please log in again."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/analytics?range=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }, [timeRange]);

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAnalytics();

        if (!cancelled) {
          setAnalytics(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load analytics.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [fetchAnalytics, refreshKey]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const statistics = analytics?.statistics || {};
  const userGrowth = analytics?.userGrowth || [];
  const ebookGrowth = analytics?.ebookGrowth || [];
  const viewsGrowth = analytics?.viewsByBookCreation || [];
  const visibilityStats = analytics?.visibilityStats || [];
  const topBooks = analytics?.topBooks || [];
  const activeUsers = analytics?.activeUsers || [];
  const activity = analytics?.activity || {};

  const visibilityTotal = visibilityStats.reduce(
    (sum, item) => sum + Number(item.books || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BarChart3 size={22} className="text-violet-400" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Analytics
              </h1>
              <p className="text-slate-400 mt-1">
                Track platform growth, engagement and content performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3">
              <Calendar size={17} className="text-slate-500" />

              <select
                value={timeRange}
                onChange={(event) => setTimeRange(event.target.value)}
                className="bg-transparent py-3 pr-3 text-sm text-slate-300 outline-none"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
              </select>
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-3 rounded-xl text-sm transition"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Unable to load analytics</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="text-sm underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !analytics && (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
          <LoaderCircle size={23} className="animate-spin" />
          Loading analytics from the database...
        </div>
      )}

      {/* Analytics content */}
      {analytics && (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <AnalyticsCard
              icon={<Users size={21} />}
              label="Total Users"
              value={statistics.totalUsers}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <AnalyticsCard
              icon={<BookOpen size={21} />}
              label="Total eBooks"
              value={statistics.totalBooks}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <AnalyticsCard
              icon={<Eye size={21} />}
              label="Total Views"
              value={statistics.totalViews}
              iconClass="bg-emerald-500/10 text-emerald-400"
            />

            <AnalyticsCard
              icon={<Sparkles size={21} />}
              label="AI Generations"
              value={statistics.totalAIGenerations}
              iconClass="bg-amber-500/10 text-amber-400"
            />
          </div>

          {/* Growth charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="font-semibold text-lg">User Growth</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                New registrations by period
              </p>

              <GrowthChart
                data={userGrowth}
                valueKey="users"
                range={timeRange}
                emptyMessage="No new registrations in this period."
              />
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="font-semibold text-lg">eBook Growth</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Newly created eBooks by period
              </p>

              <GrowthChart
                data={ebookGrowth}
                valueKey="books"
                range={timeRange}
                emptyMessage="No eBooks created in this period."
              />
            </section>
          </div>

          {/* Views and visibility */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <section className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="font-semibold text-lg">Views by eBook Creation Period</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Current view totals for eBooks created in each period
              </p>

              <GrowthChart
                data={viewsGrowth}
                valueKey="views"
                range={timeRange}
                emptyMessage="No view data is available for this period."
              />
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={18} className="text-violet-400" />
                <h2 className="font-semibold text-lg">eBook Visibility</h2>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                Public and private content distribution
              </p>

              {visibilityStats.length === 0 ? (
                <EmptyState message="No visibility data available." />
              ) : (
                <div className="space-y-6">
                  {visibilityStats.map((item) => {
                    const percentage = visibilityTotal
                      ? (Number(item.books || 0) / visibilityTotal) * 100
                      : 0;

                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 text-sm text-slate-300">
                            {item.name === "Public" ? (
                              <Globe size={15} className="text-emerald-400" />
                            ) : (
                              <LockKeyhole size={15} className="text-amber-400" />
                            )}
                            {item.name}
                          </span>

                          <span className="text-sm font-medium">
                            {formatNumber(item.books)}
                          </span>
                        </div>

                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.name === "Public"
                                ? "bg-emerald-500"
                                : "bg-violet-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          {percentage.toFixed(1)}% of all eBooks
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-sm">
                <span className="text-slate-400">Total visibility count</span>
                <span className="font-semibold">
                  {formatNumber(visibilityTotal)}
                </span>
              </div>
            </section>
          </div>

          {/* Top books and active users */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={18} className="text-amber-400" />
                <h2 className="font-semibold text-lg">
                  Top Performing eBooks
                </h2>
              </div>

              <p className="text-sm text-slate-500 mb-5">
                eBooks ranked by recorded views
              </p>

              {topBooks.length === 0 ? (
                <EmptyState message="No eBooks found." />
              ) : (
                <div className="space-y-3">
                  {topBooks.map((book, index) => (
                    <div
                      key={book._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-400">
                        {index + 1}
                      </div>

                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <BookOpen size={17} className="text-violet-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {book.title || "Untitled eBook"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          By {book.author || "Unknown author"} ·{" "}
                          {formatNumber(book.chapters)} chapters
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-sm text-slate-300">
                          <Eye size={14} />
                          {formatNumber(book.views)}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-blue-400" />
                <h2 className="font-semibold text-lg">Most Active Users</h2>
              </div>

              <p className="text-sm text-slate-500 mb-5">
                Users ranked by recorded AI generation requests
              </p>

              {activeUsers.length === 0 ? (
                <EmptyState message="No user-linked AI usage has been recorded." />
              ) : (
                <div className="space-y-3">
                  {activeUsers.map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 shrink-0">
                          {index + 1}
                        </div>

                        <div className="w-9 h-9 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-semibold shrink-0">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email || "No email available"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-slate-200">
                          {formatNumber(user.generations)}
                        </p>
                        <p className="text-xs text-slate-500">
                          AI requests
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Today's activity */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-violet-400" />
              <div>
                <h2 className="font-semibold text-lg">Today's Activity</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Recorded activity since midnight UTC
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActivityCard
                icon={<BookOpen size={20} />}
                label="eBooks Created Today"
                value={activity.booksCreatedToday}
              />

              <ActivityCard
                icon={<Sparkles size={20} />}
                label="AI Requests Today"
                value={activity.aiGenerationsToday}
              />
            </div>
          </section>
        </div>
      )}

      <p className="text-xs text-slate-600 mt-6 leading-relaxed">
        All figures are based on available database records. Historical view
        events, user login activity, session duration, and eBook categories
        are not available in the current data model.
      </p>
    </div>
  );
};

function AnalyticsCard({ icon, label, value, iconClass }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-500 mt-5">{label}</p>

      <p className="text-2xl font-bold text-white mt-1">
        {value == null ? "—" : formatNumber(value)}
      </p>
    </div>
  );
}

function GrowthChart({ data, valueKey, range, emptyMessage }) {
  const maxValue = Math.max(
    1,
    ...data.map((item) => Number(item[valueKey] || 0))
  );

  if (!data.length) {
    return <EmptyState message={emptyMessage} />;
  }

  const compact = data.length > 12;

  return (
    <div className="h-64 flex items-end gap-1 sm:gap-2 overflow-x-auto">
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        const height = value === 0 ? 2 : Math.max(5, (value / maxValue) * 100);

        return (
          <div
            key={item.date}
            title={`${item.date}: ${formatNumber(value)}`}
            className="flex-1 min-w-[12px] h-full flex flex-col items-center justify-end"
          >
            <span className="text-[10px] sm:text-xs text-slate-500 mb-2">
              {formatNumber(value)}
            </span>

            <div className="w-full max-w-[45px] h-48 flex items-end">
              <div
                className="w-full rounded-t-md bg-violet-500/70 hover:bg-violet-500 transition-colors"
                style={{ height: `${height}%` }}
              />
            </div>

            <span className="text-[9px] sm:text-xs text-slate-500 mt-3 whitespace-nowrap">
              {compact && range !== "7d" && range !== "30d"
                ? item.date
                : formatDateLabel(item.date, range)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ActivityCard({ icon, label, value }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
        {icon}
      </div>

      <p className="text-sm text-slate-500 mt-4">{label}</p>

      <p className="text-xl font-bold text-white mt-1">
        {value == null ? "—" : formatNumber(value)}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center text-center text-sm text-slate-500 min-h-24">
      {message}
    </div>
  );
}

export default AdminAnalytics;
