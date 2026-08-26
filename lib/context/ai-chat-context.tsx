"use client";

import React, { createContext, useContext, useState } from "react";

interface AIChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleChat,
        openChat,
        closeChat,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

const defaultAIChatContext: AIChatContextType = {
  isOpen: false,
  setIsOpen: () => {},
  toggleChat: () => {},
  openChat: () => {},
  closeChat: () => {},
};

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (!context) {
    return defaultAIChatContext;
  }
  return context;
}
