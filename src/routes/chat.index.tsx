import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ChatInput } from "@/components/chat-input";
import { ProjectBar } from "@/components/project-bar";
import { useChatStore, newMessage } from "@/store/chat-store";
import { useSettings } from "@/store/settings-store";
import { streamAI, generateTitle } from "@/lib/ai";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const createChat = useChatStore((s) => s.createChat);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const renameChat = useChatStore((s) => s.renameChat);
  const model = useSettings((s) => s.selectedModel);

  const startNew = (prompt: string) => {
    if (!prompt.trim()) return;
    const id = createChat({ title: generateTitle(prompt), model });
    const user = newMessage("user", prompt);
    addMessage(id, user);
    const assistant = newMessage("assistant", "", model);
    addMessage(id, assistant);
    const messages = [{ role: "user" as const, content: prompt }];
    streamAI(
      messages,
      model,
      (_c, full) => updateMessage(id, assistant.id, full),
      (full) => updateMessage(id, assistant.id, full),
    );
    // First message becomes the title.
    renameChat(id, generateTitle(prompt));
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    setValue("");
    startNew(v);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <WelcomeScreen onPick={(p) => startNew(p)} />
      </div>
      <ChatInput
        value={value}
        onChange={setValue}
        onSubmit={submit}
        autoFocus
        placeholder="Message MiniCoder…"
      />
      <ProjectBar />
    </div>
  );
}
