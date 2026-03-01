import { create } from "zustand";

export type StoredKeys = {
  openai?: string;
  anthropic?: string;
  deepseek?: string;
  xai?: string;
  google?: string;
};

type ValidationStatus = "idle" | "validating" | "valid" | "invalid";

export type ApiKeysStore = {
  keys: StoredKeys;
  validationStatus: Record<string, ValidationStatus>;
  setKey: (provider: string, key: string) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  validateKey: (provider: string, key: string) => Promise<boolean>;
  validateAndSave: (provider: string, key: string) => Promise<boolean>;
};

const STORAGE_KEY = "equamotion-api-keys";

export const useApiKeysStore = create<ApiKeysStore>((set, get) => ({
  keys: {},
  validationStatus: {},

  setKey: (provider, key) => {
    set((state) => ({
      keys: { ...state.keys, [provider]: key },
    }));
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ keys: JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
  },

  saveToStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().keys));
    } catch {
      // ignore
    }
  },

  validateKey: async (provider, key) => {
    set((state) => ({
      validationStatus: { ...state.validationStatus, [provider]: "validating" },
    }));

    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key }),
      });

      const data = await res.json();
      const valid = data.valid === true;

      set((state) => ({
        validationStatus: {
          ...state.validationStatus,
          [provider]: valid ? "valid" : "invalid",
        },
      }));

      return valid;
    } catch {
      set((state) => ({
        validationStatus: {
          ...state.validationStatus,
          [provider]: "invalid",
        },
      }));
      return false;
    }
  },

  validateAndSave: async (provider, key) => {
    const valid = await get().validateKey(provider, key);
    if (valid) {
      get().setKey(provider, key);
      get().saveToStorage();
    }
    return valid;
  },
}));
