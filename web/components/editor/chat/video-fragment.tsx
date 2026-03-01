"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { VideoVersion, useVideoPanel } from "@/store/use-video-panel";
import { Logo } from "@/components/logo";

interface VideoVersionCardProps {
  video: VideoVersion;
  sceneName?: string;
  isActive?: boolean;
}

export function VideoVersionCard({
  video,
  sceneName,
  isActive,
}: VideoVersionCardProps) {
  const setCurrentVideo = useVideoPanel((state) => state.setCurrentVideo);

  const handleViewVideo = () => {
    setCurrentVideo(video);
  };

  return (
    <Card
      onClick={handleViewVideo}
      className={`p-4 transition-all cursor-pointer shadow-none hover:bg-white/90 ${isActive ? "border-brand-400 bg-white" : "border-brand-300 bg-gray-100 hover:border-brand-500"}`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          <div className="size-7.5 rounded-lg border-brand-400 border bg-white  dark:bg-brand-900/20 flex items-center justify-center">
            <Logo isIcon className="w-5 h-5 text-brand-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                {video.title}
              </h4>
              {/* {video.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {video.description}
                </p>
              )} */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {sceneName && <span className="capitalize">{sceneName}</span>}
              </div>
            </div>

            <Button
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={handleViewVideo}
              className="shrink-0"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              {isActive ? "Viewing" : "View"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
