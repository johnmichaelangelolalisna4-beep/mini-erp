"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface MobileNavContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleNav: () => void;
  openNav: () => void;
  closeNav: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile navigation drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleNav = () => setIsOpen((prev) => !prev);
  const openNav = () => setIsOpen(true);
  const closeNav = () => setIsOpen(false);

  return (
    <MobileNavContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleNav,
        openNav,
        closeNav,
      }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}

const defaultMobileNavContext: MobileNavContextType = {
  isOpen: false,
  setIsOpen: () => {},
  toggleNav: () => {},
  openNav: () => {},
  closeNav: () => {},
};

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    return defaultMobileNavContext;
  }
  return context;
}
