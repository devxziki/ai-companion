import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FolderOpen, Github, Sparkles } from "lucide-react";
import { Logo, WordMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiniCoder — Your intelligent AI coding assistant" },
      {
        name: "description",
        content:
          "MiniCoder is a fast, modern AI chat interface for developers. Chat, code, and solve problems across multiple models — right in your browser.",
      },
      { property: "og:title", content: "MiniCoder — Your intelligent AI coding assistant" },
      {
        property: "og:description",
        content:
          "Chat, code, create and solve problems with multiple AI models in a beautiful minimalist interface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 600px at 50% -10%, color-mix(in oklab, var(--brand) 25%, transparent), transparent 60%), radial-gradient(700px 500px at 90% 110%, color-mix(in oklab, oklch(0.72 0.18 200) 20%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <WordMark />
        <div className="flex items-center gap-1">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-20 pt-10 text-center sm:pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <Logo size={88} className="mx-auto rounded-3xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3 w-3 text-brand" /> New — Local-first, no login required
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Mini<span className="text-gradient-brand">Coder</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Your intelligent AI assistant. Chat, code, create and solve problems with multiple AI models.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/chat"
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-brand-foreground shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02]"
          >
            Start chatting
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <FolderOpen className="h-4 w-4" /> Open Workspace
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-16 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-3"
        >
          {[
            { t: "10+ models", d: "Switch between placeholder models for any task." },
            { t: "Local-first", d: "Your chats live in your browser. Export anytime." },
            { t: "Made for devs", d: "Beautiful code blocks, syntax highlight, markdown." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card/60 p-4">
              <div className="text-sm font-semibold">{f.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
