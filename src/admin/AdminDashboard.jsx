import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  BookOpen,
  Globe,
  Lock,
  Eye,
  UserPlus,
  FileText,
  ShieldCheck,
  UserCog,
  Sparkles,
  BarChart3,
  ArrowRight,
  CreditCard,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { token } = useAuth();

  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalBooks: 0,
    publicBooks: 0,
    privateBooks: 0,
    totalViews: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStatistics(response.data.statistics);
        setRecentUsers(response.data.recentUsers || []);
        setRecentBooks(response.data.recentBooks || []);
      } catch (error) {
        console.error("Admin dashboard error:", error);

        const message =
          error.response?.data?.message ||
          "Failed to load dashboard data.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>

          <p className="text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={30}
            className="text-violet-400"
          />

          <h1 className="text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
        </div>

        <p className="mt-2 text-slate-400">
          Overview of your AI eBook Creator system.
        </p>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

        {/* Total Users */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-violet-500/10 p-3">
              <Users
                size={22}
                className="text-violet-400"
              />
            </div>

          </div>

          <p className="mt-5 text-sm text-slate-400">
            Total Users
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {statistics.totalUsers}
          </h2>

        </div>

        {/* Total Books */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-blue-500/10 p-3">
              <BookOpen
                size={22}
                className="text-blue-400"
              />
            </div>

          </div>

          <p className="mt-5 text-sm text-slate-400">
            Total Books
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {statistics.totalBooks}
          </h2>

        </div>

        {/* Public Books */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-emerald-500/10 p-3">
              <Globe
                size={22}
                className="text-emerald-400"
              />
            </div>

          </div>

          <p className="mt-5 text-sm text-slate-400">
            Public Books
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {statistics.publicBooks}
          </h2>

        </div>

        {/* Private Books */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-amber-500/10 p-3">
              <Lock
                size={22}
                className="text-amber-400"
              />
            </div>

          </div>

          <p className="mt-5 text-sm text-slate-400">
            Private Books
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {statistics.privateBooks}
          </h2>

        </div>

        {/* Total Views */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

          <div className="flex items-center justify-between">

            <div className="rounded-xl bg-pink-500/10 p-3">
              <Eye
                size={22}
                className="text-pink-400"
              />
            </div>

          </div>

          <p className="mt-5 text-sm text-slate-400">
            Total Views
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            {statistics.totalViews}
          </h2>

        </div>

      </div>

      {/* =================================================
    QUICK ACTIONS
================================================= */}

<div>

  <div className="mb-4">

    <h2 className="text-lg font-semibold text-white">
      Quick Actions
    </h2>

    <p className="mt-1 text-sm text-slate-400">
      Quickly access important admin sections.
    </p>

  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">

    {/* Manage Users */}

    <Link
      to="/admin/users"
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-violet-500/30 hover:bg-white/[0.07]"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
          <UserCog
            size={21}
            className="text-violet-400"
          />
        </div>

        <ArrowRight
          size={18}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-400"
        />

      </div>

      <h3 className="mt-5 font-semibold text-white">
        Manage Users
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        View and manage registered users.
      </p>

    </Link>

    {/* Manage eBooks */}

    <Link
      to="/admin/books"
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-500/30 hover:bg-white/[0.07]"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
          <BookOpen
            size={21}
            className="text-blue-400"
          />
        </div>

        <ArrowRight
          size={18}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
        />

      </div>

      <h3 className="mt-5 font-semibold text-white">
        Manage eBooks
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        View and manage created eBooks.
      </p>

    </Link>

    {/* AI Usage */}

    <Link
      to="/admin/ai-usage"
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/30 hover:bg-white/[0.07]"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
          <Sparkles
            size={21}
            className="text-emerald-400"
          />
        </div>

        <ArrowRight
          size={18}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400"
        />

      </div>

      <h3 className="mt-5 font-semibold text-white">
        AI Usage
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Monitor AI generation activity.
      </p>

    </Link>

    {/* Analytics */}

    <Link
      to="/admin/analytics"
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-pink-500/30 hover:bg-white/[0.07]"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10">
          <BarChart3
            size={21}
            className="text-pink-400"
          />
        </div>

        <ArrowRight
          size={18}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-pink-400"
        />

      </div>

      <h3 className="mt-5 font-semibold text-white">
        Analytics
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        View platform analytics and insights.
      </p>

    </Link>

    
{/* Payment Analysis */}
<Link
  to="/admin/payment-analysis"
  className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-violet-500/30 hover:bg-white/[0.07]"
>
  <div className="flex items-start justify-between">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
      <CreditCard size={21} className="text-violet-400" />
    </div>

    <ArrowRight
      size={18}
      className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-400"
    />
  </div>

  <h3 className="mt-5 font-semibold text-white">
    Payment Analysis
  </h3>

  <p className="mt-1 text-sm text-slate-500">
    Monitor revenue, transactions and payment performance.
  </p>
</Link>


  </div>

</div>

      {/* =================================================
          RECENT DATA
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-2">

        {/* =================================================
            RECENT USERS
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">

          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Users
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Latest registered users
              </p>
            </div>

            <UserPlus
              size={21}
              className="text-violet-400"
            />

          </div>

          <div className="divide-y divide-white/10">

            {recentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No users found.
              </div>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-6 py-4"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/20 font-semibold text-violet-300">
                      {user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : "U"}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-white">
                        {user.fullName}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`ml-3 rounded-full px-3 py-1 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-violet-500/10 text-violet-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {user.role}
                  </span>

                </div>
              ))
            )}

          </div>

        </div>

        {/* =================================================
            RECENT BOOKS
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">

          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Books
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Recently created eBooks
              </p>
            </div>

            <FileText
              size={21}
              className="text-violet-400"
            />

          </div>

          <div className="divide-y divide-white/10">

            {recentBooks.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No books found.
              </div>
            ) : (
              recentBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <BookOpen
                        size={19}
                        className="text-blue-400"
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-white">
                        {book.title}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {book.userId?.fullName || "Unknown user"}
                      </p>

                    </div>

                  </div>

                  <div className="flex shrink-0 items-center gap-3">

                    <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
                      <Eye size={14} />
                      {book.views || 0}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        book.visibility === "public"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {book.visibility}
                    </span>

                  </div>

                </div>
              ))
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;