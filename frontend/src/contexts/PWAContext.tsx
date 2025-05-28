import React, { createContext, useContext, ReactNode } from 'react';
import { usePWA } from '../hooks/usePWA';

interface PWAContextType {
  installPrompt: any;
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerUpdate: {
    waiting: ServiceWorker | null;
    update: () => void;
  };
  installApp: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  canInstall: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const pwaData = usePWA();

  return (
    <PWAContext.Provider value={pwaData}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAContext = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};
