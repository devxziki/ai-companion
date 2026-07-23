import { useState, useEffect } from "react";
import {
  ChevronRight, File, Folder, FolderOpen, FileCode, FileJson, FileText, Image,
} from "lucide-react";
import { useWorkspace } from "@/store/workspace-store";
import { listDirectory, readFile } from "@/lib/fs-access";
import { cn } from "@/lib/utils";

function iconForFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return FileCode;
    case "json":
      return FileJson;
    case "md":
    case "txt":
    case "log":
      return FileText;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "ico":
      return Image;
    default:
      return File;
  }
}

export function FileTree() {
  const rootHandle = useWorkspace((s) => s.rootHandle);
  const rootName = useWorkspace((s) => s.rootName);
  const expandedPaths = useWorkspace((s) => s.expandedPaths);
  const toggleExpanded = useWorkspace((s) => s.toggleExpanded);
  const activeFilePath = useWorkspace((s) => s.activeFilePath);
  const clear = useWorkspace((s) => s.clear);

  if (!rootHandle) return null;

  return (
    <div className="px-2">
      <div className="flex items-center justify-between px-1 py-1.5">
        <button
          onClick={() => toggleExpanded("")}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronRight
            className={cn("h-3 w-3 transition-transform", expandedPaths.has("") && "rotate-90")}
          />
          <Folder className="h-3.5 w-3.5 text-brand" />
          {rootName}
        </button>
        <button
          onClick={clear}
          className="text-[10px] text-muted-foreground/50 hover:text-foreground"
          title="Close workspace"
        >
          &times;
        </button>
      </div>
      {expandedPaths.has("") && (
        <DirectoryTree dirPath="" depth={1} />
      )}
    </div>
  );
}

function DirectoryTree({ dirPath, depth }: { dirPath: string; depth: number }) {
  const rootHandle = useWorkspace((s) => s.rootHandle)!;
  const expandedPaths = useWorkspace((s) => s.expandedPaths);
  const toggleExpanded = useWorkspace((s) => s.toggleExpanded);
  const activeFilePath = useWorkspace((s) => s.activeFilePath);
  const openFile = useWorkspace((s) => s.openFile);
  const updateFileContent = useWorkspace((s) => s.updateFileContent);
  const [entries, setEntries] = useState<{ name: string; kind: string; path: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listDirectory(rootHandle, dirPath)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [rootHandle, dirPath]);

  if (loading) {
    return (
      <div className="py-1 pl-4 text-[11px] text-muted-foreground/50">Loading…</div>
    );
  }

  return (
    <div>
      {entries.map((entry) => {
        const isDir = entry.kind === "directory";
        const isExpanded = expandedPaths.has(entry.path);
        const Icon = isDir ? (isExpanded ? FolderOpen : Folder) : iconForFile(entry.name);

        return (
          <div key={entry.path}>
            <button
              onClick={() => {
                if (isDir) {
                  toggleExpanded(entry.path);
                } else {
                  openFile(entry.path, null);
                  readFile(rootHandle, entry.path).then((content) => {
                    updateFileContent(entry.path, content ?? "// Unable to read file");
                  });
                }
              }}
              className={cn(
                "flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-xs transition-colors",
                activeFilePath === entry.path
                  ? "bg-brand/15 text-brand"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              title={entry.path}
            >
              {isDir && (
                <ChevronRight
                  className={cn("h-3 w-3 shrink-0 transition-transform", isExpanded && "rotate-90")}
                />
              )}
              {!isDir && <span className="w-3" />}
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{entry.name}</span>
            </button>
            {isDir && isExpanded && (
              <DirectoryTree dirPath={entry.path} depth={depth + 1} />
            )}
          </div>
        );
      })}
      {entries.length === 0 && (
        <div className="py-1 pl-4 text-[11px] text-muted-foreground/30">(empty)</div>
      )}
    </div>
  );
}
