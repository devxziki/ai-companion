import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, FileCode } from "lucide-react";
import { useWorkspace } from "@/store/workspace-store";
import { FilePreview } from "@/components/file-preview";
import { FileTabs } from "@/components/file-tabs";

export const Route = createFileRoute("/workspace/")({
  component: WorkspaceIndex,
});

function WorkspaceIndex() {
  const rootHandle = useWorkspace((s) => s.rootHandle);
  const rootName = useWorkspace((s) => s.rootName);
  const openFiles = useWorkspace((s) => s.openFiles);

  if (!rootHandle) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-accent">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No workspace open</h2>
          <p className="text-sm text-muted-foreground">
            Open a folder from the sidebar to browse and edit files.
          </p>
        </div>
      </div>
    );
  }

  if (openFiles.length > 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <FileTabs />
        <div className="flex flex-1">
          <FilePreview />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-accent">
          <FileCode className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">{rootName}</h2>
        <p className="text-sm text-muted-foreground">
          Select a file from the sidebar to view its contents.
        </p>
      </div>
    </div>
  );
}
