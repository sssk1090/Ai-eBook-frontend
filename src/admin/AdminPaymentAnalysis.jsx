
import React, { useCallback, useEffect, useState } from "react";
import {
  IndianRupee,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  FileText,
  BookOpen,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  CalendarDays,
  CreditCard,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const getToken = () => {
  for (const key of ["token", "authToken", "jwtToken"]) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  for (const key of ["user", "auth", "authData"]) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);
      const token =
        parsed?.token ||
        parsed?.authToken ||
        parsed?.jwtToken ||
        parsed?.user?.token;

      if (token) return token;
    } catch {
      // Ignore non-JSON localStorage values.
    }
  }

  return null;
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

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

const statusStyles = {
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  created: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const AdminPaymentAnalysis = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAPI = useCallback(async (url) => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }, []);

  // Load overview and chart data.
  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoadingStats(true);
      setError("");

      try {
        const data = await fetchAPI(
          "/api/admin/payment-analysis/stats"
        );

        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load payment statistics.");
        }
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [fetchAPI, refreshKey]);

  // Load filtered transaction history.
  useEffect(() => {
    let cancelled = false;

    const loadTransactions = async () => {
      setLoadingTransactions(true);

      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        if (status) params.set("status", status);
        if (paymentType) params.set("paymentType", paymentType);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const data = await fetchAPI(
          `/api/admin/payment-analysis/transactions?${params.toString()}`
        );

        if (!cancelled) {
          setTransactions(data.transactions || []);
          setPagination((previous) => ({
            ...previous,
            ...(data.pagination || {}),
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load transactions.");
        }
      } finally {
        if (!cancelled) {
          setLoadingTransactions(false);
        }
      }
    };

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [
    fetchAPI,
    pagination.page,
    pagination.limit,
    status,
    paymentType,
    startDate,
    endDate,
    refreshKey,
  ]);

  const overview = stats?.overview || {};
  const monthlyRevenue = stats?.monthlyRevenue || [];

  const refresh = () => setRefreshKey((value) => value + 1);

  const resetFilters = () => {
    setStatus("");
    setPaymentType("");
    setStartDate("");
    setEndDate("");
    setPagination((previous) => ({ ...previous, page: 1 }));
  };

  const changeFilter = (setter) => (event) => {
    setter(event.target.value);
    setPagination((previous) => ({ ...previous, page: 1 }));
  };

  const maxRevenue = Math.max(
    1,
    ...monthlyRevenue.map((item) => Number(item.revenue || 0))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <CreditCard size={22} className="text-violet-400" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Payment Analysis
              </h1>
              <p className="text-slate-400 mt-1">
                Monitor revenue, transactions and payment performance.
              </p>
            </div>
          </div>

          <button
            onClick={refresh}
            disabled={loadingStats || loadingTransactions}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-3 rounded-xl text-sm transition"
          >
            <RefreshCw
              size={16}
              className={
                loadingStats || loadingTransactions ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Unable to load payment analysis</p>
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

      {/* Loading */}
      {loadingStats && !stats && (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <LoaderCircle size={23} className="animate-spin" />
          Loading payment statistics...
        </div>
      )}

      {/* Dashboard */}
      {stats && (
        <div className={loadingStats ? "opacity-60" : ""}>
          {/* Revenue cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<IndianRupee size={21} />}
              label="Total Paid Revenue"
              value={formatCurrency(overview.totalRevenue)}
              description="Successful paid transactions"
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <StatCard
              icon={<CheckCircle2 size={21} />}
              label="Successful Payments"
              value={formatNumber(overview.paidTransactions)}
              description="Transactions marked paid"
              iconClass="bg-emerald-500/10 text-emerald-400"
            />

            <StatCard
              icon={<FileText size={21} />}
              label="Outline Revenue"
              value={formatCurrency(overview.outlineRevenue)}
              description={`${formatNumber(
                overview.outlineTransactions
              )} paid transactions`}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <StatCard
              icon={<BookOpen size={21} />}
              label="Chapter Revenue"
              value={formatCurrency(overview.chapterRevenue)}
              description={`${formatNumber(
                overview.chapterTransactions
              )} paid transactions`}
              iconClass="bg-amber-500/10 text-amber-400"
            />
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <MiniStat
              icon={<Clock3 size={18} />}
              label="Pending"
              value={overview.createdTransactions}
              color="text-amber-400"
            />
            <MiniStat
              icon={<XCircle size={18} />}
              label="Failed"
              value={overview.failedTransactions}
              color="text-red-400"
            />
            <MiniStat
              icon={<RotateCcw size={18} />}
              label="Refunded"
              value={overview.refundedTransactions}
              color="text-blue-400"
            />
            <MiniStat
              icon={<CreditCard size={18} />}
              label="All Transactions"
              value={overview.totalTransactions}
              color="text-violet-400"
            />
          </div>

          {/* Refund summary */}
          {Number(overview.refundedTransactions || 0) > 0 && (
            <div className="mb-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-blue-300">
                  Refund summary
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Recorded refunded transaction amounts
                </p>
              </div>
              <div className="text-xl font-bold text-blue-300">
                {formatCurrency(overview.refundedAmount)}
              </div>
            </div>
          )}

          {/* Revenue chart */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={19} className="text-violet-400" />
                  <h2 className="font-semibold text-lg">
                    Monthly Revenue
                  </h2>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Successful payments over the last 12 months
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">Net after recorded refunds</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(overview.netRevenue)}
                </p>
              </div>
            </div>

            {monthlyRevenue.length === 0 ? (
              <EmptyState message="No monthly revenue data is available." />
            ) : (
              <div className="h-64 flex items-end gap-2 sm:gap-4 overflow-x-auto pb-2">
                {monthlyRevenue.map((item) => {
                  const value = Number(item.revenue || 0);
                  const height =
                    value > 0 ? Math.max(5, (value / maxRevenue) * 100) : 2;

                  return (
                    <div
                      key={`${item.year}-${item.month}`}
                      title={`${item.label}: ${formatCurrency(value)} (${formatNumber(item.transactions)} payments)`}
                      className="flex-1 min-w-[35px] h-full flex flex-col items-center justify-end"
                    >
                      <span className="text-[10px] sm:text-xs text-slate-400 mb-2 whitespace-nowrap">
                        {value > 0 ? formatCurrency(value) : "₹0"}
                      </span>

                      <div className="w-full h-44 flex items-end justify-center">
                        <div
                          className="w-full max-w-[48px] rounded-t-md bg-violet-500/70 hover:bg-violet-500 transition-colors"
                          style={{ height: `${height}%` }}
                        />
                      </div>

                      <span className="text-[10px] sm:text-xs text-slate-500 mt-3 whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Transaction history */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-semibold text-lg">
                  Transaction History
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Search and filter recorded payment transactions.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter size={16} />
                {formatNumber(pagination.total)} records
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-5">
              <FilterSelect
                label="Payment status"
                value={status}
                onChange={changeFilter(setStatus)}
                options={[
                  ["", "All statuses"],
                  ["paid", "Paid"],
                  ["created", "Pending"],
                  ["failed", "Failed"],
                  ["refunded", "Refunded"],
                ]}
              />

              <FilterSelect
                label="Payment type"
                value={paymentType}
                onChange={changeFilter(setPaymentType)}
                options={[
                  ["", "All types"],
                  ["outline", "Outline"],
                  ["chapter", "Chapter"],
                ]}
              />

              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  From date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={changeFilter(setStartDate)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  To date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={changeFilter(setEndDate)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 outline-none focus:border-violet-500"
                />
              </div>

              <button
                onClick={resetFilters}
                className="self-end flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-3 text-sm text-slate-300 transition"
              >
                <RotateCcw size={15} />
                Reset filters
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-4 pr-4 font-medium">Transaction</th>
                    <th className="py-4 pr-4 font-medium">User</th>
                    <th className="py-4 pr-4 font-medium">Type</th>
                    <th className="py-4 pr-4 font-medium">Amount</th>
                    <th className="py-4 pr-4 font-medium">Status</th>
                    <th className="py-4 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {loadingTransactions ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <LoaderCircle
                          size={22}
                          className="animate-spin mx-auto mb-3"
                        />
                        Loading transactions...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12">
                        <EmptyState message="No transactions match these filters." />
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 pr-4">
                          <p className="text-sm font-medium text-white">
                            {transaction.razorpayOrderId
                              ? `${transaction.razorpayOrderId.slice(0, 15)}…`
                              : "No order ID"}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {transaction.razorpayPaymentId
                              ? "Payment ID recorded"
                              : "Payment ID unavailable"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <p className="text-sm text-slate-200">
                            {transaction.user?.name || "Unknown user"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {transaction.user?.email || "No email"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                            {transaction.paymentType === "outline" ? (
                              <FileText size={15} className="text-blue-400" />
                            ) : (
                              <BookOpen size={15} className="text-amber-400" />
                            )}
                            <span className="capitalize">
                              {transaction.paymentType}
                            </span>
                          </span>
                        </td>

                        <td className="py-4 pr-4 text-sm font-semibold text-white">
                          {formatCurrency(
                            Number(transaction.amount || 0) / 100
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center border rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                              statusStyles[transaction.status] ||
                              "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {transaction.status || "unknown"}
                          </span>
                        </td>

                        <td className="py-4 text-sm text-slate-400 whitespace-nowrap">
                          {formatDate(
                            transaction.paidAt || transaction.createdAt
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-5 border-t border-slate-800">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                {" · "}
                {formatNumber(pagination.total)} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1 || loadingTransactions}
                  onClick={() =>
                    setPagination((previous) => ({
                      ...previous,
                      page: previous.page - 1,
                    }))
                  }
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  disabled={
                    pagination.page >= pagination.totalPages ||
                    pagination.totalPages === 0 ||
                    loadingTransactions
                  }
                  onClick={() =>
                    setPagination((previous) => ({
                      ...previous,
                      page: previous.page + 1,
                    }))
                  }
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <p className="text-xs text-slate-600 mt-6 leading-relaxed">
        Figures are calculated from recorded payment documents. Revenue
        represents paid transaction amounts, and refunded amounts are displayed
        separately. Payment-provider fees and partial refunds are not included
        in these calculations.
      </p>
    </div>
  );
};

function StatCard({ icon, label, value, description, iconClass }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>
      <p className="text-sm text-slate-500 mt-5">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-bold mt-3">{formatNumber(value)}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 outline-none focus:border-violet-500"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <CalendarDays size={25} className="text-slate-600 mb-3" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default AdminPaymentAnalysis;
