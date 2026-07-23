// Mock streaming assistant. Produces a plausible reply based on the prompt.

const CANNED: Record<string, string> = {
  code: `Sure! Here's a small example in TypeScript:

\`\`\`ts
// Debounce utility
export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 200) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
\`\`\`

**How it works**

1. Each call resets the pending timer.
2. The wrapped function only fires once the user pauses.
3. Great for search inputs and resize handlers.

> Tip: pair it with \`useMemo\` when using inside React components.`,

  hello: `Hi there! 👋 I'm **MiniCoder**, your AI coding companion. I can help you:

- Write and refactor code across many languages
- Explain unfamiliar snippets or errors
- Draft docs, tests and commit messages
- Brainstorm architecture and product ideas

What are we building today?`,

  table: `Here's a quick comparison:

| Feature | Free | Pro |
| --- | --- | --- |
| Chats | Unlimited | Unlimited |
| Models | 3 | 10+ |
| Export | ✅ | ✅ |
| Priority | — | ✅ |

Let me know which plan fits your workflow.`,
};

function pick(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/\b(hi|hello|hey|yo)\b/.test(p)) return CANNED.hello;
  if (/\b(table|compare|comparison)\b/.test(p)) return CANNED.table;
  if (/\b(code|function|typescript|javascript|python|debounce)\b/.test(p)) return CANNED.code;

  return `Great question — let me think through **"${prompt.slice(0, 80)}"**.

Here's a structured take:

1. **Context.** I'm running in demo mode without a live model, so I'll sketch an answer using placeholder reasoning.
2. **Approach.** In a real deployment, MiniCoder would stream tokens from your selected provider.
3. **Next steps.** Try asking me to write code, build a table, or explain a concept.

\`\`\`bash
# Try one of these prompts
> write a debounce function in typescript
> compare free vs pro plans in a table
> explain useEffect vs useLayoutEffect
\`\`\`

Ask me anything and I'll keep going.`;
}

export type StreamHandle = { stop: () => void };

export function streamMockReply(
  prompt: string,
  onToken: (chunk: string, full: string) => void,
  onDone: (full: string) => void,
): StreamHandle {
  const full = pick(prompt);
  // Split into small chunks (word + space) for a typewriter effect.
  const parts = full.match(/\s+|\S+/g) ?? [full];
  let i = 0;
  let acc = "";
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    if (i >= parts.length) {
      onDone(acc);
      return;
    }
    const chunk = parts[i++];
    acc += chunk;
    onToken(chunk, acc);
    // Slight jitter so it feels natural
    const delay = /\n\n/.test(chunk) ? 90 : Math.random() * 22 + 10;
    setTimeout(tick, delay);
  };

  // Small initial "thinking" gap
  const initial = setTimeout(tick, 300);

  return {
    stop() {
      stopped = true;
      clearTimeout(initial);
      onDone(acc);
    },
  };
}

export function generateTitle(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 42) return cleaned || "New chat";
  return cleaned.slice(0, 42).trimEnd() + "…";
}
