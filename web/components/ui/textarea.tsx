import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-15 w-full rounded-md border border-input bg-[#fdfdfd] dark:bg-slate-900 px-3 py-2 text-base shadow-sm placeholder:text-slate-600/40 placeholder:sm focus-visible:outline-none   disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "placeholder:text-slate-500",
        // "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      value={props.value || ""}
      {...props}
    />
  );
}
Textarea.displayName = "Textarea";
export { Textarea };
