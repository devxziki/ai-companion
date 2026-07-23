import { motion } from "framer-motion";
import { Code2, Lightbulb, Palette, Rocket, Sparkles } from "lucide-react";
import { Logo } from "./logo";

const EXAMPLES = [
  { icon: Code2, title: "Explain this code", prompt: "Explain what a JavaScript Promise is with an example." },
  { icon: Lightbulb, title: "Brainstorm ideas", prompt: "Give me 5 unique startup ideas for developer productivity." },
  { icon: Palette, title: "Design help", prompt: "Suggest a modern color palette for a coding tool." },
  { icon: Rocket, title: "Ship faster", prompt: "Write a debounce function in TypeScript with examples." },
];

const CAPABILITIES = [
  "Writes and refactors code",
  "Explains errors & stack traces",
  "Drafts docs and tests",
  "Renders markdown, tables & math",
];

export function WelcomeScreen({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <Logo size={64} className="mx-auto" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        How can I help you today?
      </motion.h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Ask a question, paste an error, or start with an example below.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {EXAMPLES.map((ex) => (
          <button
            key={ex.title}
            onClick={() => onPick(ex.prompt)}
            className="group flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-4 text-left transition-all hover:border-brand/40 hover:bg-card"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition-transform group-hover:scale-105">
              <ex.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{ex.title}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{ex.prompt}</div>
            </div>
          </button>
        ))}
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {CAPABILITIES.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-brand" /> {c}
          </span>
        ))}
      </div>
    </div>
  );
}
