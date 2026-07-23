import { useState } from "react";
import { Check, Copy, Download, WrapText } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  language?: string;
  className?: string;
  children?: React.ReactNode;
};

export function CodeBlock({ code, language, className, children }: Props) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const lang = (language ?? "text").toLowerCase();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const download = () => {
    const ext = extFor(lang);
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border bg-[oklch(0.14_0.014_260)]">
      <div className="flex items-center justify-between border-b border-border/70 px-3 py-1.5 text-xs">
        <span className="font-mono text-muted-foreground">{lang}</span>
        <div className="flex items-center gap-1">
          <IconBtn label="Toggle wrap" onClick={() => setWrap((w) => !w)} active={wrap}>
            <WrapText className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Download" onClick={download}>
            <Download className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label={copied ? "Copied" : "Copy"} onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
          </IconBtn>
        </div>
      </div>
      <pre
        className={cn(
          "scrollbar-thin overflow-x-auto p-4 text-[0.85rem] leading-relaxed font-mono",
          wrap && "whitespace-pre-wrap break-words",
          className,
        )}
      >
        {children ?? <code>{code}</code>}
      </pre>
    </div>
  );
}

function IconBtn({
  children, onClick, label, active,
}: { children: React.ReactNode; onClick: () => void; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function extFor(lang: string) {
  const map: Record<string, string> = {
    ts: "ts", typescript: "ts", js: "js", javascript: "js",
    tsx: "tsx", jsx: "jsx", py: "py", python: "py",
    rb: "rb", go: "go", rust: "rs", java: "java",
    css: "css", html: "html", json: "json", yaml: "yml", yml: "yml",
    bash: "sh", sh: "sh", shell: "sh", sql: "sql", md: "md",
  };
  return map[lang] ?? "txt";
}
