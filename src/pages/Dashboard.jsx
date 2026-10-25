
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Eye,
  FileText,
  BookMarked,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useBook } from "../context/BookContext";

function Dashboard() {
  const { user, token } = useAuth();
  const { setBook } = useBook();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's books from backend
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/books/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBooks(response.data.books || []);
      } catch (error) {
        console.error("Error fetching books:", error);

        // If Book API is not created yet, keep dashboard usable
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [token]);

  const handleOpenBook = (book) => {
    setBook(book);
  };

  const totalBooks = books.length;

  const totalChapters = books.reduce(
    (total, book) => total + (book.chapters?.length || 0),
    0
  );

  const totalViews = books.reduce(
    (total, book) => total + (book.views || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-violet-400">
                Welcome back 👋
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Hello, {user?.fullName || "User"}
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Create, edit and explore AI-powered eBooks from your
                dashboard.
              </p>
            </div>

            <Link
              to="/create-book"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
            >
              <Plus size={19} />
              Create New eBook
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Books */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">My eBooks</p>

                <h2 className="mt-2 text-3xl font-bold">
                  {totalBooks}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Chapters</p>

                <h2 className="mt-2 text-3xl font-bold">
                  {totalChapters}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* Views */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Views</p>

                <h2 className="mt-2 text-3xl font-bold">
                  {totalViews}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Eye size={24} />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-400">
              Start working on your next eBook.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Create Book */}
            <Link
              to="/create-book"
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-white/[0.03] p-6 transition hover:border-violet-500/40 hover:bg-violet-600/10"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
                <Sparkles size={24} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Create with AI
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Generate an eBook outline and chapters using AI,
                    then edit everything using the rich text editor.
                  </p>
                </div>

                <ArrowRight
                  size={20}
                  className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-400"
                />
              </div>
            </Link>

            {/* Explore */}
            <Link
              to="/explore"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                <BookMarked size={24} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Explore eBooks
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Discover public eBooks created by other users
                    and explore different topics.
                  </p>
                </div>

                <ArrowRight
                  size={20}
                  className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white"
                />
              </div>
            </Link>
          </div>
        </section>

        {/* My eBooks */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">My eBooks</h2>

              <p className="mt-1 text-sm text-slate-400">
                Your recently created books.
              </p>
            </div>

            {books.length > 0 && (
              <Link
                to="/explore"
                className="text-sm font-medium text-violet-400 hover:text-violet-300"
              >
                View all
              </Link>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

              <p className="text-sm text-slate-400">
                Loading your eBooks...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && books.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <BookOpen size={30} />
              </div>

              <h3 className="text-lg font-semibold">
                No eBooks yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                You haven't created an eBook yet. Start by creating
                your first AI-powered book.
              </p>

              <Link
                to="/create-book"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
              >
                <Plus size={18} />
                Create Your First eBook
              </Link>
            </div>
          )}

          {/* Books */}
          {!loading && books.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div
                  key={book._id || book.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20"
                >
                  {/* Book Header */}
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-violet-600/20 via-slate-900 to-slate-950">
                    <BookOpen
                      size={42}
                      className="text-violet-400"
                    />
                  </div>

                  {/* Book Details */}
                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 font-semibold">
                        {book.title || "Untitled eBook"}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                          book.visibility === "public"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {book.visibility === "public"
                          ? "Public"
                          : "Private"}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-slate-400">
                      {book.description ||
                        book.topic ||
                        "No description available."}
                    </p>

                    {/* Metadata */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} />
                        {book.chapters?.length || 0} chapters
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Eye size={14} />
                        {book.views || 0} views
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />

                        {book.updatedAt
                          ? new Date(
                              book.updatedAt
                            ).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>

                    {/* Open Button */}
                    <Link
                      to="/editor"
                      onClick={() => handleOpenBook(book)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10"
                    >
                      Open eBook
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

