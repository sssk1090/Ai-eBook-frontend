import {
  Sparkles,
  BookOpen,
  ArrowRight,
  WandSparkles,
  FileText,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <BookOpen size={22} />
            </div>

            <span className="text-xl font-bold">
              AI eBook Creator
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              How it works
            </a>

                <Link
                to="/login"
                className="rounded-lg border border-white/20 px-5 py-2 text-sm font-medium transition hover:bg-white/10"
                    >
                    Login
                </Link> 
          </div>

        </div>
      </nav>

      {/* Hero */}
      <main>

        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">

          {/* Left */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
              <Sparkles size={16} />
              AI-Powered eBook Creation
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Turn your ideas into
              <span className="block text-violet-400">
                amazing eBooks.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Create professionally structured eBooks using
              artificial intelligence. Generate outlines, chapters,
              and complete content in minutes.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

                <Link
                 to="/signup"
                 className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold transition hover:bg-violet-500"
                 >
                   Create Your eBook
                   <ArrowRight size={18} />
                </Link>

              
              <button className="rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-slate-200 transition hover:bg-white/10">
                See how it works
              </button>

            </div>

            <div className="mt-10 flex items-center gap-8 text-sm text-slate-400">

              <div className="flex items-center gap-2">
                <WandSparkles size={17} className="text-violet-400" />
                AI Generated
              </div>

              <div className="flex items-center gap-2">
                <FileText size={17} className="text-violet-400" />
                Easy Editing
              </div>

              <div className="flex items-center gap-2">
                <Download size={17} className="text-violet-400" />
                Export
              </div>

            </div>

          </div>

          {/* Right - eBook preview */}
          <div className="relative">

            <div className="absolute -inset-10 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">

              {/* Window header */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">

                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />

                <span className="ml-3 text-xs text-slate-500">
                  AI eBook Editor
                </span>

              </div>

              {/* Editor */}
              <div className="grid grid-cols-3 gap-5 pt-5">

                {/* Chapters */}
                <div className="col-span-1">

                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Chapters
                  </p>

                  <div className="space-y-2">

                    {[
                      "Introduction",
                      "Understanding AI",
                      "Machine Learning",
                      "Generative AI",
                      "Future of AI",
                    ].map((chapter, index) => (
                      <div
                        key={chapter}
                        className={`rounded-lg p-3 text-xs ${
                          index === 0
                            ? "bg-violet-600/20 text-violet-300"
                            : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <span className="mr-2 text-slate-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {chapter}
                      </div>
                    ))}

                  </div>

                </div>

                {/* Content */}
                <div className="col-span-2 rounded-xl bg-slate-900 p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <p className="text-xs text-slate-500">
                        CHAPTER 01
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        Introduction to AI
                      </h3>
                    </div>

                    <div className="rounded-lg bg-violet-600/20 p-2 text-violet-400">
                      <Sparkles size={18} />
                    </div>

                  </div>

                  <div className="space-y-3">

                    <div className="h-3 w-full rounded bg-slate-800" />
                    <div className="h-3 w-11/12 rounded bg-slate-800" />
                    <div className="h-3 w-10/12 rounded bg-slate-800" />

                    <div className="h-24 rounded-lg bg-slate-800/60" />

                    <div className="h-3 w-full rounded bg-slate-800" />
                    <div className="h-3 w-9/12 rounded bg-slate-800" />

                  </div>

                  <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold">
                    <Sparkles size={16} />
                    Generate with AI
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-white/10 bg-slate-900/50 px-6 py-24"
        >

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                Powerful Features
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                Everything you need to create an eBook
              </h2>

              <p className="mt-5 text-slate-400">
                From the first idea to the final PDF, AI eBook Creator
                helps you build your book faster.
              </p>

            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">

              {[
                {
                  icon: Sparkles,
                  title: "AI Generation",
                  description:
                    "Generate book outlines and chapter content using AI.",
                },
                {
                  icon: FileText,
                  title: "Easy Editing",
                  description:
                    "Edit, organize and customize every chapter of your book.",
                },
                {
                  icon: Download,
                  title: "Export",
                  description:
                    "Export your finished eBook into professional formats.",
                },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-violet-500/40"
                  >

                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                      <Icon size={24} />
                    </div>

                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-400">
                      {feature.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <BookOpen size={18} />
            AI eBook Creator
          </div>

          <p className="text-sm text-slate-500">
            Built with MERN + AI
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;