"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatStatus } from "ai";
import { cn } from "@/lib/utils";
import { LLMSelectorV2 } from "./lm-selector";
import { ChatMessage } from "@/lib/types";

type UseChatReturn = ReturnType<typeof useChat<ChatMessage>>;
type SendMessageType = UseChatReturn["sendMessage"];
type StopType = UseChatReturn["stop"];

export const ChatInput = ({
  messages,
  sendMessage,
  chatId,
  status,
  stop,
  hasMessages = false,
  className,
  input,
  setInput,
  disabled,
}: {
  messages: ChatMessage[];
  sendMessage: SendMessageType;
  chatId: string;
  status: ChatStatus;
  stop: StopType;
  hasMessages?: boolean;
  className?: string;
  input?: string;
  disabled?: boolean;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = status === "submitted" || status === "streaming";

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;

    sendMessage({
      text: message.text || "Sent with attachments",
      files: message.files || [],
    });
    setInput("");
    window.history.replaceState({}, "", `/video/${chatId}`);
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div className={cn(" shrink-0 gap-4 max-w-3xl w-full pt-4", className)}>
      <div className="w-full px-4 pb-4">
        <PromptInput
          className="bg-white border border-brand-100 ring-0! outline-none! rounded-3xl   shadow-none!"
          globalDrop
          multiple
          onSubmit={handleSubmit}
        >
          <PromptInputHeader />
          <PromptInputBody className="rounded-3xl shadow-none! outline-none! ring-0!">
            <PromptInputTextarea
              className=" ring-0! outline-0! border-none!"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask EquaMotion to Generate..."
              disabled={isStreaming}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputSpeechButton textareaRef={textareaRef} />
              <LLMSelectorV2 />
            </PromptInputTools>

            <PromptInputSubmit
              disabled={!input?.trim() || isStreaming || disabled}
              status={status}
              onStop={handleStop}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
