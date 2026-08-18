'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { NotificationSettings } from '@/types/api';

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  email: '',
  phone: '',
  buyAlerts: true,
  sellAlerts: true,
  athAlerts: true,
};

interface NotificationContextType {
  settings: NotificationSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('notification_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notification_settings', JSON.stringify(updated));
  };

  return (
    <NotificationContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}