import { useEffect, useState } from "react";
import axios from "axios";

import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  FileText,
  Check,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useBook } from "../context/BookContext";

function Editor() {
  const navigate = useNavigate();

  const { token } = useAuth();
  const { currentBook, setBook, clearBook } = useBook();

  // --------------------------------------------------
  // Chapters
  // --------------------------------------------------

  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);

  // --------------------------------------------------
  // Book visibility
  // --------------------------------------------------

  const [visibility, setVisibility] = useState("private");

  // --------------------------------------------------
  // UI states
  // --------------------------------------------------

  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load chapters + visibility from BookContext
  // --------------------------------------------------

  useEffect(() => {
    if (!currentBook) {
      return;
    }

    const bookChapters = Array.isArray(currentBook.chapters)
      ? currentBook.chapters
      : [];

    const formattedChapters = bookChapters.map((chapter, index) => ({
      id: chapter._id || chapter.id || `${Date.now()}-${index}`,
      title: chapter.title || `Chapter ${index + 1}`,
      content: chapter.content || "",
    }));

    setChapters(formattedChapters);

    // Load current visibility
    setVisibility(currentBook.visibility || "private");

    if (formattedChapters.length > 0) {
      setActiveChapter(formattedChapters[0].id);
    }
  }, [currentBook]);

  // --------------------------------------------------
  // Current chapter
  // --------------------------------------------------

  const currentChapter = chapters.find(
    (chapter) => chapter.id === activeChapter
  );

  // --------------------------------------------------
  // If user opens Editor directly
  // --------------------------------------------------

  useEffect(() => {
    if (!currentBook) {
      setError(
        "No book is currently selected. Please create or open a book from the dashboard."
      );
    }
  }, [currentBook]);

  // --------------------------------------------------
  // Change chapter content
  // --------------------------------------------------

  const handleContentChange = (e) => {
    const newContent = e.target.value;

    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.id === activeChapter
          ? {
              ...chapter,
              content: newContent,
            }
          : chapter
      )
    );

    setSaved(false);
  };

  // --------------------------------------------------
  // Change visibility
  // --------------------------------------------------

  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
    setSaved(false);
    setError("");
  };

  // --------------------------------------------------
  // Add chapter
  // --------------------------------------------------

  const handleAddChapter = () => {
    const newChapter = {
      id: `new-${Date.now()}`,
      title: `New Chapter ${chapters.length + 1}`,
      content: `# New Chapter ${chapters.length + 1}

Start writing your chapter content here...`,
    };

    setChapters((prev) => [...prev, newChapter]);

    setActiveChapter(newChapter.id);
    setSaved(false);
  };

  // --------------------------------------------------
  // Delete chapter
  // --------------------------------------------------

  const handleDeleteChapter = () => {
    if (chapters.length === 1) {
      setError("A book must contain at least one chapter.");
      return;
    }

    const currentIndex = chapters.findIndex(
      (chapter) => chapter.id === activeChapter
    );

    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== activeChapter
    );

    setChapters(remainingChapters);

    const nextChapter =
      remainingChapters[currentIndex] ||
      remainingChapters[currentIndex - 1];

    if (nextChapter) {
      setActiveChapter(nextChapter.id);
    }

    setSaved(false);
    setError("");
  };

  // --------------------------------------------------
  // Save book to MongoDB
  // --------------------------------------------------

  const handleSave = async () => {
    if (!currentBook?._id) {
      setError("Book ID not found. Please create the book again.");
      return;
    }

    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const chaptersForDatabase = chapters.map((chapter) => {
        const databaseChapter = {
          title: chapter.title,
          content: chapter.content || "",
        };

        // Keep MongoDB _id for existing chapters.
        // New chapters don't have _id yet.
        if (
          chapter.id &&
          typeof chapter.id === "string" &&
          !chapter.id.startsWith("new-")
        ) {
          databaseChapter._id = chapter.id;
        }

        return databaseChapter;
      });

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/books/${currentBook._id}`,
        {
          chapters: chaptersForDatabase,

          // Save Private/Public setting
          visibility: visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedBook = response.data.book;

      // Update BookContext with latest MongoDB data
      setBook(updatedBook);

      // Update visibility from database response
      setVisibility(updatedBook.visibility || "private");

      // Convert returned MongoDB chapters back into editor format
      const updatedChapters = (updatedBook.chapters || []).map(
        (chapter, index) => ({
          id: chapter._id || `chapter-${index}`,
          title: chapter.title || `Chapter ${index + 1}`,
          content: chapter.content || "",
        })
      );

      setChapters(updatedChapters);

      if (updatedChapters.length > 0) {
        const activeStillExists = updatedChapters.some(
          (chapter) => chapter.id === activeChapter
        );

        if (!activeStillExists) {
          setActiveChapter(updatedChapters[0].id);
        }
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Save book error:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while saving the book.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete entire book
  // --------------------------------------------------

  const handleDeleteBook = async () => {
    if (!currentBook?._id) {
      setError("Book ID not found.");
      return;
    }

    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentBook.title}"?\n\nThis will permanently delete the book and all its chapters.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/books/${currentBook._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear the current book from BookContext
      clearBook();

      // Go back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Delete book error:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while deleting the book.";

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // AI generation
  // --------------------------------------------------

  const handleGenerateAI = async () => {
    if (!currentChapter) {
      setError("Please select a chapter first.");
      return;
    }

    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    if (!currentBook) {
      setError("Book information is not available.");
      return;
    }

    setIsGenerating(true);
    setSaved(false);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/generate-chapter`,
        {
          title: currentBook.title,
          topic: currentBook.topic,
          description: currentBook.description,
          targetAudience: currentBook.targetAudience,
          numberOfChapters: currentBook.numberOfChapters,
          writingStyle: currentBook.writingStyle,
          chapterTitle: currentChapter.title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const generatedContent = response.data.content;

      if (!generatedContent) {
        throw new Error("No content was returned by the AI.");
      }

      setChapters((prevChapters) =>
        prevChapters.map((chapter) =>
          chapter.id === activeChapter
            ? {
                ...chapter,
                content: generatedContent,
              }
            : chapter
        )
      );

      setSaved(false);
    } catch (error) {
      console.error("AI generation error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while generating content.";

      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------
  // Word count
  // --------------------------------------------------

  const wordCount = currentChapter?.content
    ? currentChapter.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  // --------------------------------------------------
  // If no book is loaded
  // --------------------------------------------------

  if (!currentBook) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20">
            <BookOpen size={28} className="text-violet-400" />
          </div>

          <h1 className="text-xl font-semibold">
            No Book Selected
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Please create a new book or open an existing book from your
            dashboard before opening the editor.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">

        <div className="flex items-center gap-4">

          <Link
            to="/dashboard"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <BookOpen size={19} />
            </div>

            <div>
              <h1 className="max-w-[300px] truncate text-sm font-semibold">
                {currentBook.title}
              </h1>

              <p className="text-xs text-slate-500">
                {chapters.length} chapters
              </p>
            </div>

          </div>

        </div>

        {/* ================= HEADER ACTIONS ================= */}

        <div className="flex items-center gap-2 sm:gap-3">

          {/* Saved indicator */}

          {saved && (
            <div className="hidden items-center gap-1 text-sm text-emerald-400 sm:flex">
              <Check size={16} />
              Saved
            </div>
          )}

          {/* Visibility */}

          <select
            value={visibility}
            onChange={handleVisibilityChange}
            className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-2 text-xs font-medium text-slate-300 outline-none transition hover:border-violet-500/40 focus:border-violet-500 sm:px-3 sm:text-sm"
            title="Book visibility"
          >
            <option value="private">
              🔒 Private
            </option>

            <option value="public">
              🌍 Public
            </option>
          </select>

          {/* Preview */}

          <button
            onClick={() => navigate(`/preview/${currentBook._id}`)}
            className="hidden items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:flex"
          >
            <Eye size={17} />
            Preview
          </button>

          {/* Delete Book */}

          <button
            onClick={handleDeleteBook}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            title="Delete book"
          >
            <Trash2 size={17} />
            {deleting ? "Deleting..." : "Delete Book"}
          </button>

          {/* Save */}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            <Save size={16} />

            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </header>

      {/* ================= VISIBILITY INFO ================= */}

      {visibility === "public" && (
        <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-5 py-2 text-center text-xs text-emerald-400">
          🌍 This book is set to Public. Other users can see it in Explore
          after you save.
        </div>
      )}

      {visibility === "private" && (
        <div className="border-b border-white/5 bg-white/[0.02] px-5 py-2 text-center text-xs text-slate-500">
          🔒 This book is Private. Only you can view it.
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-2.5 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ================= EDITOR ================= */}

      <div className="flex min-h-0 flex-1">

        {/* ================= SIDEBAR ================= */}

        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950 md:flex md:flex-col">

          {/* Sidebar heading */}

          <div className="border-b border-white/10 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Book Chapters
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {chapters.length} chapters
                </p>

              </div>

              <button
                onClick={handleAddChapter}
                className="rounded-lg bg-violet-600 p-2 text-white transition hover:bg-violet-500"
                title="Add chapter"
              >
                <Plus size={18} />
              </button>

            </div>

          </div>

          {/* Chapter list */}

          <div className="flex-1 overflow-y-auto p-3">

            <div className="space-y-2">

              {chapters.map((chapter, index) => (

                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={`group flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                    activeChapter === chapter.id
                      ? "border border-violet-500/30 bg-violet-600/10"
                      : "border border-transparent hover:bg-white/5"
                  }`}
                >

                  <div className="mt-0.5 shrink-0">

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                        activeChapter === chapter.id
                          ? "bg-violet-600 text-white"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                  </div>

                  <div className="min-w-0 flex-1">

                    <p
                      className={`line-clamp-2 text-sm font-medium ${
                        activeChapter === chapter.id
                          ? "text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {chapter.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Chapter {index + 1}
                    </p>

                  </div>

                </button>

              ))}

            </div>

          </div>

          {/* Add chapter */}

          <div className="border-t border-white/10 p-4">

            <button
              onClick={handleAddChapter}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-sm text-slate-400 transition hover:border-violet-500/40 hover:text-violet-400"
            >
              <Plus size={17} />
              Add Chapter
            </button>

          </div>

        </aside>

        {/* ================= MAIN EDITOR ================= */}

        <main className="flex min-w-0 flex-1 flex-col">

          {/* Editor toolbar */}

          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">

            <div className="flex items-center gap-3">

              <FileText
                size={18}
                className="text-violet-400"
              />

              <div>

                <p className="text-sm font-medium">
                  {currentChapter?.title || "No Chapter Selected"}
                </p>

                <p className="text-xs text-slate-600">
                  Markdown Editor
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              {/* Delete chapter */}

              <button
                onClick={handleDeleteChapter}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                title="Delete chapter"
                disabled={chapters.length <= 1}
              >
                <Trash2 size={18} />
              </button>

              {/* Save */}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />

                {saving ? "Saving..." : "Save"}
              </button>

            </div>

          </div>

          {/* Text editor */}

          <div className="flex-1 overflow-y-auto">

            <div className="mx-auto max-w-4xl px-6 py-8 lg:px-12">

              <textarea
                value={currentChapter?.content || ""}
                onChange={handleContentChange}
                className="min-h-[600px] w-full resize-none bg-transparent text-[16px] leading-8 text-slate-200 outline-none placeholder:text-slate-600"
                placeholder="Start writing your chapter..."
              />

            </div>

          </div>

          {/* Bottom toolbar */}

          <div className="shrink-0 border-t border-white/10 bg-slate-950 px-5 py-3">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div className="flex items-center gap-5 text-xs text-slate-500">

                <span>
                  {wordCount} words
                </span>

                <span>
                  {currentChapter?.content.length || 0} characters
                </span>

                <span>
                  Chapter{" "}
                  {chapters.findIndex(
                    (chapter) => chapter.id === activeChapter
                  ) + 1}{" "}
                  of {chapters.length}
                </span>

              </div>

              {/* AI Generate */}

              <button
                onClick={handleGenerateAI}
                disabled={isGenerating || !currentChapter}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />

                    Generate with AI
                  </>
                )}

              </button>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Editor;