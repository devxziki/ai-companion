import { API_BASE } from "@/lib/models";

export type StreamHandle = { stop: () => void };

export function streamAI(
  messages: { role: string; content: string }[],
  model: string,
  onToken: (chunk: string, full: string) => void,
  onDone: (full: string) => void,
  onError?: (error: Error) => void,
): StreamHandle {
  let aborted = false;
  const controller = new AbortController();

  fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`API error ${response.status}: ${text || response.statusText}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let full = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || aborted) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content ?? "";
            if (content) {
              full += content;
              onToken(content, full);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
      if (!aborted) onDone(full);
    })
    .catch((err) => {
      if (aborted) return;
      onError?.(err);
      onDone("");
    });

  return {
    stop() {
      aborted = true;
      controller.abort();
    },
  };
}

export function generateTitle(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 42) return cleaned || "New chat";
  return cleaned.slice(0, 42).trimEnd() + "…";
}
