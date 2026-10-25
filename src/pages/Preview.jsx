import {
  ArrowLeft,
  BookOpen,
  Download,
  Edit3,
  ChevronLeft,
  FileText,
  FileDown,
  X,
  Check,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useEffect, useState } from "react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

function Preview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { token } = useAuth();

  // --------------------------------------------------
  // Book state
  // --------------------------------------------------

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Export states
  // --------------------------------------------------

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // --------------------------------------------------
  // Fetch book from MongoDB
  // --------------------------------------------------

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError("Book ID is missing.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/books/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBook(response.data.book);
      } catch (error) {
        console.error("Fetch preview book error:", error);

        const message =
          error.response?.data?.message ||
          "Unable to load this book.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, token]);

  // --------------------------------------------------
  // Export
  // --------------------------------------------------

  const handleExport = async () => {
  if (!book?._id) {
    setError("Book ID is missing.");
    return;
  }

  if (!token) {
    setError("Authentication required. Please login again.");
    return;
  }

  setExporting(true);
  setExported(false);
  setError("");

  try {
    const endpoint =
      selectedFormat === "pdf"
        ? `${process.env.REACT_APP_API_URL}/api/export/pdf/${book._id}`
      : `${process.env.REACT_APP_API_URL}/api/export/docx/${book._id}`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });

    // Create downloadable file
    const blob = new Blob(
      [response.data],
      {
        type:
          selectedFormat === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    const safeTitle =
      (book.title || "ebook")
        .replace(/[^a-z0-9\s-_]/gi, "")
        .trim()
        .replace(/\s+/g, "-");

    link.download = `${safeTitle || "ebook"}.${selectedFormat}`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    // Success message
    setExported(true);

    setTimeout(() => {
      setExported(false);
      setShowExportModal(false);
    }, 2000);
  } catch (error) {
    console.error("Export error:", error);

    // Blob responses need special handling
    if (error.response?.data instanceof Blob) {
      try {
        const errorText =
          await error.response.data.text();

        const errorData =
          JSON.parse(errorText);

        setError(
          errorData.message ||
            "Failed to export the book."
        );
      } catch {
        setError(
          "Failed to export the book."
        );
      }
    } else {
      setError(
        error.response?.data?.message ||
          "Failed to export the book."
      );
    }
  } finally {
    setExporting(false);
  }
};

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your eBook...
          </p>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error || !book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <BookOpen
              size={28}
              className="text-red-400"
            />
          </div>

          <h1 className="text-xl font-semibold">
            Unable to Load Book
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error || "The requested book could not be found."}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // Book data
  // --------------------------------------------------

  const chapters = Array.isArray(book.chapters)
    ? book.chapters
    : [];

  const author = book.author || "Unknown Author";

  const year = book.createdAt
    ? new Date(book.createdAt).getFullYear()
    : new Date().getFullYear();

  const description =
    book.description ||
    "An AI generated eBook created using the AI eBook Creator.";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur">

        <div className="flex h-16 items-center justify-between px-5">

          {/* Left side */}

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate(`/editor/${book._id}`)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              title="Back to Editor"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
                <BookOpen size={19} />
              </div>

              <div>

                <h1 className="text-sm font-semibold">
                  eBook Preview
                </h1>

                <p className="max-w-[260px] truncate text-xs text-slate-500">
                  {book.title}
                </p>

              </div>

            </div>

          </div>

          {/* Right side */}

          <div className="flex items-center gap-2">

            <Link
              to={`/editor/${book._id}`}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Edit3 size={16} />
              Edit
            </Link>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
            >
              <Download size={16} />
              Export
            </button>

          </div>

        </div>

      </header>

      {/* ==================================================
          PREVIEW AREA
      ================================================== */}

      <main className="px-5 py-12">

        <div className="mx-auto max-w-4xl">

          {/* ==================================================
              BOOK
          ================================================== */}

          <div className="overflow-hidden rounded-xl bg-white text-slate-900 shadow-2xl">

            {/* ==================================================
                COVER
            ================================================== */}

            <section className="flex min-h-[650px] flex-col items-center justify-center bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-950 px-10 text-center text-white">

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">

                <BookOpen size={40} />

              </div>

              <p className="mt-10 text-sm font-semibold uppercase tracking-[0.3em] text-violet-200">
                An AI Generated eBook
              </p>

              <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight">
                {book.title}
              </h1>

              <p className="mt-6 max-w-xl text-lg text-violet-100">
                {description}
              </p>

              <div className="mt-16 h-px w-24 bg-white/30" />

              <p className="mt-6 text-sm text-violet-200">
                Written by {author}
              </p>

              <p className="mt-2 text-sm text-violet-300">
                {year}
              </p>

            </section>

            {/* ==================================================
                BOOK INFORMATION
            ================================================== */}

            <section className="border-b border-slate-200 px-10 py-10 md:px-20">

              <div className="grid gap-6 sm:grid-cols-2">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Topic
                  </p>

                  <p className="mt-2 font-medium text-slate-800">
                    {book.topic || "Not specified"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Target Audience
                  </p>

                  <p className="mt-2 font-medium text-slate-800">
                    {book.targetAudience || "General readers"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Writing Style
                  </p>

                  <p className="mt-2 font-medium text-slate-800">
                    {book.writingStyle || "Standard"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Chapters
                  </p>

                  <p className="mt-2 font-medium text-slate-800">
                    {chapters.length}
                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                TABLE OF CONTENTS
            ================================================== */}

            <section className="px-10 py-16 md:px-20">

              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
                Contents
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Table of Contents
              </h2>

              {chapters.length === 0 ? (

                <p className="mt-10 text-slate-500">
                  No chapters have been added yet.
                </p>

              ) : (

                <div className="mt-10 space-y-2">

                  {chapters.map((chapter, index) => (

                    <div
                      key={chapter._id || index}
                      className="flex items-center gap-4 border-b border-slate-200 py-4"
                    >

                      <span className="w-8 font-semibold text-violet-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="font-medium">
                        {chapter.title || `Chapter ${index + 1}`}
                      </span>

                      <span className="ml-auto text-sm text-slate-400">
                        {index + 1}
                      </span>

                    </div>

                  ))}

                </div>

              )}

            </section>

            {/* ==================================================
                CHAPTERS
            ================================================== */}

            {chapters.map((chapter, index) => (

              <section
                key={chapter._id || index}
                className="min-h-[600px] border-t border-slate-200 px-10 py-16 md:px-20"
              >

                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-violet-600">

                  <span>
                    Chapter {String(index + 1).padStart(2, "0")}
                  </span>

                </div>

                <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight">
                  {chapter.title || `Chapter ${index + 1}`}
                </h2>

                <div className="mt-10 max-w-3xl">

                  {chapter.content ? (

                    chapter.content
                      .split("\n\n")
                      .map((paragraph, paragraphIndex) => (

                        <p
                          key={paragraphIndex}
                          className="mb-6 whitespace-pre-line text-lg leading-9 text-slate-600"
                        >
                          {paragraph}
                        </p>

                      ))

                  ) : (

                    <p className="text-lg leading-9 text-slate-400">
                      This chapter does not have any content yet.
                    </p>

                  )}

                </div>

              </section>

            ))}

            {/* ==================================================
                END
            ================================================== */}

            <section className="flex min-h-[350px] items-center justify-center border-t border-slate-200 text-center">

              <div>

                <BookOpen
                  size={40}
                  className="mx-auto text-violet-600"
                />

                <h2 className="mt-5 text-2xl font-bold">
                  End of the Book
                </h2>

                <p className="mt-2 text-slate-500">
                  Thank you for reading.
                </p>

              </div>

            </section>

          </div>

          {/* ==================================================
              BOTTOM NAVIGATION
          ================================================== */}

          <div className="mt-6 flex items-center justify-between">

            <button
              onClick={() => navigate(`/editor/${book._id}`)}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft size={18} />
              Back to Editor
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold hover:bg-violet-500"
            >
              Export eBook
              <Download size={17} />
            </button>

          </div>

        </div>

      </main>

      {/* ==================================================
          EXPORT MODAL
      ================================================== */}

      {showExportModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                    <Download size={22} />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-white">
                      Export Your eBook
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose a format for your eBook
                    </p>

                  </div>

                </div>

              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* Format options */}

            <div className="mt-7 space-y-3">

              {/* PDF */}

              <button
                onClick={() => setSelectedFormat("pdf")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  selectedFormat === "pdf"
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <FileText size={24} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-white">
                    PDF Document
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Professional document suitable for reading and sharing.
                  </p>

                </div>

                {selectedFormat === "pdf" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">
                    <Check size={14} />
                  </div>
                )}

              </button>

              {/* DOCX */}

              <button
                onClick={() => setSelectedFormat("docx")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  selectedFormat === "docx"
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <FileDown size={24} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-white">
                    Word Document
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Editable DOCX format for further customization.
                  </p>

                </div>

                {selectedFormat === "docx" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">
                    <Check size={14} />
                  </div>
                )}

              </button>

            </div>

            {/* Export status */}

            {exported && (

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">

                <Check size={18} />

                Your {selectedFormat.toUpperCase()} eBook has been exported successfully!

              </div>

            )}

            {/* Buttons */}

            <div className="mt-7 flex gap-3">

              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 rounded-xl border border-white/10 py-3 font-medium text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {exporting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={17} />
                    Export {selectedFormat.toUpperCase()}
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Preview;