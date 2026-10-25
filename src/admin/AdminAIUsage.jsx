
import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  RefreshCw,
  Search,
  ShieldAlert,
  Zap,
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

  const objectKeys = ["user", "auth", "authData"];

  for (const key of objectKeys) {
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

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (milliseconds) => {
  if (milliseconds === null || milliseconds === undefined) return "—";

  return `${(Number(milliseconds) / 1000).toFixed(2)} s`;
};

const providerLabel = (provider) => {
  const labels = {
    gemini: "Gemini",
    groq: "Groq",
    none: "None",
  };

  return labels[provider] || provider || "Unknown";
};

const taskLabel = (task) => {
  const labels = {
    outline: "Outline",
    chapter: "Chapter",
  };

  return labels[task] || task || "Unknown";
};

const statusLabel = (status) => {
  if (status === "success") return "Completed";
  if (status === "failed") return "Failed";
  return status || "Unknown";
};

const getErrorMessage = (error) => {
  if (error.message === "NO_TOKEN") {
    return "Authentication token not found in localStorage. Please log in again.";
  }

  return error.message || "Something went wrong while loading AI usage.";
};

const requestJSON = async (path) => {
  const token = getToken();

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};

const cardStyle = {
  background: "#151522",
  border: "1px solid #29293d",
  borderRadius: "14px",
  padding: "20px",
  minWidth: 0,
};

const inputStyle = {
  background: "#151522",
  color: "#f4f4f5",
  border: "1px solid #343449",
  borderRadius: "9px",
  padding: "10px 12px",
  outline: "none",
  width: "100%",
  minWidth: 0,
};

const buttonStyle = {
  background: "#27243f",
  color: "#e9ddff",
  border: "1px solid #49406a",
  borderRadius: "8px",
  padding: "9px 12px",
  cursor: "pointer",
};

const AdminAIUsage = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [taskType, setTaskType] = useState("all");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");

  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch statistics from the backend.
  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setStatsLoading(true);

      try {
        const data = await requestJSON("/api/admin/ai-usage/stats");

        if (!cancelled) {
          setStats({
            ...(data.statistics || {}),
            providerStats: data.providerStats || [],
            taskStats: data.taskStats || [],
            dailyStats: data.dailyStats || [],
          });
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Fetch filtered and paginated generation history.
  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(pagination.currentPage),
          limit: String(pagination.pageSize),
          search,
          taskType,
          status,
          provider,
        });

        const data = await requestJSON(
          `/api/admin/ai-usage/history?${params.toString()}`
        );

        if (!cancelled) {
          setHistory(data.history || []);

          setPagination((previous) => ({
            ...previous,
            ...(data.pagination || {}),
          }));

          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [
    refreshKey,
    pagination.currentPage,
    pagination.pageSize,
    search,
    taskType,
    status,
    provider,
  ]);

  const statistics = stats || {};
  const dailyStats = statistics.dailyStats || [];
  const providerStats = statistics.providerStats || [];
  const taskStats = statistics.taskStats || [];

  const maxDailyRequests = Math.max(
    1,
    ...dailyStats.map((item) => Number(item.requests || 0))
  );

  const knownTokens = Number(statistics.totalKnownTokens || 0);

  const refresh = () => {
    setError("");
    setRefreshKey((value) => value + 1);
  };

  const updateFilter = (setter, value) => {
    setter(value);
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d16",
        color: "#f4f4f5",
        padding: "26px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "27px",
              margin: "0 0 8px",
              fontWeight: 750,
            }}
          >
            AI Usage Analytics
          </h1>
          <p style={{ color: "#a1a1b5", margin: 0 }}>
            Monitor real AI requests, provider usage and generation history.
          </p>
        </div>

        <button onClick={refresh} style={buttonStyle}>
          <RefreshCw
            size={15}
            style={{ verticalAlign: "middle", marginRight: "7px" }}
          />
          Refresh data
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 16px",
            border: "1px solid #7f343d",
            borderRadius: "10px",
            background: "#2b171d",
            color: "#ffb9c0",
            marginBottom: "20px",
          }}
        >
          <AlertCircle
            size={17}
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />
          {error}
          <button
            onClick={refresh}
            style={{ ...buttonStyle, marginLeft: "12px" }}
          >
            Retry
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <MetricCard
          icon={<Activity size={20} />}
          label="Total Requests"
          value={statsLoading ? "…" : formatNumber(statistics.totalRequests)}
          hint="Recorded generation attempts"
        />

        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Success Rate"
          value={
            statsLoading
              ? "…"
              : `${Number(statistics.successRate || 0).toFixed(1)}%`
          }
          hint={`${formatNumber(statistics.successfulRequests)} successful`}
        />

        <MetricCard
          icon={<ShieldAlert size={20} />}
          label="Fallback Requests"
          value={
            statsLoading ? "…" : formatNumber(statistics.fallbackRequests)
          }
          hint="Requests using fallback provider"
        />

        <MetricCard
          icon={<Database size={20} />}
          label="Known Tokens"
          value={statsLoading ? "…" : formatNumber(knownTokens)}
          hint={`${formatNumber(statistics.recordsWithTokenData)} records with token data`}
        />

        <MetricCard
          icon={<Clock size={20} />}
          label="Average Duration"
          value={
            statsLoading
              ? "…"
              : statistics.averageDurationMs == null
                ? "—"
                : `${(
                    Number(statistics.averageDurationMs) / 1000
                  ).toFixed(2)} s`
          }
          hint="Recorded generation duration"
        />

        <MetricCard
          icon={<Zap size={20} />}
          label="Unique Users"
          value={statsLoading ? "…" : formatNumber(statistics.uniqueUsers)}
          hint="Users with recorded AI requests"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "18px",
          marginBottom: "22px",
        }}
      >
        <section style={cardStyle}>
          <h2 style={sectionHeading}>
            <Cpu size={18} /> Provider Usage
          </h2>

          {statsLoading ? (
            <Muted>Loading provider statistics…</Muted>
          ) : providerStats.length === 0 ? (
            <Muted>No provider usage has been recorded yet.</Muted>
          ) : (
            providerStats.map((item) => {
              const requests = Number(item.requests || 0);
              const percent = statistics.totalRequests
                ? (requests / statistics.totalRequests) * 100
                : 0;

              return (
                <div key={item._id} style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>{providerLabel(item._id)}</strong>
                    <span style={{ color: "#b6b6c8" }}>
                      {formatNumber(requests)} requests
                    </span>
                  </div>

                  <div
                    style={{
                      height: "8px",
                      background: "#29293b",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, percent)}%`,
                        background:
                          item._id === "groq" ? "#a78bfa" : "#7c6cf2",
                        borderRadius: "10px",
                      }}
                    />
                  </div>

                  <Muted>
                    {formatNumber(item.successful)} successful ·{" "}
                    {formatNumber(item.failed)} failed
                  </Muted>
                </div>
              );
            })
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeading}>
            <BarChart3 size={18} /> Generation Types
          </h2>

          {statsLoading ? (
            <Muted>Loading generation statistics…</Muted>
          ) : taskStats.length === 0 ? (
            <Muted>No generation types have been recorded yet.</Muted>
          ) : (
            taskStats.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px 0",
                  borderBottom: "1px solid #29293d",
                }}
              >
                <div>
                  <strong>{taskLabel(item._id)}</strong>
                  <div style={{ marginTop: "5px" }}>
                    <Muted>
                      {formatNumber(item.successful)} successful ·{" "}
                      {formatNumber(item.failed)} failed
                    </Muted>
                  </div>
                </div>

                <strong style={{ fontSize: "20px" }}>
                  {formatNumber(item.requests)}
                </strong>
              </div>
            ))
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeading}>Last 7 Days</h2>

          {statsLoading ? (
            <Muted>Loading daily usage…</Muted>
          ) : dailyStats.length === 0 ? (
            <Muted>No daily usage data is available yet.</Muted>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                height: "165px",
                paddingTop: "15px",
              }}
            >
              {dailyStats.map((item) => {
                const height = Math.max(
                  5,
                  (Number(item.requests || 0) / maxDailyRequests) * 120
                );

                return (
                  <div
                    key={item._id}
                    title={`${item._id}: ${item.requests} requests`}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: "#c4b5fd",
                        fontSize: "11px",
                        marginBottom: "5px",
                      }}
                    >
                      {item.requests}
                    </div>

                    <div
                      style={{
                        height: `${height}px`,
                        background: "#7965e8",
                        borderRadius: "5px 5px 0 0",
                        maxWidth: "35px",
                        margin: "0 auto",
                      }}
                    />

                    <div
                      style={{
                        color: "#9c9cb1",
                        fontSize: "10px",
                        marginTop: "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item._id?.slice(5) || ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Muted>Counts are based on recorded AI requests.</Muted>
        </section>
      </div>

      <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #29293d" }}>
          <h2 style={{ ...sectionHeading, marginBottom: "18px" }}>
            Generation History
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "12px",
                  color: "#88889f",
                }}
              />

              <input
                style={{ ...inputStyle, paddingLeft: "35px" }}
                placeholder="Search user or eBook..."
                value={search}
                onChange={(event) =>
                  updateFilter(setSearch, event.target.value)
                }
              />
            </div>

            <select
              style={inputStyle}
              value={taskType}
              onChange={(event) =>
                updateFilter(setTaskType, event.target.value)
              }
            >
              <option value="all">All generation types</option>
              <option value="outline">Outline</option>
              <option value="chapter">Chapter</option>
            </select>

            <select
              style={inputStyle}
              value={status}
              onChange={(event) =>
                updateFilter(setStatus, event.target.value)
              }
            >
              <option value="all">All results</option>
              <option value="success">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <select
              style={inputStyle}
              value={provider}
              onChange={(event) =>
                updateFilter(setProvider, event.target.value)
              }
            >
              <option value="all">All providers</option>
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1000px",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ background: "#191927", color: "#b9b9cd" }}>
                {[
                  "Date",
                  "User",
                  "eBook",
                  "Task",
                  "Provider / Model",
                  "Result",
                  "Duration",
                  "Tokens",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan="8" style={emptyCell}>
                    Loading generation history…
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="8" style={emptyCell}>
                    No AI usage records match your filters.
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  const tokensAvailable =
                    record.promptTokens != null ||
                    record.completionTokens != null;

                  const totalTokens =
                    (Number(record.promptTokens) || 0) +
                    (Number(record.completionTokens) || 0);

                  return (
                    <tr
                      key={record._id}
                      style={{ borderTop: "1px solid #29293d" }}
                    >
                      <td style={bodyCell}>{formatDate(record.createdAt)}</td>

                      <td style={bodyCell}>
                        <div style={{ fontWeight: 600 }}>
                          {record.userId?.fullName ||
                            record.userId?.email ||
                            "Unknown user"}
                        </div>

                        {record.userId?.email &&
                          record.userId?.fullName && (
                            <Muted>{record.userId.email}</Muted>
                          )}
                      </td>

                      <td style={bodyCell}>
                        {record.bookId?.title || "—"}
                      </td>

                      <td style={bodyCell}>{taskLabel(record.taskType)}</td>

                      <td style={bodyCell}>
                        <div>{providerLabel(record.provider)}</div>
                        <Muted>{record.model || "Model not recorded"}</Muted>

                        {record.fallbackUsed && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "5px",
                              padding: "3px 7px",
                              background: "#30264b",
                              color: "#d5c6ff",
                              borderRadius: "5px",
                              fontSize: "11px",
                            }}
                          >
                            Fallback used
                          </span>
                        )}
                      </td>

                      <td style={bodyCell}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            color:
                              record.status === "success"
                                ? "#86efac"
                                : "#fca5a5",
                            background:
                              record.status === "success"
                                ? "#143226"
                                : "#3b2026",
                          }}
                        >
                          {statusLabel(record.status)}
                        </span>
                      </td>

                      <td style={bodyCell}>
                        {formatDuration(record.durationMs)}
                      </td>

                      <td style={bodyCell}>
                        {tokensAvailable ? formatNumber(totalTokens) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            padding: "16px 20px",
            borderTop: "1px solid #29293d",
          }}
        >
          <Muted>
            {formatNumber(pagination.totalRecords)} records · Page{" "}
            {pagination.currentPage} of {Math.max(1, pagination.totalPages)}
          </Muted>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{
                ...buttonStyle,
                opacity: pagination.currentPage <= 1 ? 0.45 : 1,
              }}
              disabled={pagination.currentPage <= 1 || historyLoading}
              onClick={() =>
                setPagination((previous) => ({
                  ...previous,
                  currentPage: previous.currentPage - 1,
                }))
              }
            >
              <ChevronLeft size={15} style={{ verticalAlign: "middle" }} />{" "}
              Previous
            </button>

            <button
              style={{
                ...buttonStyle,
                opacity:
                  pagination.currentPage >= pagination.totalPages
                    ? 0.45
                    : 1,
              }}
              disabled={
                pagination.currentPage >= pagination.totalPages ||
                historyLoading
              }
              onClick={() =>
                setPagination((previous) => ({
                  ...previous,
                  currentPage: previous.currentPage + 1,
                }))
              }
            >
              Next{" "}
              <ChevronRight size={15} style={{ verticalAlign: "middle" }} />
            </button>
          </div>
        </div>
      </section>

      <p
        style={{
          color: "#88889f",
          fontSize: "12px",
          marginTop: "16px",
          lineHeight: 1.6,
        }}
      >
        Token totals include only records with available token metadata.
        Missing token values are shown as unavailable, not zero. Provider
        costs are not displayed because actual billing rates have not been
        configured.
      </p>
    </div>
  );
};

const MetricCard = ({ icon, label, value, hint }) => (
  <div style={cardStyle}>
    <div
      style={{
        color: "#bbaaff",
        marginBottom: "13px",
        display: "flex",
        alignItems: "center",
        gap: "9px",
      }}
    >
      {icon}
      <span style={{ color: "#b5b5c8", fontSize: "13px" }}>{label}</span>
    </div>

    <div style={{ fontSize: "27px", fontWeight: 750, marginBottom: "7px" }}>
      {value}
    </div>

    <div style={{ color: "#9292a9", fontSize: "12px" }}>{hint}</div>
  </div>
);

const sectionHeading = {
  fontSize: "17px",
  fontWeight: 700,
  margin: "0 0 20px",
  display: "flex",
  alignItems: "center",
  gap: "9px",
};

const Muted = ({ children }) => (
  <div style={{ color: "#9292a9", fontSize: "12px", marginTop: "6px" }}>
    {children}
  </div>
);

const emptyCell = {
  padding: "35px 16px",
  textAlign: "center",
  color: "#a1a1b5",
};

const bodyCell = {
  padding: "15px 16px",
  verticalAlign: "top",
  color: "#e4e4ed",
};

export default AdminAIUsage;
