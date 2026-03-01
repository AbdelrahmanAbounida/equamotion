"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { useDataStream } from "@/providers/data-stream-provider";
import { SunMediumIcon } from "lucide-react";
import { ChatStatus } from "ai";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/ui/copy-button";
import { useEffect, useRef } from "react";
import { useVideoPanel } from "@/store/use-video-panel";
import { VideoVersionCard } from "./video-fragment";
import { ChatMessage } from "@/lib/types";

interface MessageItemProps {
  message: ChatMessage & { status?: "streaming" | "submitted" | "completed" };
  onRetry?: () => void;
  status: ChatStatus;
  chatId: string;
  isLast?: boolean;
}

export const MessageItem = ({
  message,
  onRetry,
  status,
  chatId,
  isLast = false,
}: MessageItemProps) => {
  useDataStream();

  const currentVideo = useVideoPanel((state) => state.currentVideo);
  const setCurrentVideo = useVideoPanel((state) => state.setCurrentVideo);
  const setIsRendering = useVideoPanel((state) => state.setIsRendering);
  const hasSetInitialVideo = useRef(false);

  const textPart = message.parts?.find((p) => p.type === "text");
  const textContent = textPart?.text || "";

  const renderVideoTools =
    message.parts?.filter((p) => p.type === "tool-renderVideo") || [];

  const scriptTools =
    message.parts?.filter((p) => p.type === "tool-generateScript") || [];

  const attachments = message.parts?.filter((p) => p.type === "file") || [];
  const isAssistant = message.role === "assistant";
  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!isAssistant || !isLast) return;

    const hasRenderingInProgress = renderVideoTools.some(
      (p: any) => p.state === "input-available",
    );
    setIsRendering(hasRenderingInProgress);

    if (renderVideoTools.length === 0) return;
    if (!hasSetInitialVideo.current && (!currentVideo || isLast)) {
      const lastRender = renderVideoTools.at(-1) as any;

      if (
        lastRender.state === "output-available" &&
        lastRender.output?.success &&
        lastRender.output?.videoBase64
      ) {
        setCurrentVideo({
          id: lastRender.toolCallId,
          title: lastRender.output?.sceneName ?? "Untitled Animation",
          description: lastRender.input?.sceneName,
          url: `data:video/mp4;base64,${lastRender.output.videoBase64}`,
          sceneName: lastRender.output?.sceneName,
          timestamp: new Date(),
        });
        hasSetInitialVideo.current = true;
      }
    }
  }, [
    renderVideoTools,
    isAssistant,
    currentVideo,
    setCurrentVideo,
    setIsRendering,
    isLast,
  ]);

  return (
    <>
      <Message from={message.role}>
        <MessageContent className="max-w-xl w-full">
          {isAssistant ? (
            <>
              {textContent && <MessageResponse>{textContent}</MessageResponse>}

              {scriptTools.length > 0 && (
                <div className="mt-3 space-y-2">
                  {scriptTools.map((tool: any) => {
                    const done = tool.state === "output-available";
                    return (
                      <div
                        key={tool.toolCallId}
                        className="rounded-xl border border-brand-200 overflow-hidden text-xs"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-brand-50">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${done ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
                          />
                          <span className="text-muted-foreground font-medium">
                            {done
                              ? `✓ Script ready: ${tool.output?.sceneName}`
                              : `⚙ Generating script for "${tool.input?.sceneName}"…`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {renderVideoTools.length > 0 && (
                <div className="mt-3 space-y-3">
                  {renderVideoTools.map((tool: any) => {
                    const success = tool.output?.success;
                    const failed =
                      tool.state === "output-available" &&
                      !tool.output?.success;
                    return success ? (
                      <VideoVersionCard
                        key={tool.toolCallId}
                        isActive={tool.toolCallId === currentVideo?.id}
                        video={{
                          id: tool.toolCallId,
                          title: tool.output?.sceneName || "Untitled Animation",
                          description: tool.input?.sceneName,
                          timestamp: new Date(),
                          url: `data:video/mp4;base64,${tool.output.videoBase64}`,
                          sceneName: tool.output?.sceneName,
                        }}
                        sceneName={tool.output?.sceneName}
                      />
                    ) : failed ? (
                      <div
                        key={tool.toolCallId}
                        className="rounded-xl border border-red-200 overflow-hidden text-xs"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50">
                          <span className="w-2 h-2 rounded-full shrink-0 bg-red-400" />
                          <span className="text-red-600 font-medium">
                            ✗ Render failed. Let me try to solve this.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={tool.toolCallId}
                        className="rounded-xl border border-brand-200 overflow-hidden text-xs"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-brand-50">
                          <span className="w-2 h-2 rounded-full shrink-0 bg-amber-400 animate-pulse" />
                          <span className="text-muted-foreground font-medium">
                            🎬 Rendering "{tool.input?.sceneName}"…
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            textContent
          )}
        </MessageContent>

        {isAssistant && textContent && !isStreaming && (
          <div className="flex items-center gap-1 mt-1">
            <CopyButton
              className="rounded-md"
              iconClassName="size-3.5 text-brand-600"
              content={textContent}
            />
          </div>
        )}
      </Message>

      {isStreaming && !isAssistant && isLast && (
        <Message from="assistant">
          <div className="mb-2 animate-pulse text-[12px] text-muted-foreground">
            <SunMediumIcon className="inline-block size-4 mb-0.5 animate-pulse" />
            <span className="pt-2">Thinking</span>
          </div>
        </Message>
      )}
    </>
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="flex gap-4 w-full p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};
