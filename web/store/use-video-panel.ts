import { create } from "zustand";

export interface VideoVersion {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
  description?: string;
  sceneName?: string;
}

type VideoPanelState = {
  currentVideo: VideoVersion | undefined;
  setCurrentVideo: (video: VideoVersion) => void;

  allVersions: VideoVersion[];
  setAllVersions: (versions: VideoVersion[]) => void;
  addVersion: (version: VideoVersion) => void;

  isRendering: boolean;
  setIsRendering: (rendering: boolean) => void;
};

export const useVideoPanel = create<VideoPanelState>((set) => ({
  currentVideo: undefined,
  setCurrentVideo: (video: VideoVersion) => set({ currentVideo: video }),

  allVersions: [],
  setAllVersions: (versions: VideoVersion[]) => set({ allVersions: versions }),
  addVersion: (version: VideoVersion) =>
    set((state) => ({ allVersions: [...state.allVersions, version] })),

  isRendering: false,
  setIsRendering: (rendering: boolean) => set({ isRendering: rendering }),
}));
