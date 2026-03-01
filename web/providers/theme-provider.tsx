"use client";
import React, { useEffect, useState } from "react";
import {
  ThemeProvider as NextThemeProvider,
  ThemeProviderProps,
} from "next-themes";

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const [isMounted, setisMounted] = useState(false);

  useEffect(() => {
    setisMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <NextThemeProvider defaultTheme="dark" {...props}>
      {children}
    </NextThemeProvider>
  );
};
