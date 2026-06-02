"use client";

import React, { createContext, useContext, useRef } from "react";

type FocusRegistry = Record<string, () => void>;

type UploadFocusContextType = {
  register: (id: string, fn: () => void) => void;
  unregister: (id: string) => void;
  focus: (id: string) => void;
};

const UploadFocusContext = createContext<UploadFocusContextType | null>(null);

export function UploadFocusProvider({ children }: { children: React.ReactNode }) {
  const registryRef = useRef<FocusRegistry>({});

  const register = (id: string, fn: () => void) => {
    if (!id) return;
    registryRef.current[id] = fn;
  };

  const unregister = (id: string) => {
    delete registryRef.current[id];
  };

  const focus = (id: string) => {
    const fn = registryRef.current[id];
    if (typeof fn === "function") fn();
  };

  return (
    <UploadFocusContext.Provider value={{ register, unregister, focus }}>
      {children}
    </UploadFocusContext.Provider>
  );
}

export function useUploadFocus() {
  const ctx = useContext(UploadFocusContext);
  if (!ctx) throw new Error("useUploadFocus must be used within UploadFocusProvider");
  return ctx;
}
