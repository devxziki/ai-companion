import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FolderOpen, PanelLeftClose, PanelLeftOpen, X,
} from "lucide-react";
import { Logo, WordMark } from "@/components/logo";
import { FileTree } from "@/components/file-tree";
import { useWorkspace } from "@/store/workspace-store";
import { pickDirectory, readFileTree } from "@/lib/fs-access";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — MiniCoder" },
      { name: "description", content: "Browse and edit your local workspace files." },
    ],
  }),
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <WorkspaceSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceTopbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function WorkspaceSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const rootHandle = useWorkspace((s) => s.rootHandle);
  const rootName = useWorkspace((s) => s.rootName);
  const setRoot = useWorkspace((s) => s.setRoot);
  const setFileTree = useWorkspace((s) => s.setFileTree);

  const openWorkspace = async () => {
    const handle = await pickDirectory();
    if (handle) {
      setRoot(handle, handle.name);
      const tree = await readFileTree(handle);
      setFileTree(tree);
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        open ? "w-72" : "w-[68px]",
      )}
    >
      <div className="flex items-center justify-between p-3">
        {open ? <WordMark /> : <Logo size={30} />}
        <button
          onClick={onToggle}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Toggle sidebar"
        >
          {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-1 pb-2">
          {!rootHandle ? (
            <button
              onClick={openWorkspace}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-sidebar-border px-3 py-4 text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground",
                !open && "flex-col px-0 py-3",
              )}
            >
              <FolderOpen className="h-5 w-5 shrink-0" />
              {open && (
                <span>Open a folder to view files</span>
              )}
            </button>
          ) : open ? (
            <FileTree />
          ) : (
            <button
              onClick={openWorkspace}
              className="mx-auto grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              title={`Workspace: ${rootName}`}
            >
              <FolderOpen className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-sidebar-border p-2">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
            !open && "justify-center",
          )}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {open && <span>Back to home</span>}
        </Link>
      </div>
    </aside>
  );
}

function WorkspaceTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const rootName = useWorkspace((s) => s.rootName);

  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 px-3 sm:px-4">
      <button
        onClick={onToggleSidebar}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
        aria-label="Toggle sidebar"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-medium">
          {rootName ? `Workspace: ${rootName}` : "Workspace"}
        </span>
      </div>
    </header>
  );
}
