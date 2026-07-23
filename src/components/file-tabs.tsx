import { FileCode, X } from "lucide-react";
import { useWorkspace } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

export function FileTabs() {
  const openFiles = useWorkspace((s) => s.openFiles);
  const activeFilePath = useWorkspace((s) => s.activeFilePath);
  const setActiveFile = useWorkspace((s) => s.setActiveFile);
  const closeFile = useWorkspace((s) => s.closeFile);

  if (openFiles.length === 0) return null;

  return (
    <div className="flex items-center gap-px overflow-x-auto border-b border-border bg-muted/30 scrollbar-thin">
      {openFiles.map((f) => {
        const active = f.path === activeFilePath;
        const fileName = f.path.split("/").pop() ?? f.path;
        return (
          <div
            key={f.path}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-border select-none shrink-0",
              active
                ? "bg-background text-foreground"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
            onClick={() => setActiveFile(f.path)}
          >
            <FileCode className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-32">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(f.path);
              }}
              className="ml-0.5 grid h-4 w-4 place-items-center rounded text-muted-foreground/50 opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
              title="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
