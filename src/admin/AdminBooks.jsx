import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  BookOpen,
  Eye,
  Trash2,
  Lock,
  Globe,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const PAGE_SIZE = 10;

// Get the JWT token from localStorage
function getAuthToken() {
  const tokenKeys = ["token", "authToken", "jwtToken"];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }

  // Also support projects that store the token inside an object
  for (const key of ["user", "auth", "authData"]) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "null");

      if (data?.token) return data.token;
      if (data?.authToken) return data.authToken;
    } catch {
      // Ignore invalid JSON
    }
  }

  return "";
}

// API request helper
async function apiRequest(path, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Login token not found. Please log in again.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Handle an empty response
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

// Normalize database book data for the UI
function normalizeBook(book) {
  return {
    ...book,
    id: book._id,
    author:
      book.author ||
      book.userId?.fullName ||
      book.userId?.email ||
      "Unknown author",
    topic: book.topic || "Uncategorized",
    visibility: (book.visibility || "private").toLowerCase(),
    chapters: Array.isArray(book.chapters) ? book.chapters : [],
    views: Number(book.views || 0),
  };
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalBooks: 0,
    totalPages: 0,
  });

  const [statistics, setStatistics] = useState({
    totalBooks: 0,
    publicBooks: 0,
    privateBooks: 0,
    totalViews: 0,
  });

  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [busyBookId, setBusyBookId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Fetch books and dashboard statistics
  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (visibilityFilter !== "all") {
        params.set("visibility", visibilityFilter);
      }

      const [booksResponse, dashboardResponse] = await Promise.all([
        apiRequest(`/api/admin/books?${params.toString()}`),
        apiRequest("/api/admin/dashboard"),
      ]);

      const fetchedBooks = (booksResponse.books || []).map(normalizeBook);

      setBooks(fetchedBooks);

      setPagination(
        booksResponse.pagination || {
          totalBooks: fetchedBooks.length,
          totalPages: fetchedBooks.length ? 1 : 0,
        }
      );

      const stats = dashboardResponse.statistics || {};

      setStatistics({
        totalBooks: Number(stats.totalBooks || 0),
        publicBooks: Number(stats.publicBooks || 0),
        privateBooks: Number(stats.privateBooks || 0),
        totalViews: Number(stats.totalViews || 0),
      });
    } catch (err) {
      setError(err.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, [page, search, visibilityFilter]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setVisibilityFilter("all");
    setPage(1);
  };

  // View book details and chapters
  const openBookDetails = async (book) => {
    setSelectedBook(book);
    setDetailsLoading(true);
    setError("");

    try {
      const response = await apiRequest(`/api/admin/books/${book.id}`);

      setSelectedBook(normalizeBook(response.book));
    } catch (err) {
      setError(err.message || "Failed to load book details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Change public/private visibility
  const toggleVisibility = async (book) => {
    const newVisibility =
      book.visibility === "public" ? "private" : "public";

    setBusyBookId(book.id);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/admin/books/${book.id}/visibility`, {
        method: "PUT",
        body: JSON.stringify({
          visibility: newVisibility,
        }),
      });

      setBooks((currentBooks) =>
        currentBooks.map((item) =>
          item.id === book.id
            ? { ...item, visibility: newVisibility }
            : item
        )
      );

      setSelectedBook((current) =>
        current?.id === book.id
          ? { ...current, visibility: newVisibility }
          : current
      );

      setNotice(`"${book.title}" is now ${newVisibility}.`);

      // Refresh dashboard counts
      const dashboardResponse = await apiRequest("/api/admin/dashboard");
      const stats = dashboardResponse.statistics || {};

      setStatistics({
        totalBooks: Number(stats.totalBooks || 0),
        publicBooks: Number(stats.publicBooks || 0),
        privateBooks: Number(stats.privateBooks || 0),
        totalViews: Number(stats.totalViews || 0),
      });
    } catch (err) {
      setError(err.message || "Failed to update visibility.");
    } finally {
      setBusyBookId(null);
    }
  };

  // Delete a book permanently
  const deleteBook = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${book.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyBookId(book.id);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/admin/books/${book.id}`, {
        method: "DELETE",
      });

      if (selectedBook?.id === book.id) {
        setSelectedBook(null);
      }

      setNotice(`"${book.title}" was deleted successfully.`);

      // If the last item on a page is deleted, move back one page
      if (books.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await loadBooks();
      }
    } catch (err) {
      setError(err.message || "Failed to delete book.");
    } finally {
      setBusyBookId(null);
    }
  };

  const totalPages = pagination.totalPages || 0;

  const firstItem =
    pagination.totalBooks === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    page * PAGE_SIZE,
    pagination.totalBooks
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            eBook Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage, review and control all eBooks created on the platform.
          </p>
        </div>

        <button
          onClick={loadBooks}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 transition hover:border-violet-500 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <p className="flex-1">{error}</p>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Success message */}
      {notice && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <BookOpen size={18} className="mt-0.5 shrink-0" />

          <p className="flex-1">{notice}</p>

          <button onClick={() => setNotice("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen size={21} />}
          label="Total eBooks"
          value={statistics.totalBooks}
          iconClass="bg-violet-500/10 text-violet-400"
        />

        <StatCard
          icon={<Globe size={21} />}
          label="Public Books"
          value={statistics.publicBooks}
          iconClass="bg-emerald-500/10 text-emerald-400"
        />

        <StatCard
          icon={<Lock size={21} />}
          label="Private Books"
          value={statistics.privateBooks}
          iconClass="bg-amber-500/10 text-amber-400"
        />

        <StatCard
          icon={<Eye size={21} />}
          label="Total Views"
          value={statistics.totalViews.toLocaleString()}
          iconClass="bg-pink-500/10 text-pink-400"
        />
      </div>

      {/* Search and filters */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-violet-400" />
          <h2 className="font-semibold">Search & Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search by title, topic or author..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>

          <select
            value={visibilityFilter}
            onChange={(event) => {
              setVisibilityFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {(search || visibilityFilter !== "all") && (
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 text-sm text-violet-400 transition hover:text-violet-300"
          >
            <X size={15} />
            Clear filters
          </button>
        )}
      </div>

      {/* Books table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All eBooks</h2>

            <p className="mt-1 text-xs text-slate-500">
              {loading
                ? "Loading books..."
                : `Showing ${firstItem}–${lastItem} of ${pagination.totalBooks} books`}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Manage platform content
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                {[
                  "eBook",
                  "Author",
                  "Topic",
                  "Chapters",
                  "Views",
                  "Visibility",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!loading &&
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                  >
                    {/* Book title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                          <BookOpen
                            size={19}
                            className="text-violet-400"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-medium text-white">
                            {book.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Created {formatDate(book.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                          {book.author.charAt(0).toUpperCase()}
                        </div>

                        <span className="text-sm text-slate-300">
                          {book.author}
                        </span>
                      </div>
                    </td>

                    {/* Topic */}
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
                        {book.topic}
                      </span>
                    </td>

                    {/* Chapters */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <BookMarked
                          size={16}
                          className="text-slate-500"
                        />

                        {book.chapters.length ||
                          Number(book.numberOfChapters || 0)}
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Eye size={16} className="text-slate-500" />
                        {book.views.toLocaleString()}
                      </div>
                    </td>

                    {/* Visibility */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleVisibility(book)}
                        disabled={busyBookId === book.id}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                          book.visibility === "public"
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {busyBookId === book.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : book.visibility === "public" ? (
                          <Globe size={14} />
                        ) : (
                          <Lock size={14} />
                        )}

                        {book.visibility === "public"
                          ? "Public"
                          : "Private"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openBookDetails(book)}
                          title="View book details"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => deleteBook(book)}
                          disabled={busyBookId === book.id}
                          title="Delete book"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        >
                          {busyBookId === book.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
            <Loader2
              size={20}
              className="animate-spin text-violet-400"
            />
            Loading eBooks...
          </div>
        )}

        {/* Empty state */}
        {!loading && books.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
              <BookOpen size={24} className="text-slate-500" />
            </div>

            <h3 className="font-semibold text-white">
              No eBooks found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or visibility filter.
            </p>

            {(search || visibilityFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
            <p className="text-sm text-slate-500">
              Page <span className="text-slate-300">{page}</span> of{" "}
              <span className="text-slate-300">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                disabled={page <= 1}
                aria-label="Previous page"
                className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-violet-600 px-3 text-sm font-medium">
                {page}
              </span>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                disabled={page >= totalPages}
                aria-label="Next page"
                className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book details modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  <BookOpen
                    size={20}
                    className="text-violet-400"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">
                    {selectedBook.title}
                  </h2>

                  <p className="text-sm text-slate-500">
                    by {selectedBook.author}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBook(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal body */}
            <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-400">
                  <Loader2
                    size={20}
                    className="animate-spin text-violet-400"
                  />
                  Loading book details...
                </div>
              ) : (
                <>
                  {selectedBook.description && (
                    <p className="mb-5 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {selectedBook.description}
                    </p>
                  )}

                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <DetailItem
                      label="Topic"
                      value={selectedBook.topic}
                    />

                    <DetailItem
                      label="Chapters"
                      value={
                        selectedBook.chapters.length ||
                        selectedBook.numberOfChapters ||
                        0
                      }
                    />

                    <DetailItem
                      label="Views"
                      value={selectedBook.views.toLocaleString()}
                    />

                    <DetailItem
                      label="Created"
                      value={formatDate(selectedBook.createdAt)}
                    />
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="mb-2 text-xs text-slate-500">
                        Visibility
                      </p>

                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        {selectedBook.visibility === "public" ? (
                          <Globe
                            size={17}
                            className="text-emerald-400"
                          />
                        ) : (
                          <Lock
                            size={17}
                            className="text-slate-400"
                          />
                        )}

                        {selectedBook.visibility === "public"
                          ? "Public"
                          : "Private"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="mb-2 text-xs text-slate-500">
                        Target audience
                      </p>

                      <p className="text-sm text-slate-200">
                        {selectedBook.targetAudience ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Chapter list */}
                  <h3 className="mb-3 font-semibold">Chapters</h3>

                  {selectedBook.chapters.length === 0 ? (
                    <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
                      No saved chapter content is available.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedBook.chapters.map((chapter, index) => (
                        <div
                          key={
                            chapter._id ||
                            `${chapter.title}-${index}`
                          }
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <h4 className="font-medium text-slate-200">
                            {index + 1}.{" "}
                            {chapter.title ||
                              `Chapter ${index + 1}`}
                          </h4>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                            {chapter.content ||
                              "No content saved for this chapter."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modal actions */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => toggleVisibility(selectedBook)}
                      disabled={busyBookId === selectedBook.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-medium transition hover:bg-violet-500 disabled:opacity-50"
                    >
                      {selectedBook.visibility === "public" ? (
                        <Lock size={17} />
                      ) : (
                        <Globe size={17} />
                      )}

                      Make{" "}
                      {selectedBook.visibility === "public"
                        ? "Private"
                        : "Public"}
                    </button>

                    <button
                      onClick={() => deleteBook(selectedBook)}
                      disabled={busyBookId === selectedBook.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                      Delete Book
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Statistics card
function StatCard({ icon, label, value, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

// Book detail item
function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 break-words text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}

export default AdminBooks;