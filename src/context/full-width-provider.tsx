'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface FullWidthContextType {
  isFullWidth: boolean;
  setIsFullWidth: Dispatch<SetStateAction<boolean>>;
}

const FullWidthContext = createContext<FullWidthContextType | undefined>(
  undefined
);

export function FullWidthProvider({ children }: { children: ReactNode }) {
  const [isFullWidth, setIsFullWidth] = useState<boolean>(() => {
    // Initialize state from localStorage, defaulting to false if not set
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isFullWidth');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem('isFullWidth', JSON.stringify(isFullWidth));
  }, [isFullWidth]);

  return (
    <FullWidthContext.Provider value={{ isFullWidth, setIsFullWidth }}>
      {children}
    </FullWidthContext.Provider>
  );
}

export function useFullWidth() {
  const context = useContext(FullWidthContext);
  if (context === undefined) {
    throw new Error('useFullWidth must be used within a FullWidthProvider');
  }
  return context;
}
