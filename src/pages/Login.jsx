import React, { useState } from "react";
import axios from "axios";

import {
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      console.log("Login response:", response.data);

      const userData = response.data.user;
      const authToken = response.data.token;

      // Save user + token in AuthContext and localStorage
      login(userData, authToken);

      // Redirect based on role
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while logging in.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden lg:flex flex-col justify-between bg-violet-700 p-12">

          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <BookOpen size={22} />
            </div>

            AI eBook Creator
          </Link>

          <div className="max-w-lg">

            <Sparkles size={35} className="mb-6 text-violet-200" />

            <h1 className="text-5xl font-bold leading-tight">
              Your ideas.
              <br />
              Your book.
              <br />
              Powered by AI.
            </h1>

            <p className="mt-6 text-lg leading-8 text-violet-100">
              Create, edit and publish professional eBooks
              using the power of artificial intelligence.
            </p>

          </div>

          <p className="text-sm text-violet-200">
            © 2026 AI eBook Creator
          </p>

        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <Link
              to="/"
              className="mb-10 flex items-center justify-center gap-3 text-xl font-bold lg:hidden"
            >
              <BookOpen className="text-violet-400" />
              AI eBook Creator
            </Link>

            <div className="mb-8">

              <h2 className="text-3xl font-bold">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-400">
                Sign in to continue creating your eBook.
              </p>

            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />

                </div>

              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

            {/* Signup */}
            <p className="mt-8 text-center text-sm text-slate-400">

              Don't have an account?

              <Link
                to="/signup"
                className="ml-1 font-medium text-violet-400 hover:text-violet-300"
              >
                Create account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;