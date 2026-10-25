
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Sparkles,
  Eye,
  ArrowUpRight,
  RefreshCw,
  BookMarked,
} from "lucide-react";

import Navbar from "../components/Navbar";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const categories = [
  "All",
  "Technology",
  "Education",
  "Business",
  "Science",
  "Fiction",
  "Self-Help",
  "Other",
];

function Explore() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPublicBooks = async () => {
    setLoading(true);
    setError("");

    try {
      // This endpoint should return public eBooks from your backend.
      const response = await axios.get(
        `${API_BASE_URL}/api/books/public`
      );

      const data = response.data;
      const bookList = Array.isArray(data)
        ? data
        : data.books || data.publicBooks || [];

      // Only show public books in Explore.
      setBooks(
        bookList.filter((book) => book.visibility === "public")
      );
    } catch (err) {
      console.error("Error loading Explore books:", err);
      setBooks([]);
      setError(
        err.response?.data?.message ||
          "Unable to load eBooks right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !query ||
        [
          book.title,
          book.description,
          book.topic,
          book.category,
          book.author?.fullName,
          book.user?.fullName,
          book.createdBy?.fullName,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const category = String(book.category || "Other");
      const matchesCategory =
        selectedCategory === "All" ||
        category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [books, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-900/30 via-slate-950 to-blue-900/20" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles size={16} />
            Discover ideas. Explore stories.
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            A world of knowledge,
            <span className="block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              one eBook at a time.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Explore public eBooks created by the community.
            Find new topics, learn something useful, and discover
            your next great read.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BookOpen size={18} className="text-violet-400" />
              <span>{books.length} public eBooks</span>
            </div>

            <Link
              to="/create-book"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              <Sparkles size={17} />
              Create your own
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Explore the library</h2>
          <p className="mt-2 text-sm text-slate-400">
            Search by title, topic, description, or category.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search eBooks or topics..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>

          <button
            type="button"
            onClick={fetchPublicBooks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedCategory === category
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="h-40 bg-white/5" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/5" />
                  <div className="h-3 w-4/5 rounded bg-white/5" />
                  <div className="h-9 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
            <p className="text-red-300">{error}</p>
            <button
              type="button"
              onClick={fetchPublicBooks}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold hover:bg-violet-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Book grid */}
        {!loading && !error && filteredBooks.length > 0 && (
          <>
            <div className="mb-5 mt-8 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {filteredBooks.length}
                </span>{" "}
                eBooks
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book, index) => {
                const author =
                  book.author?.fullName ||
                  book.user?.fullName ||
                  book.createdBy?.fullName ||
                  book.authorName ||
                  "Community author";

                return (
                  <article
                    key={book._id || book.id || index}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-white/[0.05]"
                  >
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900/60 via-slate-900 to-blue-900/40">
                      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-violet-500/10 blur-2xl" />
                      <div className="absolute -bottom-10 -left-5 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

                      <div className="relative flex h-20 w-16 items-center justify-center rounded-lg border border-white/20 bg-white/10 shadow-2xl transition duration-300 group-hover:scale-105">
                        <BookOpen
                          size={32}
                          className="text-violet-300"
                        />
                      </div>

                      <span className="absolute left-4 top-4 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        Public
                      </span>

                      <span className="absolute bottom-4 right-4 rounded-full bg-black/30 px-3 py-1 text-xs text-slate-300">
                        {book.category || "eBook"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-7 transition group-hover:text-violet-300">
                        {book.title || "Untitled eBook"}
                      </h3>

                      <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">
                        {book.description ||
                          book.topic ||
                          "Discover this eBook and explore its chapters."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-500">
                        <span className="max-w-[65%] truncate">
                          By {author}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <BookMarked size={14} />
                          {book.chapters?.length || 0} chapters
                        </span>
                      </div>

                      <div className="mt-5">
                        <Link
                          to={`/preview/${book._id || book.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500"
                        >
                          <Eye size={17} />
                          Read eBook
                          <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <BookOpen size={30} />
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              {books.length === 0
                ? "No public eBooks yet"
                : "No matching eBooks"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {books.length === 0
                ? "Be the first to share your knowledge. Create an eBook and set its visibility to Public."
                : "Try a different search term or select another category."}
            </p>

            {books.length === 0 ? (
              <Link
                to="/create-book"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
              >
                <Sparkles size={17} />
                Create an eBook
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-6 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium hover:bg-white/5"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-slate-500">
        Discover ideas. Share knowledge. Keep reading.
      </footer>
    </div>
  );
}

export default Explore;
