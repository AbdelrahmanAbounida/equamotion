import { create } from "zustand";
import { ChatMessage } from "@/lib/types";

interface ChatStore {
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  isLoadingVotes: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (id: string) => void;
  setLoadingMessages: (loading: boolean) => void;
  setLoadingVotes: (loading: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoadingMessages: false,
  isLoadingVotes: false,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg,
      ),
    })),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),

  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setLoadingVotes: (loading) => set({ isLoadingVotes: loading }),

  reset: () =>
    set({ messages: [], isLoadingMessages: false, isLoadingVotes: false }),
}));
