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

const noopFocusContext: UploadFocusContextType = {
  register: () => {},
  unregister: () => {},
  focus: () => {},
};

export function useUploadFocus(): UploadFocusContextType {
  const ctx = useContext(UploadFocusContext);
  return ctx ?? noopFocusContext;
}
