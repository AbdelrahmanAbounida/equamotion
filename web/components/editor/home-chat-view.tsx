"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { ChatInput } from "./chat/chat-input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { useCurrentLLMStore } from "@/store/use-select-llm";
import { useApiKeysStore } from "@/store/use-api-keys";
import { showErrorToast } from "@/components/ui/toast";
import { EditorHeader } from "./header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { VideoPanel } from "./video-panel";
import { useVideoPanel } from "@/store/use-video-panel";
import { useDataStream } from "@/providers/data-stream-provider";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageItem } from "./chat/messages";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { UserNav } from "./user-nav";

const EXAMPLES = [
  "Animate a sine wave being drawn smoothly",
  "Show the Pythagorean theorem with squares",
  "Visualize a Fourier series decomposition",
  "Animate a bouncing ball with gravity",
  "Show how a circle transforms into a square",
  "Draw a fractal spiral step by step",
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface HomeChatViewProps {
  chatId: string;
}

export function HomeChatView({ chatId }: HomeChatViewProps) {
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { setDataStream } = useDataStream();

  const shuffledExamples = useMemo(() => shuffleArray(EXAMPLES), []);

  const selectedModelId = useCurrentLLMStore((state) => state.selectedModelId);

  const apiKeys = useApiKeysStore((state) => state.keys);
  const loadKeysFromStorage = useApiKeysStore((state) => state.loadFromStorage);
  const apiKeysRef = useRef(apiKeys);
  apiKeysRef.current = apiKeys;

  useEffect(() => {
    loadKeysFromStorage();
  }, [loadKeysFromStorage]);

  const currentVideo = useVideoPanel((state) => state.currentVideo);

  const { messages, setMessages, sendMessage, status, stop } =
    useChat<ChatMessage>({
      id: chatId,
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
      onError: (error) => {
        let description = error.message;
        try {
          const parsed = JSON.parse(error.message);
          description = parsed.message || parsed.error || error.message;
        } catch {}

        showErrorToast({
          title: "Error",
          description,
          position: "top-center",
        });
      },
    });

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages) {
      window.history.replaceState(null, "", `/video/${chatId}`);
    }
  }, [hasMessages, chatId]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (hasMessages) {
    return (
      <div className="flex h-screen flex-col">
        <EditorHeader
          title={currentVideo?.title || "New Video"}
          description={
            currentVideo?.description?.slice(0, 100) ||
            currentVideo?.sceneName ||
            ""
          }
          chatId={chatId}
          onBack={() => {
            setMessages([]);
            useVideoPanel.setState({
              currentVideo: undefined,
              allVersions: [],
              isRendering: false,
            });
            window.history.replaceState(null, "", "/");
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-hidden"
        >
          <ResizablePanelGroup
            dir={isMobile ? "vertical" : "horizontal"}
            className="h-full"
          >
            <ResizablePanel
              defaultSize={isMobile ? 50 : 30}
              minSize={20}
              maxSize={35}
              collapsible={!isMobile}
              collapsedSize={0}
            >
              <div className={`h-full w-full ${isMobile ? "p-1" : "p-2"}`}>
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
                          {messages.map((message, index) => (
                            <MessageItem
                              status={status}
                              key={message.id}
                              message={message}
                              chatId={chatId}
                              isLast={index === messages.length - 1}
                            />
                          ))}
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
            </ResizablePanel>

            <ResizableHandle withHandle={false} className="bg-transparent" />

            <ResizablePanel
              defaultSize={isMobile ? 50 : 70}
              minSize={20}
              maxSize={70}
            >
              <div className="h-full pb-2">
                <VideoPanel messages={messages} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <div className="flex items-center justify-end px-4 pt-4">
        <UserNav />
      </div>
      <div className="flex flex-col items-center justify-center pt-20 pb-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center w-full max-w-2xl px-4"
        >
          <Logo isIcon className="size-12 mb-6" clickable={false} />
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            What do you want to animate?
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Describe a math concept and we&apos;ll generate a video animation
            for you.
          </p>

          <ChatInput
            messages={messages}
            sendMessage={sendMessage}
            chatId={chatId}
            status={status}
            stop={stop}
            input={input}
            setInput={setInput}
            className="max-w-2xl"
          />

          <div className="flex flex-wrap flex-col gap-2 mt-2 justify-center max-w-3xl overflow-auto">
            <Suggestions>
              {shuffledExamples.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={(s) => setInput(s)}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
