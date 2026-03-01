"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { DataUIPart, ToolUIPart } from "ai";
import { CustomUIDataTypes } from "@/lib/types";

// Union type for all stream parts
type StreamPart = DataUIPart<CustomUIDataTypes> | ToolUIPart;

interface DataStreamContextValue {
  dataStream: StreamPart[];
  setDataStream: React.Dispatch<React.SetStateAction<StreamPart[]>>;
}

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataStream, setDataStream] = useState<StreamPart[]>([]);

  const value = useMemo(() => ({ dataStream, setDataStream }), [dataStream]);

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error("useDataStream must be used within a DataStreamProvider");
  }
  return context;
}
