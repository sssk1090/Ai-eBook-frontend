
import { useState } from "react";
import axios from "axios";

import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  WandSparkles,
  Check,
  ChevronRight,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useBook } from "../context/BookContext";
import { payForGeneration } from "../utils/payment";

function CreateBook() {
  const navigate = useNavigate();

  const { token } = useAuth();
  const { setBook } = useBook();

  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    description: "",
    audience: "College Students",
    chapters: 6,
    style: "Educational",
  });

  const [showOutline, setShowOutline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [outline, setOutline] = useState([]);
  const [createdBook, setCreatedBook] = useState(null);

  const outlinePriceRupees = Math.max(0, Number(formData.chapters) - 4) * 5;

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // GENERATE AI OUTLINE + CREATE BOOK
  // =====================================================

  const handleGenerate = async () => {
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a book title.");
      return;
    }

    if (!formData.topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: PREPARE OUTLINE REQUEST

      const outlinePayload = {
        title: formData.title.trim(),
        topic: formData.topic.trim(),
        description: formData.description.trim(),
        targetAudience: formData.audience,
        numberOfChapters: Number(formData.chapters),
        writingStyle: formData.style,
      };

      const requestOutline = (paymentOrderId = null) =>
        axios.post(
           `${process.env.REACT_APP_API_URL}/api/ai/generate-outline`,
          {
            ...outlinePayload,
            ...(paymentOrderId ? { paymentOrderId } : {}),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

      let outlineResponse;

      // STEP 2: TRY FREE GENERATION FIRST

      try {
        outlineResponse = await requestOutline();
      } catch (requestError) {
        const paymentRequired =
          requestError.response?.status === 402 &&
          requestError.response?.data?.paymentRequired === true &&
          requestError.response?.data?.paymentType === "outline";

        // Only open checkout when the backend explicitly
        // confirms that the free outline allowance is exhausted.
        if (!paymentRequired) {
          throw requestError;
        }

        // STEP 3: OPEN RAZORPAY CHECKOUT

        const paymentOrderId = await payForGeneration({
          token,
          paymentType: "outline",
          chapterCount: Number(formData.chapters),
        });

        // STEP 4: RETRY WITH THE VERIFIED PAYMENT ORDER

        outlineResponse = await requestOutline(paymentOrderId);
      }

      // STEP 5: READ THE ACTUAL AI-GENERATED OUTLINE

      const generatedOutline =
        outlineResponse.data?.outline?.chapters || [];

      if (!Array.isArray(generatedOutline) || generatedOutline.length === 0) {
        throw new Error("The AI returned an empty outline.");
      }

      const finalOutline = generatedOutline
        .slice(0, Number(formData.chapters))
        .map((chapter, index) => ({
          title:
            chapter.title?.trim() || `Chapter ${index + 1}`,
          description:
            chapter.description?.trim() ||
            "Chapter content will be generated later.",
        }));

      setOutline(finalOutline);

      // STEP 6: CREATE THE BOOK IN MONGODB

      const bookData = {
        title: formData.title.trim(),
        topic: formData.topic.trim(),
        description: formData.description.trim(),
        targetAudience: formData.audience,
        numberOfChapters: Number(formData.chapters),
        writingStyle: formData.style,
        visibility: "private",

        // Save the generated chapter titles.
        // Chapter content can be generated later in Editor.
        chapters: finalOutline.map((chapter) => ({
          title: chapter.title,
          content: "",
        })),
      };

      const bookResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/books`,
        bookData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newBook = bookResponse.data.book;

      if (!newBook) {
        throw new Error("The server did not return the created book.");
      }

      // STEP 7: UPDATE BOOK CONTEXT

      setBook(newBook);
      setCreatedBook(newBook);
      setShowOutline(true);
    } catch (error) {
      console.error("Create book / outline error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong while generating your book outline."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CONTINUE TO EDITOR
  // =====================================================

  const handleContinue = () => {
    if (!createdBook) {
      setError("Book has not been created yet.");
      return;
    }

    navigate("/editor");
  };

  // =====================================================
  // EDIT DETAILS
  // =====================================================

  const handleEditDetails = () => {
    setShowOutline(false);
    setCreatedBook(null);
    setOutline([]);
    setError("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
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

              <span className="font-bold">Create eBook</span>
            </div>
          </div>

          <div className="text-sm text-slate-500">Step 1 of 2</div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* HEADING */}

        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/15 text-violet-400">
            <WandSparkles size={28} />
          </div>

          <h1 className="mt-6 text-4xl font-bold">
            What do you want to write about?
          </h1>

          <p className="mt-3 text-slate-400">
            Tell us about your book and our AI will create
            a structured chapter outline for you.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* FORM */}

        {!showOutline ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="space-y-6">
              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Book Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. The Future of Artificial Intelligence"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* TOPIC */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Topic
                </label>

                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Artificial Intelligence for Beginners"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Briefly describe what you want your eBook to cover..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {/* OPTIONS */}

              <div className="grid gap-5 md:grid-cols-3">
                {/* AUDIENCE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Target Audience
                  </label>

                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-violet-500"
                  >
                    <option>Beginners</option>
                    <option>College Students</option>
                    <option>Professionals</option>
                    <option>Advanced Readers</option>
                  </select>
                </div>

                {/* CHAPTER COUNT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Number of Chapters
                  </label>

                  <select
                    name="chapters"
                    value={formData.chapters}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-violet-500"
                  >
                    <option value="4">4 Chapters</option>
                    <option value="5">5 Chapters</option>
                    <option value="6">6 Chapters</option>
                    <option value="8">8 Chapters</option>
                    <option value="10">10 Chapters</option>
                  </select>
                </div>

                {/* WRITING STYLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Writing Style
                  </label>

                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-violet-500"
                  >
                    <option>Educational</option>
                    <option>Professional</option>
                    <option>Conversational</option>
                    <option>Storytelling</option>
                  </select>
                </div>
              </div>

              {/* AI INFO */}

              <div className="flex gap-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                <Sparkles
                  size={22}
                  className="mt-0.5 shrink-0 text-violet-400"
                />

                <div>
                  <h3 className="font-medium">
                    AI will create your outline
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Based on your topic, audience and writing style,
                    AI will generate a structured chapter outline
                    for your eBook.
                  </p>
                </div>
              </div>

              {/* OUTLINE PRICE */}

              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium">Outline generation price</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      First 4 chapters are free. Each additional chapter costs ₹5.
                    </p>
                  </div>
                  <div className="shrink-0 text-xl font-bold text-violet-300">
                    {outlinePriceRupees === 0 ? "Free" : `₹${outlinePriceRupees}`}
                  </div>
                </div>
              </div>

              {/* GENERATE BUTTON */}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating AI Outline...
                  </>
                ) : (
                  <>
                    <Sparkles size={19} />
                    Generate Outline with AI
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* GENERATED OUTLINE */

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-violet-400">
                    <Check size={17} />
                    AI outline generated successfully
                  </div>

                  <h2 className="mt-3 text-2xl font-bold">
                    {formData.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {outline.length} chapters • {formData.audience} •{" "}
                    {formData.style}
                  </p>
                </div>

                <div className="rounded-xl bg-violet-600/15 p-3 text-violet-400">
                  <BookOpen size={24} />
                </div>
              </div>

              {/* ACTUAL AI-GENERATED CHAPTERS */}

              <div className="mt-8 space-y-3">
                {outline.map((chapter, index) => (
                  <div
                    key={`${chapter.title}-${index}`}
                    className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/15 text-sm font-semibold text-violet-400">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">{chapter.title}</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {chapter.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-600 transition group-hover:text-violet-400"
                    />
                  </div>
                ))}
              </div>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleEditDetails}
                  className="flex-1 rounded-xl border border-white/10 py-3.5 font-medium text-slate-300 hover:bg-white/5"
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-semibold hover:bg-violet-500"
                >
                  Continue to Editor
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreateBook;
