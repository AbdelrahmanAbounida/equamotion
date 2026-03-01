"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingsModal } from "@/store/use-settings-modal";
import { useApiKeysStore } from "@/store/use-api-keys";
import { Eye, EyeOff, Check, Key, Loader2, X } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

const providers = [
  { id: "openai" as const, label: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic" as const, label: "Anthropic", placeholder: "sk-ant-..." },
  { id: "deepseek" as const, label: "DeepSeek", placeholder: "sk-..." },
  { id: "xai" as const, label: "xAI", placeholder: "xai-..." },
  { id: "google" as const, label: "Google", placeholder: "AIza..." },
];

export function SettingsModal() {
  const { open, setOpen } = useSettingsModal();
  const {
    keys,
    validationStatus,
    loadFromStorage,
    setKey,
    validateAndSave,
  } = useApiKeysStore();

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      loadFromStorage();
    }
  }, [open, loadFromStorage]);

  useEffect(() => {
    if (open) {
      setDraft({
        openai: keys.openai || "",
        anthropic: keys.anthropic || "",
        deepseek: keys.deepseek || "",
        xai: keys.xai || "",
        google: keys.google || "",
      });
    }
  }, [open, keys]);

  const handleValidateAndSave = async (providerId: string) => {
    const key = draft[providerId]?.trim();
    if (!key) {
      // Clear the key
      setKey(providerId, "");
      useApiKeysStore.getState().saveToStorage();
      return;
    }

    const valid = await validateAndSave(providerId, key);
    if (valid) {
      showSuccessToast({
        title: "Key Validated",
        description: `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} API key is valid and saved.`,
      });
    } else {
      showErrorToast({
        title: "Invalid Key",
        description: `The ${providerId.charAt(0).toUpperCase() + providerId.slice(1)} API key could not be validated. Please check and try again.`,
      });
    }
  };

  const handleSaveAll = async () => {
    const promises = providers
      .filter((p) => draft[p.id]?.trim())
      .map((p) => handleValidateAndSave(p.id));
    await Promise.all(promises);
  };

  const getStatusIcon = (providerId: string) => {
    const status = validationStatus[providerId];
    if (status === "validating") {
      return <Loader2 className="size-3.5 animate-spin text-muted-foreground" />;
    }
    if (status === "valid") {
      return <Check className="size-3.5 text-emerald-500" />;
    }
    if (status === "invalid") {
      return <X className="size-3.5 text-red-500" />;
    }
    if (keys[providerId as keyof typeof keys]) {
      return <Check className="size-3 text-emerald-600" />;
    }
    return null;
  };

  const getStatusText = (providerId: string) => {
    const status = validationStatus[providerId];
    if (status === "validating") return "Validating...";
    if (status === "valid") return "Valid";
    if (status === "invalid") return "Invalid";
    if (keys[providerId as keyof typeof keys]) return "Configured";
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-4" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider API keys. Keys are validated before saving and stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {providers.map((provider) => {
            const status = validationStatus[provider.id];
            const isValidating = status === "validating";
            const statusText = getStatusText(provider.id);

            return (
              <div key={provider.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={provider.id} className="text-sm font-medium">
                    {provider.label}
                  </Label>
                  {statusText && (
                    <span
                      className={`flex items-center gap-1 text-xs ${
                        status === "valid"
                          ? "text-emerald-600"
                          : status === "invalid"
                            ? "text-red-500"
                            : status === "validating"
                              ? "text-muted-foreground"
                              : "text-emerald-600"
                      }`}
                    >
                      {getStatusIcon(provider.id)}
                      {statusText}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={provider.id}
                      type={showKeys[provider.id] ? "text" : "password"}
                      placeholder={provider.placeholder}
                      value={draft[provider.id] || ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [provider.id]: e.target.value,
                        }))
                      }
                      disabled={isValidating}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowKeys((prev) => ({
                          ...prev,
                          [provider.id]: !prev[provider.id],
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    disabled={isValidating || !draft[provider.id]?.trim()}
                    onClick={() => handleValidateAndSave(provider.id)}
                  >
                    {isValidating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleSaveAll}
            className="w-full"
            size="sm"
            disabled={providers.some(
              (p) => validationStatus[p.id] === "validating",
            )}
          >
            {providers.some((p) => validationStatus[p.id] === "validating") ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" />
                Validating...
              </span>
            ) : (
              "Validate & Save All"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
