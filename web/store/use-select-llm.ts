import { DEFAULT_MODEL_ID } from "@/lib/models";
import { create } from "zustand";

export type CurrentLLMStore = {
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
};

export const useCurrentLLMStore = create<CurrentLLMStore>((set) => ({
  selectedModelId: DEFAULT_MODEL_ID,
  setSelectedModelId: (id: string) => {
    set({ selectedModelId: id });
  },
}));
