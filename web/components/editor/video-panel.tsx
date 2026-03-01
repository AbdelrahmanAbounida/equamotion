"use client";

import { useVideoPanel } from "@/store/use-video-panel";
import { motion } from "framer-motion";
import { Download, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/lib/types";
import { Logo } from "../logo";

interface VideoPanelProps {
  messages: ChatMessage[];
}

export function VideoPanel({ messages }: VideoPanelProps) {
  const currentVideo = useVideoPanel((state) => state.currentVideo);
  const isRendering = useVideoPanel((state) => state.isRendering);

  const handleDownload = () => {
    if (!currentVideo?.url) return;
    const a = document.createElement("a");
    a.href = currentVideo.url;
    a.download = `${currentVideo.sceneName || currentVideo.title || "animation"}.mp4`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col h-full rounded-xl  border border-brand-400 bg-background/50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-brand-200">
        <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          Preview
        </span>
        {currentVideo?.url && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 h-7 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        )}
      </div>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {isRendering ? (
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-brand-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
            <div className="text-sm font-medium text-foreground mt-5 mb-1.5">
              Rendering animation…
            </div>
            <div className="text-xs text-muted-foreground">
              EquaMotion is computing your scene
            </div>
          </div>
        ) : currentVideo?.url ? (
          <div className="w-full  rounded-2xl overflow-hidden border border-brand-200 shadow-sm">
            <video
              key={currentVideo.id}
              src={currentVideo.url}
              controls
              autoPlay
              loop
              className="block w-full"
            />
          </div>
        ) : (
          <div className="text-center max-w-sm flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
              {/* <Film className="w-8 h-8 text-brand-400" /> */}
              <Logo isIcon className="size-12 text-brand-400" />
            </div>
            <div className="text-lg font-semibold tracking-tight text-foreground mb-2">
              Your animation appears here
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Describe a math concept in the chat and the AI will generate and
              render it for you.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
