"use client";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/modals/settings-modal";
import { useSettingsModal } from "@/store/use-settings-modal";

export const UserNav = ({
  align = "end",
  className,
}: {
  align?: "start" | "end" | "center";
  className?: string;
}) => {
  const { setOpen: setSettingsOpen } = useSettingsModal();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="ring-0! outline-none!" asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-1.5 h-7 text-xs", className)}
          >
            <Settings className="size-3.5" />
            Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-40 rounded-lg"
          side="bottom"
          align={align}
          sideOffset={4}
        >
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-1 ml-0 size-3.5" />
            API Keys
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsModal />
    </>
  );
};
