import React from "react";
import { ThemeProvider } from "./theme-provider";
import { DataStreamProvider } from "./data-stream-provider";
import { Toaster } from "sonner";
import { CheckIcon, XIcon, InfoIcon, AlertTriangleIcon } from "lucide-react";

export const AllProviders = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider>
      <Toaster
        duration={50000}
        position="top-right"
        gap={8}
        closeButton
        icons={{
          success: (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500">
              <CheckIcon className="w-2.5 h-2.5 text-white stroke-3" />
            </span>
          ),
          error: (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500">
              <XIcon className="w-2.5 h-2.5 text-white stroke-3" />
            </span>
          ),
          info: (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500">
              <InfoIcon className="w-2.5 h-2.5 text-white stroke-2" />
            </span>
          ),
          warning: (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500">
              <AlertTriangleIcon className="w-2.5 h-2.5 text-white stroke-3" />
            </span>
          ),
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: [
              "relative flex flex-col gap-2",
              "w-[356px] px-4 py-3",
              "bg-white",
              "border border-slate-400/50",
              "rounded-xl",
              "shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
              "font-[system-ui,_-apple-system,_sans-serif] text-sm text-[#111]",
            ].join(" "),
            content: "flex items-start gap-3",
            title: "text-sm font-medium text-[#111] leading-snug",
            description: "text-xs text-[#666] mt-0.5 leading-relaxed",
            actionButton:
              "self-end text-xs font-medium text-[#111] bg-[#f2f2f2] hover:bg-[#e8e8e8] px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-[#e2e2e2]",
            cancelButton:
              "self-end text-xs font-medium text-[#888] hover:text-[#111] px-2 py-1 rounded-md transition-colors cursor-pointer",
            closeButton: [
              "!absolute !top-2 !right-2 !left-auto",
              "size-5! cursor-pointer",
              "rounded-full flex items-center justify-center",
              "border border-[#e2e2e2] bg-white hover:bg-[#f2f2f2]",
              "text-red-500 hover:text-red-600 hover:bg-red-50",
              "transition-colors",
              "[&>svg]:w-3.5 [&>svg]:h-3.5",
            ].join(" "),
          },
        }}
      />
      <DataStreamProvider>{children}</DataStreamProvider>
    </ThemeProvider>
  );
};
