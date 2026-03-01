import { create } from "zustand";

interface Model {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
}

const llmChoices: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
  },
];

// TODO :: adjsut
const DEFAULT_SUGGESTIONS = [
  "Modern Landing Page",
  "Build Perplexity",
  "Build a Jira Clone Dashboard",
  "Build Chatgpt Clone over my dataset",
];

interface ChatOptionsState {
  model: string;
  modelSelectorOpen: boolean;
  webSearch: boolean;
  models: Model[];
  suggestions: string[];
  setModel: (model: string) => void;
  setModelSelectorOpen: (open: boolean) => void;
  setWebSearch: (enabled: boolean) => void;
  selectedModelData: Model | undefined;
}

// Create Zustand store
export const useChatOptions = create<ChatOptionsState>((set, get) => ({
  model: "gpt-4o",
  modelSelectorOpen: false,
  webSearch: false,
  models: llmChoices,
  setModel: (model) => set({ model }),
  setModelSelectorOpen: (modelSelectorOpen) => set({ modelSelectorOpen }),
  setWebSearch: (webSearch) => set({ webSearch }),
  get selectedModelData() {
    return get().models.find((m) => m.id === get().model);
  },
  suggestions: DEFAULT_SUGGESTIONS,
}));
