import { useState } from "react";
import { Folder, FolderOpen, X } from "lucide-react";
import { useProject } from "@/store/project-store";
import { pickDirectory } from "@/lib/fs-access";

export function ProjectBar() {
  const rootHandle = useProject((s) => s.rootHandle);
  const rootName = useProject((s) => s.rootName);
  const setProject = useProject((s) => s.setProject);
  const clearProject = useProject((s) => s.clearProject);

  const handleAdd = async () => {
    const handle = await pickDirectory();
    if (handle) setProject(handle, handle.name);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-2 sm:px-4">
      {rootHandle ? (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5">
          <Folder className="h-3.5 w-3.5 shrink-0 text-brand" />
          <span className="flex-1 truncate text-xs font-medium text-foreground/80">{rootName}</span>
          <button
            onClick={clearProject}
            className="grid h-5 w-5 place-items-center rounded text-muted-foreground/50 hover:bg-accent hover:text-foreground"
            title="Close project"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Add project
        </button>
      )}
    </div>
  );
}
