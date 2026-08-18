'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationsPage() {
  const { token } = useAuth();
  const { settings, isLoading: settingsLoading, updateSettings } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsLoading) return;
    // Settings loaded from localStorage in context
  }, [settingsLoading]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    // Settings are already saved in localStorage via updateSettings
    // Here you would typically call an API to persist to backend
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: keyof typeof settings, value: boolean | string) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure how you want to be alerted when price targets are hit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>Choose how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailEnabled">Email Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive alerts via email</p>
            </div>
            <Switch
              id="emailEnabled"
              checked={settings.emailEnabled}
              onChange={(e) => handleChange('emailEnabled', e.target.checked)}
            />
          </div>

          {settings.emailEnabled && (
            <Input
              label="Email Address"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="alerts@example.com"
              required
            />
          )}

          <div className="border-t border-gray-200 dark:border-neutral-700 pt-6 flex items-center justify-between">
            <div>
              <Label htmlFor="smsEnabled">SMS Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive alerts via SMS (requires Twilio setup)</p>
            </div>
            <Switch
              id="smsEnabled"
              checked={settings.smsEnabled}
              onChange={(e) => handleChange('smsEnabled', e.target.checked)}
            />
          </div>

          {settings.smsEnabled && (
            <Input
              label="Phone Number"
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+977-98XXXXXXXX"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="buyAlerts">Buy Target Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Notify when price drops to or below buy target</p>
            </div>
            <Switch
              id="buyAlerts"
              checked={settings.buyAlerts}
              onChange={(e) => handleChange('buyAlerts', e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sellAlerts">Sell Target Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Notify when price rises to or above sell target</p>
            </div>
            <Switch
              id="sellAlerts"
              checked={settings.sellAlerts}
              onChange={(e) => handleChange('sellAlerts', e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="athAlerts">All-Time High Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Notify when a stock hits a new all-time high</p>
            </div>
            <Switch
              id="athAlerts"
              checked={settings.athAlerts}
              onChange={(e) => handleChange('athAlerts', e.target.checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• Email notifications use Cloudflare Email Service. Ensure your domain is verified.</p>
          <p>• SMS notifications require Twilio integration (configured on the backend).</p>
          <p>• Alerts are checked every minute via Cloudflare Cron Triggers.</p>
          <p>• You can also receive alerts via Telegram by linking your account.</p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Settings saved successfully!
        </div>
      )}
    </div>
  );
}