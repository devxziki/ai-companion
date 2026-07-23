import { useEffect, useState } from "react";
import { X, FileCode, Copy, Check } from "lucide-react";
import { useWorkspace } from "@/store/workspace-store";
import { readFile } from "@/lib/fs-access";

export function FilePreview() {
  const rootHandle = useWorkspace((s) => s.rootHandle);
  const openFilePath = useWorkspace((s) => s.openFilePath);
  const openFileContent = useWorkspace((s) => s.openFileContent);
  const setOpenFile = useWorkspace((s) => s.setOpenFile);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (openFilePath && openFileContent === null && rootHandle) {
      readFile(rootHandle, openFilePath).then((content) => {
        setOpenFile(openFilePath, content ?? "// Unable to read file");
      });
    }
  }, [openFilePath, rootHandle]);

  if (!openFilePath) return null;

  const ext = openFilePath.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "ico", "webp"].includes(ext);

  const copyContent = () => {
    if (openFileContent) {
      navigator.clipboard.writeText(openFileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2">
        <span className="truncate text-xs font-medium text-foreground" title={openFilePath}>
          <FileCode className="mr-1.5 inline h-3.5 w-3.5" />
          {openFilePath.split("/").pop()}
        </span>
        <div className="flex items-center gap-1">
          {openFileContent && (
            <button
              onClick={copyContent}
              className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              title="Copy content"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={() => setOpenFile(null, null)}
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="scrollbar-thin flex-1 overflow-auto p-3">
        {isImage && openFileContent ? (
          <img src={openFileContent} alt={openFilePath} className="max-w-full rounded-lg" />
        ) : openFileContent !== null ? (
          <pre className="whitespace-pre-wrap break-all rounded-lg bg-background/60 p-3 font-mono text-xs leading-relaxed text-foreground">
            {openFileContent || "(empty file)"}
          </pre>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading…</div>
        )}
      </div>
    </div>
  );
}
