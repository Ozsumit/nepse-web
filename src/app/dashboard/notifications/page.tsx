"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    settings,
    isLoading: settingsLoading,
    updateSettings,
  } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    previewUrl?: string;
  } | null>(null);

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
      setTestResult({
        success: false,
        message: "Please enter a valid email address first.",
      });
      return;
    }

    if (user?.authenticated === false && !user?.isAdmin) {
      setTestResult({
        success: false,
        message:
          "Mail service unavailable. Your account must be authenticated to receive price alerts.",
      });
      return;
    }

    setTestingEmail(true);
    setTestResult(null);

    try {
      const res = await api.sendEmail({
        to: targetEmail,
        subject: "NEPSE Portfolio Tracker - Price Alert Test",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
            <h2 style="color: #2563eb;">🚀 NEPSE Price Alert Notification Test</h2>
            <p>Hello,</p>
            <p>This is a test notification from your <strong>NEPSE Portfolio Tracker</strong>.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Status:</strong> ✅ Verified & Active</p>
              <p style="margin: 5px 0 0;"><strong>Email Delivery:</strong> Resend API (sumit.info.np)</p>
            </div>
            <p style="color: #6b7280; font-size: 13px;">You will receive automated emails whenever your stock targets are breached.</p>
          </div>
        `,
        userAuthenticated: user?.authenticated,
      });

      setTestResult({
        success: true,
        message:
          res.message || `Test email successfully sent to ${targetEmail}!`,
        previewUrl: res.previewUrl,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err instanceof Error ? err.message : "Failed to send test email.",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleChange = (
    key: keyof typeof settings,
    value: boolean | string,
  ) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notification Settings
          </h1>
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Receive price target alerts via Resend email service
              </p>
            </div>
            <Switch
              id="emailEnabled"
              checked={settings.emailEnabled}
              onChange={(e) => handleChange("emailEnabled", e.target.checked)}
            />
          </div>

          {settings.emailEnabled && (
            <div className="space-y-4 border-l-2 border-primary-500 pl-4 py-1">
              <Input
                label="Email Address"
                type="email"
                value={settings.email || user?.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="alerts@example.com"
                required
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestEmail}
                    loading={testingEmail}
                  >
                    Send Test Email
                  </Button>
                </div>
                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs border ${testResult.success ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"}`}
                  >
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Receive alerts via SMS (requires Twilio setup)
              </p>
            </div>
            <Switch
              id="smsEnabled"
              checked={settings.smsEnabled}
              onChange={(e) => handleChange("smsEnabled", e.target.checked)}
            />
          </div>

          {settings.smsEnabled && (
            <Input
              label="Phone Number"
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+977-98XXXXXXXX"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="buyAlerts">Buy Target Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Notify when price drops to or below buy target
              </p>
            </div>
            <Switch
              id="buyAlerts"
              checked={settings.buyAlerts}
              onChange={(e) => handleChange("buyAlerts", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sellAlerts">Sell Target Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Notify when price rises to or above sell target
              </p>
            </div>
            <Switch
              id="sellAlerts"
              checked={settings.sellAlerts}
              onChange={(e) => handleChange("sellAlerts", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="athAlerts">All-Time High Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Notify when a stock hits a new all-time high
              </p>
            </div>
            <Switch
              id="athAlerts"
              checked={settings.athAlerts}
              onChange={(e) => handleChange("athAlerts", e.target.checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-300">
            Active Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-blue-800 dark:text-blue-400">
          <p>
            • <strong>Provider:</strong> Resend API
          </p>
          <p>
            • <strong>Sender Domain:</strong> <code>sumit.info.np</code>
          </p>
          <p>
            • <strong>Authentication:</strong> Only verified & authenticated
            accounts receive automated alerts.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
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
