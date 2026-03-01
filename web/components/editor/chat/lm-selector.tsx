"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCurrentLLMStore } from "@/store/use-select-llm";
import { useApiKeysStore } from "@/store/use-api-keys";
import {
  MODELS,
  PROVIDER_LABELS,
  getModelInfo,
  type LLMProvider,
} from "@/lib/models";

const PROVIDER_ORDER: LLMProvider[] = ["openai", "anthropic", "deepseek", "xai", "google"];

export function LLMSelectorV2() {
  const selectedModelId = useCurrentLLMStore((s) => s.selectedModelId);
  const setSelectedModelId = useCurrentLLMStore((s) => s.setSelectedModelId);
  const [open, setOpen] = useState(false);

  const keys = useApiKeysStore((s) => s.keys);
  const loadFromStorage = useApiKeysStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const availableProviders = useMemo(() => {
    const providers = new Set<LLMProvider>();
    for (const provider of PROVIDER_ORDER) {
      if (keys[provider]) {
        providers.add(provider);
      }
    }
    return providers;
  }, [keys]);

  const filteredModels = useMemo(() => {
    return MODELS.filter((m) => availableProviders.has(m.provider));
  }, [availableProviders]);

  const selectedModel = getModelInfo(selectedModelId);

  // If selected model is no longer available, reset to first available
  useEffect(() => {
    if (filteredModels.length > 0 && !filteredModels.find((m) => m.id === selectedModelId)) {
      setSelectedModelId(filteredModels[0].id);
    }
  }, [filteredModels, selectedModelId, setSelectedModelId]);

  const groupedModels = PROVIDER_ORDER.map((provider) => ({
    provider,
    label: PROVIDER_LABELS[provider],
    models: filteredModels.filter((m) => m.provider === provider),
  })).filter((g) => g.models.length > 0);

  const hasNoKeys = availableProviders.size === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="w-auto border-none rounded-xl gap-1.5 shadow-none bg-transparent p-2 h-8 justify-between items-center dark:ml-2 hover:dark:bg-brand-800"
        >
          <div className="flex items-center gap-1.5">
            {selectedModel && availableProviders.has(selectedModel.provider) && (
              <ModelSelectorLogo
                provider={selectedModel.provider}
                className="size-4"
              />
            )}
            <span className="text-xs text-black/70 dark:text-gray-300">
              {selectedModel && availableProviders.has(selectedModel.provider)
                ? selectedModel.name
                : "Select model..."}
            </span>
          </div>
          <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 ml-2 p-0 rounded-xl"
      >
        <Command className="rounded-xl">
          <ModelSelectorInput placeholder="Search models..." />
          <ModelSelectorList className="max-h-80">
            {hasNoKeys ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                <p className="font-medium">No API keys configured</p>
                <p className="mt-1 text-xs">
                  Add your API keys in Settings to see available models.
                </p>
              </div>
            ) : (
              <>
                <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
                {groupedModels.map(({ provider, label, models }) => (
                  <ModelSelectorGroup key={provider} heading={label}>
                    {models.map((model) => (
                      <ModelSelectorItem
                        key={model.id}
                        value={`${model.name} ${model.id} ${model.provider}`}
                        onSelect={() => {
                          setSelectedModelId(model.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "gap-2.5 py-2.5 cursor-pointer",
                          selectedModelId === model.id &&
                            "text-black dark:text-gray-200",
                        )}
                      >
                        <ModelSelectorLogo
                          provider={model.provider}
                          className="size-4 shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <ModelSelectorName className="text-[13px] font-medium">
                            {model.name}
                          </ModelSelectorName>
                          {model.description && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {model.description}
                            </span>
                          )}
                        </div>
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 text-green-500 rounded-full shrink-0 opacity-0",
                            selectedModelId === model.id && "opacity-100",
                          )}
                        />
                      </ModelSelectorItem>
                    ))}
                  </ModelSelectorGroup>
                ))}
              </>
            )}
          </ModelSelectorList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
