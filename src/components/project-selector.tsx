import { useState } from "react";
import { FolderOpen, Plus, Folder, X } from "lucide-react";
import { useProject } from "@/store/project-store";
import { pickDirectory, createDirectory } from "@/lib/fs-access";
import { cn } from "@/lib/utils";

export function ProjectSelector({ collapsed }: { collapsed: boolean }) {
  const rootHandle = useProject((s) => s.rootHandle);
  const rootName = useProject((s) => s.rootName);
  const setProject = useProject((s) => s.setProject);
  const clearProject = useProject((s) => s.clearProject);
  const [creating, setCreating] = useState(false);

  const handleAddProject = async () => {
    const handle = await pickDirectory();
    if (handle) {
      setProject(handle, handle.name);
    }
  };

  const handleCreateProject = async () => {
    const name = prompt("Enter project name:");
    if (!name?.trim()) return;
    setCreating(true);
    try {
      const base = await pickDirectory();
      if (!base) return;
      const projectDir = await createDirectory(base, name.trim());
      if (projectDir) {
        const parent = base;
        setProject(parent, name.trim());
      }
    } finally {
      setCreating(false);
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 px-1 py-2 border-t border-sidebar-border">
        {rootHandle ? (
          <button
            onClick={clearProject}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            title={`Project: ${rootName}`}
          >
            <Folder className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button
              onClick={handleAddProject}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              title="Add existing project"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
            <button
              onClick={handleCreateProject}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              title="Create new project"
            >
              <Plus className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-sidebar-border px-2 py-2">
      {rootHandle ? (
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 px-3 py-2">
          <Folder className="h-4 w-4 shrink-0 text-brand" />
          <span className="flex-1 truncate text-xs font-medium">{rootName}</span>
          <button
            onClick={clearProject}
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            title="Close project"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <button
            onClick={handleAddProject}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Add existing project</span>
          </button>
          <button
            onClick={handleCreateProject}
            disabled={creating}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{creating ? "Creating…" : "Create new project"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
