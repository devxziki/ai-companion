import { useCallback, useRef, useState } from "react";
import { streamMockReply, generateTitle, type StreamHandle } from "@/lib/mock-ai";
import { newMessage, useChatStore } from "@/store/chat-store";
import { useSettings } from "@/store/settings-store";

export function useChatSession(chatId: string | null) {
  const store = useChatStore();
  const model = useSettings((s) => s.selectedModel);
  const [streaming, setStreaming] = useState(false);
  const handleRef = useRef<StreamHandle | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  const send = useCallback(
    (prompt: string, opts?: { targetChatId?: string }) => {
      const targetId = opts?.targetChatId ?? chatId;
      if (!targetId) return;

      const chat = useChatStore.getState().chats[targetId];
      if (!chat) return;

      const userMsg = newMessage("user", prompt);
      store.addMessage(targetId, userMsg);

      // Auto-title first message
      if (chat.messages.length === 0) {
        store.renameChat(targetId, generateTitle(prompt));
      }

      const assistant = newMessage("assistant", "", model);
      streamingIdRef.current = assistant.id;
      store.addMessage(targetId, assistant);
      setStreaming(true);

      handleRef.current = streamMockReply(
        prompt,
        (_chunk, full) => {
          store.updateMessage(targetId, assistant.id, full);
        },
        (full) => {
          store.updateMessage(targetId, assistant.id, full);
          setStreaming(false);
          handleRef.current = null;
          streamingIdRef.current = null;
        },
      );
    },
    [chatId, model, store],
  );

  const stop = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    setStreaming(false);
  }, []);

  const regenerate = useCallback(
    (assistantId: string) => {
      if (!chatId) return;
      const chat = useChatStore.getState().chats[chatId];
      if (!chat) return;
      const idx = chat.messages.findIndex((m) => m.id === assistantId);
      if (idx <= 0) return;
      const prevUser = [...chat.messages.slice(0, idx)].reverse().find((m) => m.role === "user");
      if (!prevUser) return;
      // Trim messages from the assistant onward and re-send.
      store.replaceMessages(chatId, chat.messages.slice(0, idx));
      send(prevUser.content);
    },
    [chatId, send, store],
  );

  const editUser = useCallback(
    (userMsgId: string, newContent: string) => {
      if (!chatId) return;
      const chat = useChatStore.getState().chats[chatId];
      if (!chat) return;
      const idx = chat.messages.findIndex((m) => m.id === userMsgId);
      if (idx < 0) return;
      store.replaceMessages(chatId, chat.messages.slice(0, idx));
      send(newContent);
    },
    [chatId, send, store],
  );

  return { streaming, streamingId: streamingIdRef.current, send, stop, regenerate, editUser };
}
