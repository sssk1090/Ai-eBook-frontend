
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  const userInitial =
    user?.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="border-b border-white/10 bg-slate-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-lg font-bold"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
            <BookOpen size={20} />
          </div>

          <span>AI eBook Creator</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <Link
            to="/dashboard"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            to="/explore"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Explore Books
          </Link>

          <Link
            to="/create-book"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Create eBook
          </Link>

        </div>

        {/* Authentication */}
        <div className="relative">

          {!user ? (
            <Link
              to="/login"
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
            >
              Login
            </Link>
          ) : (
            <div>

              {/* Profile button */}
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10"
              >

                {/* Initial */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 font-semibold">
                  {userInitial}
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />

              </button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">

                  {/* User information */}
                  <div className="rounded-xl px-3 py-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 font-semibold">
                        {userInitial}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-white">
                          {user.fullName}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="my-2 border-t border-white/10" />

                  {/* Profile */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <User size={17} />
                    Profile
                  </button>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;
