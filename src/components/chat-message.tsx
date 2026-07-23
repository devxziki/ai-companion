import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Pencil, RefreshCw, X } from "lucide-react";
import { format } from "date-fns";
import { Logo } from "./logo";
import { MarkdownRenderer } from "./markdown-renderer";
import { TypingIndicator } from "./typing-indicator";
import { cn } from "@/lib/utils";
import type { Message } from "@/store/chat-store";

type Props = {
  message: Message;
  streaming?: boolean;
  onEdit?: (id: string, content: string) => void;
  onRegenerate?: (id: string) => void;
};

export function ChatMessage({ message, streaming, onEdit, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("group relative flex w-full gap-3 py-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-1 shrink-0">
          <Logo size={30} />
        </div>
      )}

      <div className={cn("flex max-w-[85%] min-w-0 flex-col", isUser ? "items-end" : "items-start")}>
        {editing && isUser ? (
          <div className="w-full">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-24 resize-y rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:border-brand"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => { setEditing(false); setDraft(message.content); }}
                className="rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                <X className="mr-1 inline h-3 w-3" /> Cancel
              </button>
              <button
                onClick={() => { onEdit?.(message.id, draft); setEditing(false); }}
                className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground hover:opacity-90"
              >
                Save & submit
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "min-w-0 rounded-2xl px-4 py-2.5 text-sm",
              isUser
                ? "bg-brand text-brand-foreground rounded-br-md shadow-sm"
                : "bg-transparent text-foreground",
            )}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
            ) : message.content ? (
              <div className={cn(streaming && "typing-cursor")}>
                <MarkdownRenderer content={message.content} />
              </div>
            ) : (
              <TypingIndicator />
            )}
          </div>
        )}

        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span>{format(message.createdAt, "HH:mm")}</span>
          <button
            onClick={copy}
            className="grid h-6 w-6 place-items-center rounded-md hover:bg-accent hover:text-foreground"
            aria-label="Copy message"
            title="Copy"
          >
            {copied ? <Check className="h-3 w-3 text-brand" /> : <Copy className="h-3 w-3" />}
          </button>
          {isUser && onEdit && (
            <button
              onClick={() => setEditing(true)}
              className="grid h-6 w-6 place-items-center rounded-md hover:bg-accent hover:text-foreground"
              aria-label="Edit message"
              title="Edit"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {!isUser && onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="grid h-6 w-6 place-items-center rounded-md hover:bg-accent hover:text-foreground"
              aria-label="Regenerate"
              title="Regenerate"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
