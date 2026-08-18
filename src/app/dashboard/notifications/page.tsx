'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { settings, isLoading: settingsLoading, updateSettings } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; previewUrl?: string } | null>(null);

  useEffect(() => {
    if (settingsLoading) return;
    if (user?.email && !settings.email) {
      updateSettings({ email: user.email });
    }
  }, [settingsLoading, user?.email]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await updateSettings(settings);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSendTestEmail = async () => {
    const targetEmail = settings.email || user?.email;
    if (!targetEmail) {
      setTestResult({ success: false, message: 'Please enter a valid email address first.' });
      return;
    }

    setTestingEmail(true);
    setTestResult(null);

    try {
      const res = await api.sendEmail({
        to: targetEmail,
        subject: 'NEPSE Portfolio Tracker - Price Alert Notification Test',
      });

      setTestResult({
        success: true,
        message: res.message,
        previewUrl: res.previewUrl,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send test email.',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleChange = (key: keyof typeof settings, value: boolean | string) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure how you want to be alerted when price targets are hit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={settings.emailEnabled ? "success" : "warning"}>
            Email Service {settings.emailEnabled ? "Active" : "Disabled"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>Choose how you receive stock alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailEnabled">Email Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive price target alerts via Resend / SMTP email service</p>
            </div>
            <Switch
              id="emailEnabled"
              checked={settings.emailEnabled}
              onChange={(e) => handleChange('emailEnabled', e.target.checked)}
            />
          </div>

          {settings.emailEnabled && (
            <div className="space-y-4 border-l-2 border-primary-500 pl-4 py-1">
              <Input
                label="Email Address"
                type="email"
                value={settings.email || user?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="alerts@example.com"
                required
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleSendTestEmail} loading={testingEmail}>
                    Send Test Email
                  </Button>
                </div>
                {testResult && (
                  <div className={`p-3 rounded-lg text-xs border ${testResult.success ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                    <p>{testResult.message}</p>
                    {testResult.previewUrl && (
                      <a
                        href={testResult.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-primary-600 dark:text-primary-400 font-medium block mt-1"
                      >
                        Click here to view generated test email online
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
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
            Email Provider Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• <strong>Resend:</strong> Set <code>RESEND_API_KEY</code> in environment variables / <code>.dev.vars</code>.</p>
          <p>• <strong>SMTP (Nodemailer):</strong> Set <code>SMTP_HOST</code>, <code>SMTP_USER</code>, and <code>SMTP_PASS</code>.</p>
          <p>• <strong>Default / Fallback:</strong> Uses Nodemailer test transporter so you can preview sent emails live!</p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Notification settings saved successfully!
        </div>
      )}
    </div>
  );
}
