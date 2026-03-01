import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type LLMProvider = "openai" | "anthropic" | "deepseek" | "xai" | "google";

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  description?: string;
}

export interface APIKeys {
  openai?: string;
  anthropic?: string;
  deepseek?: string;
  xai?: string;
  google?: string;
}

export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  xai: "xAI",
  google: "Google",
};

export const MODELS: ModelInfo[] = [
  // OpenAI
  { id: "gpt-4.1", name: "GPT-4.1", provider: "openai", description: "Latest flagship model" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai", description: "Fast and affordable" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "openai", description: "Fastest, most cost-effective" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", description: "Great for multimodal tasks" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", description: "Small and fast multimodal" },
  { id: "o3-mini", name: "o3-mini", provider: "openai", description: "Reasoning model" },

  // Anthropic
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic", description: "Best balance of speed and intelligence" },
  { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", provider: "anthropic", description: "High performance" },
  { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", provider: "anthropic", description: "Fast and compact" },

  // DeepSeek
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "deepseek", description: "General purpose" },
  { id: "deepseek-reasoner", name: "DeepSeek Reasoner", provider: "deepseek", description: "Advanced reasoning" },

  // xAI (Grok)
  { id: "grok-3", name: "Grok 3", provider: "xai", description: "Latest flagship model" },
  { id: "grok-3-mini", name: "Grok 3 Mini", provider: "xai", description: "Fast reasoning model" },
  { id: "grok-3-fast", name: "Grok 3 Fast", provider: "xai", description: "Optimized for speed" },
  { id: "grok-2", name: "Grok 2", provider: "xai", description: "Previous generation" },

  // Google (Gemini)
  { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro", provider: "google", description: "Most capable Gemini model" },
  { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash", provider: "google", description: "Fast and efficient" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", description: "Previous gen flash" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "google", description: "Lightweight and fast" },
];

export const DEFAULT_MODEL_ID = "gpt-4.1-mini";

export function getModelsByProvider(provider: LLMProvider): ModelInfo[] {
  return MODELS.filter((m) => m.provider === provider);
}

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === modelId);
}

export function getModelById(modelId: string, apiKeys?: APIKeys) {
  const info = getModelInfo(modelId);
  if (!info) {
    const openai = createOpenAI({
      apiKey: apiKeys?.openai,
    });
    return openai(DEFAULT_MODEL_ID);
  }

  switch (info.provider) {
    case "openai": {
      const openai = createOpenAI({
        apiKey: apiKeys?.openai,
      });
      return openai(modelId);
    }
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: apiKeys?.anthropic,
      });
      return anthropic(modelId);
    }
    case "deepseek": {
      const deepseek = createOpenAI({
        apiKey: apiKeys?.deepseek,
        baseURL: "https://api.deepseek.com",
      });
      return deepseek(modelId);
    }
    case "xai": {
      const xai = createXai({
        apiKey: apiKeys?.xai,
      });
      return xai(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: apiKeys?.google,
      });
      return google(modelId);
    }
  }
}

export function getEditModel(apiKeys?: APIKeys) {
  // Use Anthropic if key is available, otherwise fall back to the user's available provider
  if (apiKeys?.anthropic) {
    const anthropic = createAnthropic({ apiKey: apiKeys.anthropic });
    return anthropic("claude-3-haiku-20240307");
  }
  if (apiKeys?.openai) {
    const openai = createOpenAI({ apiKey: apiKeys.openai });
    return openai("gpt-4o-mini");
  }
  if (apiKeys?.google) {
    const google = createGoogleGenerativeAI({ apiKey: apiKeys.google });
    return google("gemini-2.0-flash");
  }
  if (apiKeys?.deepseek) {
    const deepseek = createOpenAI({ apiKey: apiKeys.deepseek, baseURL: "https://api.deepseek.com" });
    return deepseek("deepseek-chat");
  }
  if (apiKeys?.xai) {
    const xai = createXai({ apiKey: apiKeys.xai });
    return xai("grok-3-mini");
  }
  // Final fallback
  const anthropic = createAnthropic({ apiKey: apiKeys?.anthropic });
  return anthropic("claude-3-haiku-20240307");
}
