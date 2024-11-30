import React, { createContext, useContext } from 'react';
import { useGlobalState } from '../hooks/useGlobalState';

const GlobalStateContext = createContext<ReturnType<typeof useGlobalState> | null>(null);

export function GlobalContextProvider({ children }: { children: React.ReactNode }) {
  const contextValue = useGlobalState();

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a ContextMasterProvider');
  }
  return context;
}
