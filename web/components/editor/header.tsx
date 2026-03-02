"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../logo";
import { UserNav } from "./user-nav";

interface EditorHeaderProps {
  title: string;
  chatId?: string;
  description?: string;
  onBack?: () => void;
}

export function EditorHeader({
  title,
  chatId,
  description,
  onBack,
}: EditorHeaderProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex h-14 items-center justify-between px-4"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            // if (onBack) {
            //   onBack();
            // } else {
            //   router.push("/");
            // }
            window.location.href = "/";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="border border-brand-300 bg-brand-200 rounded-md">
            <Logo isIcon className="size-7 text-primary-foreground" />
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="font-medium text-sm text-foreground">{title}</span>
            <span className="text-muted-foreground text-[11px]">
              {description || chatId || "New Chat"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <UserNav />
      </div>
    </motion.header>
  );
}
