import { useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive, ArchiveRestore, Copy, Edit3, MoreHorizontal, PanelLeftClose, PanelLeftOpen,
  Pin, PinOff, Plus, Search, Settings as SettingsIcon, Trash2, X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { WordMark, Logo } from "./logo";
import { ThemeSelector } from "./theme-selector";
import { SettingsModal } from "./settings-modal";
import { useChatStore, type Chat } from "@/store/chat-store";
import { useSettings } from "@/store/settings-store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const open = useSettings((s) => s.sidebarOpen);
  const toggle = useSettings((s) => s.toggleSidebar);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
          open ? "w-72" : "w-[68px]",
        )}
      >
        <SidebarContent collapsed={!open} onToggle={toggle} onOpenSettings={() => setSettingsOpen(true)} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <SidebarContent
                collapsed={false}
                onToggle={onCloseMobile}
                onOpenSettings={() => setSettingsOpen(true)}
                onNavigate={onCloseMobile}
                toggleIcon={<X className="h-4 w-4" />}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function SidebarContent({
  collapsed, onToggle, onOpenSettings, onNavigate, toggleIcon,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  onNavigate?: () => void;
  toggleIcon?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const chatsMap = useChatStore((s) => s.chats);
  const order = useChatStore((s) => s.order);
  const createChat = useChatStore((s) => s.createChat);

  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const activeId = pathname.startsWith("/chat/") ? pathname.slice("/chat/".length) : null;

  const { pinned, recent, archived } = useMemo(() => {
    const list = order.map((id) => chatsMap[id]).filter(Boolean) as Chat[];
    const filtered = query
      ? list.filter(
          (c) =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.messages.some((m) => m.content.toLowerCase().includes(query.toLowerCase())),
        )
      : list;
    return {
      pinned: filtered.filter((c) => c.pinned && !c.archived),
      recent: filtered.filter((c) => !c.pinned && !c.archived),
      archived: filtered.filter((c) => c.archived),
    };
  }, [order, chatsMap, query]);

  const newChat = () => {
    const id = createChat();
    onNavigate?.();
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex items-center justify-between p-3", collapsed && "flex-col gap-2")}>
        {collapsed ? (
          <Logo size={30} />
        ) : (
          <Link to="/" className="block">
            <WordMark />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {toggleIcon ?? (collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)}
        </button>
      </div>

      <div className={cn("px-3", collapsed && "px-2")}>
        <button
          onClick={newChat}
          className={cn(
            "group flex w-full items-center gap-2 rounded-xl bg-brand/10 px-3 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand/20",
            collapsed && "justify-center px-0",
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>New chat</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-lg border border-sidebar-border bg-sidebar-accent/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>
      )}

      <div className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-2 pb-2">
        {collapsed ? (
          <div className="flex flex-col gap-1">
            {order.slice(0, 12).map((id) => {
              const c = chatsMap[id];
              if (!c) return null;
              return (
                <button
                  key={id}
                  onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: id } })}
                  title={c.title}
                  className={cn(
                    "mx-auto grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold",
                    activeId === id ? "bg-brand/20 text-brand" : "text-muted-foreground hover:bg-sidebar-accent",
                  )}
                >
                  {c.title.slice(0, 1).toUpperCase()}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <Section title="Pinned" items={pinned} activeId={activeId} query={query} onNavigate={onNavigate} />
            <Section title="Recent" items={recent} activeId={activeId} query={query} onNavigate={onNavigate} />
            {archived.length > 0 && (
              <Section title="Archived" items={archived} activeId={activeId} query={query} onNavigate={onNavigate} />
            )}
            {pinned.length + recent.length + archived.length === 0 && (
              <div className="mt-8 px-3 text-center text-xs text-muted-foreground">
                {query ? "No matches." : "No chats yet. Start a new conversation."}
              </div>
            )}
          </>
        )}
      </div>

      <div className={cn("border-t border-sidebar-border p-2", collapsed ? "flex flex-col items-center gap-1" : "flex items-center justify-between gap-1 px-3 py-2")}>
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand to-[oklch(0.72_0.18_200)]" />
            <span>Local user</span>
          </div>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <ThemeSelector />
          <button
            onClick={onOpenSettings}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, items, activeId, query, onNavigate,
}: {
  title: string;
  items: Chat[];
  activeId: string | null;
  query: string;
  onNavigate?: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <ul className="flex flex-col gap-0.5">
        {items.map((c) => (
          <ConversationItem key={c.id} chat={c} active={activeId === c.id} query={query} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  );
}

function ConversationItem({
  chat, active, query, onNavigate,
}: { chat: Chat; active: boolean; query: string; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { renameChat, deleteChat, togglePin, toggleArchive, duplicateChat } = useChatStore();

  const go = () => {
    onNavigate?.();
    navigate({ to: "/chat/$threadId", params: { threadId: chat.id } });
  };

  const commitRename = () => {
    renameChat(chat.id, draft.trim() || chat.title);
    setRenaming(false);
  };

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors",
          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60",
        )}
      >
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setRenaming(false); setDraft(chat.title); }
            }}
            className="flex-1 rounded-md bg-background/60 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-brand"
          />
        ) : (
          <button onClick={go} className="flex min-w-0 flex-1 items-center gap-2 text-left">
            {chat.pinned && <Pin className="h-3 w-3 shrink-0 text-brand" />}
            <span className="truncate">
              {query ? highlight(chat.title, query) : chat.title}
            </span>
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-background/50 hover:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="Conversation options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => setRenaming(true)}>
              <Edit3 className="mr-2 h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => togglePin(chat.id)}>
              {chat.pinned ? <PinOff className="mr-2 h-3.5 w-3.5" /> : <Pin className="mr-2 h-3.5 w-3.5" />}
              {chat.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {
              const id = duplicateChat(chat.id);
              if (id) navigate({ to: "/chat/$threadId", params: { threadId: id } });
            }}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toggleArchive(chat.id)}>
              {chat.archived ? <ArchiveRestore className="mr-2 h-3.5 w-3.5" /> : <Archive className="mr-2 h-3.5 w-3.5" />}
              {chat.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => exportOne(chat)}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setConfirmDelete(true); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!renaming && (
        <div className="px-3 text-[10px] text-muted-foreground/70">
          {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              "{chat.title}" will be permanently removed from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteChat(chat.id);
                if (active) navigate({ to: "/chat" });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(q)})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-brand/30 px-0.5 text-foreground">{p}</mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exportOne(chat: Chat) {
  const blob = new Blob([JSON.stringify(chat, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${chat.title.replace(/[^a-z0-9-_]+/gi, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
