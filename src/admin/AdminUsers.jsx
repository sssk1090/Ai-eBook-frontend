import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import {
  Search,
  Users,
  ShieldCheck,
  User,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AdminUsers() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState("");
  const [deleteUser, setDeleteUser] = useState(null);

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUsers(response.data.users || []);
  } catch (error) {
    console.error("Fetch users error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to load users."
    );
  } finally {
    setLoading(false);
  }
}, [token]);

  useEffect(() => {
  if (token) {
    fetchUsers();
  }
}, [token, fetchUsers]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // =====================================================
  // CHANGE ROLE
  // =====================================================

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId);

      await axios.put(
       `${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/role`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, role: newRole }
            : user
        )
      );
    } catch (error) {
      console.error("Change role error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to change user role."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      setActionLoading(deleteUser._id);

      await axios.delete(
       `${process.env.REACT_APP_API_URL}/api/admin/users/${deleteUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.filter(
          (user) => user._id !== deleteUser._id
        )
      );

      setDeleteUser(null);
    } catch (error) {
      console.error("Delete user error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>

          <p className="text-sm text-slate-400">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      {/* HEADER */}

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Users
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage registered users and their roles.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-500/10"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STAT CARDS */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Users size={21} />
          </div>

          <p className="text-sm text-slate-400">
            Total Users
          </p>

          <p className="mt-1 text-2xl font-bold">
            {users.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <User size={21} />
          </div>

          <p className="text-sm text-slate-400">
            Regular Users
          </p>

          <p className="mt-1 text-2xl font-bold">
            {
              users.filter(
                (user) => user.role === "user"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck size={21} />
          </div>

          <p className="text-sm text-slate-400">
            Administrators
          </p>

          <p className="mt-1 text-2xl font-bold">
            {
              users.filter(
                (user) => user.role === "admin"
              ).length
            }
          </p>
        </div>
      </div>

      {/* SEARCH + FILTER */}

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* ROLE FILTER */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500/50"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Showing {filteredUsers.length} of{" "}
          {users.length} users
        </div>
      </div>

      {/* USERS TABLE */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Registered
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-16 text-center"
                  >
                    <Users
                      size={40}
                      className="mx-auto mb-3 text-slate-700"
                    />

                    <p className="text-sm font-medium text-slate-400">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    {/* USER */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 font-semibold text-violet-400">
                          {user.fullName
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {user.fullName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-4">
                      {user._id ===
                      JSON.parse(
                        localStorage.getItem("user")
                      )?._id ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-violet-500/10 text-violet-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {user.role === "admin"
                              ? "Administrator"
                              : "User"}
                          </span>

                          <span className="text-[10px] text-slate-600">
                            You
                          </span>
                        </div>
                      ) : (
                        <select
                          value={user.role}
                          disabled={
                            actionLoading === user._id
                          }
                          onChange={(e) =>
                            handleRoleChange(
                              user._id,
                              e.target.value
                            )
                          }
                          className={`rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium outline-none ${
                            user.role === "admin"
                              ? "text-violet-400"
                              : "text-blue-400"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <option value="user">
                            User
                          </option>

                          <option value="admin">
                            Administrator
                          </option>
                        </select>
                      )}
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4 text-right">
                      {user._id ===
                      JSON.parse(
                        localStorage.getItem("user")
                      )?._id ? (
                        <span className="text-xs text-slate-600">
                          Protected
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setDeleteUser(user)
                          }
                          disabled={
                            actionLoading === user._id
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}

      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            {/* ICON */}

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-white">
              Delete User?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {deleteUser.fullName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                disabled={!!actionLoading}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05]"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteUser}
                disabled={!!actionLoading}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === deleteUser._id
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;