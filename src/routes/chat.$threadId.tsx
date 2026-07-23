import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ProjectBar } from "@/components/project-bar";
import { useChatStore } from "@/store/chat-store";
import { useChatSession } from "@/hooks/use-chat-session";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const chat = useChatStore((s) => s.chats[threadId]);
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { streaming, streamingId, send, stop, regenerate, editUser } = useChatSession(threadId);

  // If the thread doesn't exist (deleted, or bad URL), send user back to /chat
  useEffect(() => {
    if (!chat) {
      const t = setTimeout(() => navigate({ to: "/chat", replace: true }), 30);
      return () => clearTimeout(t);
    }
  }, [chat, navigate]);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat?.messages.length, chat?.messages[chat.messages.length - 1]?.content]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    setValue("");
    send(v);
  };

  if (!chat) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const empty = chat.messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto">
          {empty ? (
            <WelcomeScreen onPick={(p) => send(p)} />
          ) : (
            <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6">
              {chat.messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  streaming={streaming && m.id === streamingId}
                  onEdit={m.role === "user" ? editUser : undefined}
                  onRegenerate={m.role === "assistant" ? regenerate : undefined}
                />
              ))}
            </div>
          )}
        </div>
        <ChatInput
          value={value}
          onChange={setValue}
          onSubmit={submit}
          onStop={stop}
          streaming={streaming}
          autoFocus
          placeholder={empty ? "Message MiniCoder…" : "Reply to MiniCoder…"}
        />
        <ProjectBar />
      </div>
    </div>
  );
}
