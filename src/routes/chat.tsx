import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "MiniCoder — Chat" },
      { name: "description", content: "Chat with MiniCoder, your local-first AI coding assistant." },
      { property: "og:title", content: "MiniCoder — Chat" },
      { property: "og:description", content: "Chat with MiniCoder, your local-first AI coding assistant." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const activeId = pathname.startsWith("/chat/") ? pathname.slice("/chat/".length) : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} chatId={activeId} />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
