import { useCallback, useRef, useState } from "react";
import { streamAI, generateTitle, type StreamHandle } from "@/lib/ai";
import { newMessage, useChatStore } from "@/store/chat-store";
import { useSettings } from "@/store/settings-store";
import { useProject } from "@/store/project-store";
import { writeFile, readFileTree } from "@/lib/fs-access";

export function useChatSession(chatId: string | null) {
  const store = useChatStore();
  const model = useSettings((s) => s.selectedModel);
  const [streaming, setStreaming] = useState(false);
  const handleRef = useRef<StreamHandle | null>(null);
  const streamingIdRef = useRef<string | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const send = useCallback(
    async (prompt: string, opts?: { targetChatId?: string }) => {
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

      const updatedChat = useChatStore.getState().chats[targetId];
      const messages = updatedChat.messages
        .filter((m) => m.id !== assistant.id)
        .map((m) => ({ role: m.role, content: m.content }));

      const project = useProject.getState();
      let projectContext = "";
      if (project.rootHandle && project.rootName) {
        const tree = await readFileTree(project.rootHandle);
        const treeStr = tree.length > 0 ? tree.join("\n") : "(empty project)";
        projectContext = `You have access to a local project folder "${project.rootName}". Here is its file tree:\n${treeStr}\n\nYou can read and write files in that folder. When the user asks you to create or edit files, respond with the file contents. After your explanation, include a JSON code block with files to create/modify:\n\`\`\`json\n{"files": [{"path": "relative/path.ext", "content": "file content here"}]}\n\`\`\`\nTo read an existing file, include: {"read": ["relative/path.ext"]} in the JSON block.\nAlways use relative paths from the project root. Do not write files without user consent.\n\nIMPORTANT: When showing the file tree, list each file and folder on its own line. Never put multiple entries on the same line.`;
      }

      messages.unshift({
        role: "system",
        content: `You are an AI coding assistant running in a browser-based app. You can help the user write, review, and edit code. When you suggest file changes, include a JSON block with the files to create or modify.${projectContext ? `\n\n${projectContext}` : ""}`,
      });

      const flushUpdate = (content: string) => {
        pendingContentRef.current = null;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        store.updateMessage(targetId, assistant.id, content);
      };
      const scheduleUpdate = (content: string) => {
        pendingContentRef.current = content;
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (pendingContentRef.current !== null) {
            flushUpdate(pendingContentRef.current);
          }
        });
      };

      handleRef.current = streamAI(
        messages,
        model,
        (_chunk, full) => {
          scheduleUpdate(full);
        },
        (full) => {
          flushUpdate(full);
          setStreaming(false);
          handleRef.current = null;
          streamingIdRef.current = null;
          executeFileOps(full);
        },
        (err) => {
          store.updateMessage(targetId, assistant.id, `Error: ${err.message}`);
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
    async (assistantId: string) => {
      if (!chatId) return;
      const chat = useChatStore.getState().chats[chatId];
      if (!chat) return;
      const idx = chat.messages.findIndex((m) => m.id === assistantId);
      if (idx <= 0) return;
      const prevUser = [...chat.messages.slice(0, idx)].reverse().find((m) => m.role === "user");
      if (!prevUser) return;
      // Trim messages from the assistant onward and re-send.
      store.replaceMessages(chatId, chat.messages.slice(0, idx));
      await send(prevUser.content);
    },
    [chatId, send, store],
  );

  const editUser = useCallback(
    async (userMsgId: string, newContent: string) => {
      if (!chatId) return;
      const chat = useChatStore.getState().chats[chatId];
      if (!chat) return;
      const idx = chat.messages.findIndex((m) => m.id === userMsgId);
      if (idx < 0) return;
      store.replaceMessages(chatId, chat.messages.slice(0, idx));
      await send(newContent);
    },
    [chatId, send, store],
  );

  return { streaming, streamingId: streamingIdRef.current, send, stop, regenerate, editUser };
}

async function executeFileOps(aiResponse: string) {
  const project = useProject.getState();
  const root = project.rootHandle;
  if (!root) return;

  const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) return;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    const { read: readPaths } = parsed as { read?: string[] };
    const files: { path: string; content: string }[] = parsed.files ?? [];

    if (!readPaths?.length && !files.length) return;

    let report = "\n\n---\n**File operations:**\n";

    if (files.length > 0) {
      for (const f of files) {
        const { readFile } = await import("@/lib/fs-access");
        const ok = await writeFile(root, f.path, f.content);
        report += `- ${ok ? "✅" : "❌"} Wrote ${f.path}\n`;
      }
    }

    if (readPaths?.length) {
      const { readFile } = await import("@/lib/fs-access");
      for (const p of readPaths) {
        const content = await readFile(root, p);
        if (content !== null) {
          report += `- 📄 Read ${p}\n\`\`\`\n${content.slice(0, 2000)}${content.length > 2000 ? "\n…" : ""}\n\`\`\`\n`;
        } else {
          report += `- ❌ Could not read ${p}\n`;
        }
      }
    }

    const store = useChatStore.getState();
    for (const chat of Object.values(store.chats)) {
      const msgs = chat.messages;
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        store.updateMessage(chat.id, last.id, last.content + report);
        break;
      }
    }
  } catch {
    // ignore parse errors
  }
}
