import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL_ID } from "@/lib/models";

export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  model?: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  model?: string;
};

type ChatState = {
  chats: Record<string, Chat>;
  order: string[]; // most recent first
  createChat: (initial?: Partial<Chat>) => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  duplicateChat: (id: string) => string | null;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  addMessage: (chatId: string, msg: Message) => void;
  updateMessage: (chatId: string, msgId: string, content: string) => void;
  replaceMessages: (chatId: string, messages: Message[]) => void;
  setChatModel: (chatId: string, model: string) => void;
  clearAll: () => void;
  importChats: (chats: Chat[]) => void;
};

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      order: [],

      createChat: (initial) => {
        const id = initial?.id ?? uid();
        const now = Date.now();
        const chat: Chat = {
          id,
          title: initial?.title ?? "New chat",
          messages: initial?.messages ?? [],
          createdAt: now,
          updatedAt: now,
          model: initial?.model ?? DEFAULT_MODEL_ID,
        };
        set((s) => ({
          chats: { ...s.chats, [id]: chat },
          order: [id, ...s.order.filter((x) => x !== id)],
        }));
        return id;
      },

      deleteChat: (id) => {
        set((s) => {
          const { [id]: _, ...rest } = s.chats;
          return { chats: rest, order: s.order.filter((x) => x !== id) };
        });
      },

      renameChat: (id, title) => {
        set((s) => {
          const c = s.chats[id];
          if (!c) return s;
          return { chats: { ...s.chats, [id]: { ...c, title: title.trim() || c.title, updatedAt: Date.now() } } };
        });
      },

      duplicateChat: (id) => {
        const src = get().chats[id];
        if (!src) return null;
        const newId = uid();
        const now = Date.now();
        const copy: Chat = {
          ...src,
          id: newId,
          title: src.title + " (copy)",
          createdAt: now,
          updatedAt: now,
          messages: src.messages.map((m) => ({ ...m, id: uid() })),
        };
        set((s) => ({
          chats: { ...s.chats, [newId]: copy },
          order: [newId, ...s.order],
        }));
        return newId;
      },

      togglePin: (id) => {
        set((s) => {
          const c = s.chats[id];
          if (!c) return s;
          return { chats: { ...s.chats, [id]: { ...c, pinned: !c.pinned } } };
        });
      },

      toggleArchive: (id) => {
        set((s) => {
          const c = s.chats[id];
          if (!c) return s;
          return { chats: { ...s.chats, [id]: { ...c, archived: !c.archived } } };
        });
      },

      addMessage: (chatId, msg) => {
        set((s) => {
          const c = s.chats[chatId];
          if (!c) return s;
          const updated: Chat = { ...c, messages: [...c.messages, msg], updatedAt: Date.now() };
          return {
            chats: { ...s.chats, [chatId]: updated },
            order: [chatId, ...s.order.filter((x) => x !== chatId)],
          };
        });
      },

      updateMessage: (chatId, msgId, content) => {
        set((s) => {
          const c = s.chats[chatId];
          if (!c) return s;
          return {
            chats: {
              ...s.chats,
              [chatId]: {
                ...c,
                messages: c.messages.map((m) => (m.id === msgId ? { ...m, content } : m)),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      replaceMessages: (chatId, messages) => {
        set((s) => {
          const c = s.chats[chatId];
          if (!c) return s;
          return { chats: { ...s.chats, [chatId]: { ...c, messages, updatedAt: Date.now() } } };
        });
      },

      setChatModel: (chatId, model) => {
        set((s) => {
          const c = s.chats[chatId];
          if (!c) return s;
          return { chats: { ...s.chats, [chatId]: { ...c, model } } };
        });
      },

      clearAll: () => set({ chats: {}, order: [] }),

      importChats: (chats) => {
        set((s) => {
          const map = { ...s.chats };
          const orderPrefix: string[] = [];
          for (const c of chats) {
            map[c.id] = c;
            orderPrefix.push(c.id);
          }
          const dedupOrder = [...orderPrefix, ...s.order.filter((x) => !orderPrefix.includes(x))];
          return { chats: map, order: dedupOrder };
        });
      },
    }),
    { name: "minicoder.chats.v1" },
  ),
);

export const newMessage = (role: Role, content: string, model?: string): Message => ({
  id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)),
  role,
  content,
  createdAt: Date.now(),
  model,
});
