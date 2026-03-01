"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, type ComponentProps } from "react";

// ─── Suggestions Slider ────────────────────────────────────────────────────

export type SuggestionsProps = {
  className?: string;
  children: React.ReactNode;
};

export const Suggestions = ({ className, children }: SuggestionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [children]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-1 w-full max-w-2xl",
        className,
      )}
    >
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className={cn(
          "shrink-0 flex  cursor-pointer items-center justify-center rounded-full w-7 h-7 border border-border bg-background shadow-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:shadow-md",
          canScrollLeft
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scroll container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Left fade */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-8 z-10 pointer-events-none transition-opacity duration-200 bg-linear-to-r from-[#FAFAFA] to-transparent",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollRef}
          className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>

        {/* Right fade */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-8 z-10 pointer-events-none transition-opacity duration-200 bg-linear-to-l from-[#FAFAFA] to-transparent",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className={cn(
          "shrink-0 flex cursor-pointer items-center justify-center rounded-full w-7 h-7 border border-border bg-background shadow-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:shadow-md",
          canScrollRight
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Suggestion Pill ───────────────────────────────────────────────────────

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => (
  <Button
    className={cn(
      "cursor-pointer rounded-full px-4 shrink-0 whitespace-nowrap transition-all duration-150 hover:shadow-sm",
      className,
    )}
    onClick={() => onClick?.(suggestion)}
    size={size}
    type="button"
    variant={variant}
    {...props}
  >
    {children || suggestion}
  </Button>
);
