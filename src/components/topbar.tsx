import { Menu, Plus, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ModelSelector } from "./model-selector";
import { WordMark } from "./logo";
import { useChatStore } from "@/store/chat-store";
import { useSettings } from "@/store/settings-store";

export function Topbar({
  onOpenMobileSidebar,
  chatId,
}: {
  onOpenMobileSidebar: () => void;
  chatId: string | null;
}) {
  const navigate = useNavigate();
  const chat = useChatStore((s) => (chatId ? s.chats[chatId] : null));
  const setChatModel = useChatStore((s) => s.setChatModel);
  const createChat = useChatStore((s) => s.createChat);
  const globalModel = useSettings((s) => s.selectedModel);
  const setGlobalModel = useSettings((s) => s.setModel);

  const activeModel = chat?.model ?? globalModel;
  const setModel = (m: string) => {
    setGlobalModel(m);
    if (chat) setChatModel(chat.id, m);
  };

  const newChat = () => {
    const id = createChat();
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 px-3 sm:px-4">
      <button
        onClick={onOpenMobileSidebar}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="md:hidden">
        <WordMark />
      </div>

      <div className="hidden md:block">
        <ModelSelector value={activeModel} onChange={setModel} />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="md:hidden">
          <ModelSelector value={activeModel} onChange={setModel} />
        </div>
        <button
          onClick={newChat}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="New chat"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div
          className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand to-[oklch(0.72_0.18_200)] text-brand-foreground"
          aria-label="Profile"
          title="Profile"
        >
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
