import { create } from "zustand";

type SettingsModalStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useSettingsModal = create<SettingsModalStore>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));
