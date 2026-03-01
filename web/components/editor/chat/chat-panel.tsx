"use client";
import { motion } from "framer-motion";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageItem, MessageSkeleton } from "./messages";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { ChatInput } from "./chat-input";
import { useState, useEffect, useRef } from "react";
import { useDataStream } from "@/providers/data-stream-provider";
import { useCurrentLLMStore } from "@/store/use-select-llm";
import { useApiKeysStore } from "@/store/use-api-keys";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/components/ui/toast";

interface ChatPageProps {
  id?: string;
  initialMessages?: ChatMessage[];
  initialChatModel?: string;
  autoResume?: boolean;
  isHome?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
}

export function ChatPanel({
  id,
  initialMessages = [],
  autoResume = false,
  errorMessage,
  isLoading,
}: ChatPageProps) {
  const router = useRouter();
  const chatId = id ?? generateUUID();
  const [input, setInput] = useState("");
  const { setDataStream } = useDataStream();

  const selectedModelId = useCurrentLLMStore(
    (state) => state.selectedModelId,
  );

  const apiKeys = useApiKeysStore((state) => state.keys);
  const loadKeysFromStorage = useApiKeysStore((state) => state.loadFromStorage);
  const apiKeysRef = useRef(apiKeys);
  apiKeysRef.current = apiKeys;

  useEffect(() => {
    loadKeysFromStorage();
  }, [loadKeysFromStorage]);

  const {
    messages,
    setMessages: setChatMessages,
    sendMessage,
    status,
    stop,
    resumeStream,
  } = useChat<ChatMessage>({
    id: chatId,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            messages,
            chatId,
            message: messages.at(-1),
            userDescription: input,
            modelId: selectedModelId,
            apiKeys: apiKeysRef.current,
            ...body,
          },
        };
      },
    }),

    onData: (dataPart: any) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: (message) => {
      if (message.isError) {
        return;
      }
    },
    onError: (error) => {
      let description = error.message;
      try {
        const parsed = JSON.parse(error.message);
        description = parsed.message || parsed.error || error.message;
      } catch {}

      showErrorToast({
        title: "Error",
        description,
      });
      console.error(error);
    },
  });

  const hasMessages = messages?.length > 0;

  useEffect(() => {
    if (errorMessage) {
      showErrorToast({
        title: "Error",
        description: errorMessage,
      });
      router.push("/");
    }
  }, [errorMessage, router]);

  return (
    <div className="h-full w-full overflow-hidden">
      <motion.div
        className="flex flex-col h-full"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex-1 overflow-hidden">
            <Conversation className="h-full overflow-hidden">
              <ConversationContent className="flex flex-col gap-6">
                {!hasMessages && isLoading ? (
                  <>
                    <MessageSkeleton />
                    <MessageSkeleton />
                    <MessageSkeleton />
                  </>
                ) : (
                  messages?.map((message, index) => (
                    <MessageItem
                      status={status}
                      key={message.id}
                      message={message}
                      chatId={chatId}
                      isLast={index === messages.length - 1}
                    />
                  ))
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>

          <div className="shrink-0">
            <ChatInput
              hasMessages={hasMessages}
              sendMessage={sendMessage}
              chatId={chatId}
              messages={messages}
              status={status}
              stop={stop}
              input={input}
              setInput={setInput}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
