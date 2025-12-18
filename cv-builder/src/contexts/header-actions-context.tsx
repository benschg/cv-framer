'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface HeaderActionsContextValue {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(null);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    throw new Error('useHeaderActions must be used within a HeaderActionsProvider');
  }
  return context;
}

/**
 * Component to render header actions in the header slot.
 * Place this in the dashboard header.
 */
export function HeaderActionsSlot() {
  const { actions } = useHeaderActions();
  return <>{actions}</>;
}
