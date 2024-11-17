import React, { createContext, useContext } from 'react';
import { useContextMaster } from './useContextMaster';

const ContextMasterContext = createContext<ReturnType<typeof useContextMaster> | null>(null);

export function ContextMasterProvider({ children }: { children: React.ReactNode }) {
  const contextValue = useContextMaster();

  return (
    <ContextMasterContext.Provider value={contextValue}>
      {children}
    </ContextMasterContext.Provider>
  );
}

export function useContextMasterContext() {
  const context = useContext(ContextMasterContext);
  if (!context) {
    throw new Error('useContextMasterContext must be used within a ContextMasterProvider');
  }
  return context;
}
