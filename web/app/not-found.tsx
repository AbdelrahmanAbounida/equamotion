"use client";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full gap-4 text-center px-6 bg-accent!">
      <div className="rounded-2xl bg-muted ">
        <Logo className=" text-muted-foreground" isIcon />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl font-medium text-foreground">Chat not found</p>
        <p className="text-md text-muted-foreground max-w-4xl container">
          This conversation is private or has been deleted.
        </p>
      </div>

      <Link
        href="/"
        // className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80"
        className={cn(buttonVariants({ variant: "default" }))}
      >
        Go back to home
      </Link>
    </div>
  );
};

export default NotFound;
