import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settings-store";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  streaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
};

export function ChatInput({
  value, onChange, onSubmit, onStop, streaming, disabled, placeholder, autoFocus,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const sendOnEnter = useSettings((s) => s.sendOnEnter);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && sendOnEnter && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (value.trim() && !streaming) onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !streaming && !disabled;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        className={cn(
          "glass relative flex items-end gap-2 rounded-3xl p-2 shadow-xl shadow-black/10 transition-all",
          "focus-within:border-brand/60 focus-within:shadow-brand/10",
        )}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={placeholder ?? "Ask MiniCoder anything…"}
          className="scrollbar-thin max-h-60 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
          >
            <Square className="h-4 w-4" fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all",
              canSend
                ? "bg-brand text-brand-foreground hover:scale-105 shadow-md shadow-brand/30"
                : "bg-muted text-muted-foreground",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        MiniCoder can make mistakes. Verify important information. Enter to send · Shift + Enter for a new line.
      </p>
    </div>
  );
}
