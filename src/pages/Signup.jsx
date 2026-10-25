import {
  BookOpen,
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        signupData
      );

      const { token, user } = response.data;

      // Save user and token in AuthContext
      login(user, token);

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response) {
        setError(
          error.response.data.message || "Signup failed"
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Logo */}
          <Link
            to="/"
            className="mb-10 flex items-center justify-center gap-3 text-xl font-bold"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <BookOpen size={22} />
            </div>

            AI eBook Creator
          </Link>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

            <div className="mb-8">

              <h1 className="text-3xl font-bold">
                Create your account
              </h1>

              <p className="mt-2 text-slate-400">
                Start creating your first AI-powered eBook.
              </p>

            </div>

            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    name="fullName"
                    type="text"
                    value={signupData.fullName}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />

                </div>

              </div>

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
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    name="password"
                    type="password"
                    value={signupData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />

                </div>

              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Signup */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-slate-400">

              Already have an account?

              <Link
                to="/login"
                className="ml-1 font-medium text-violet-400 hover:text-violet-300"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;