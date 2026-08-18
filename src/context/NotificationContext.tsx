'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { NotificationSettings } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

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
  updateSettings: (_settings: Partial<NotificationSettings>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('notification_settings');
    let loadedSettings = DEFAULT_SETTINGS;
    if (stored) {
      try {
        loadedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        // ignore parse errors
      }
    }
    if (user?.email && !loadedSettings.email) {
      loadedSettings.email = user.email;
    }
    setSettings(loadedSettings);
    setIsLoading(false);
  }, [user?.email]);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('notification_settings', JSON.stringify(updated));
      return updated;
    });
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
