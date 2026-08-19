"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Mail,
  TrendingDown,
  TrendingUp,
  Trophy,
  Info,
  Send,
} from "lucide-react";

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
  }, [settingsLoading, user?.email, settings.email, updateSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await updateSettings(settings);

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
              <p style="margin: 5px 0 0;"><strong>Email Delivery:</strong> Resend API</p>
            </div>
            <p style="color: #6b7280; font-size: 13px;">
              You will receive automated emails whenever your stock targets are breached.
            </p>
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

  const handleToggleChange = (
    key: keyof typeof settings,
    valOrEvent: boolean | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value =
      typeof valOrEvent === "boolean" ? valOrEvent : valOrEvent.target.checked;
    updateSettings({ [key]: value });
  };

  if (settingsLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800" />
        <div className="h-5 w-96 animate-pulse rounded bg-gray-100 dark:bg-neutral-800/60" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800/60" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50 dark:bg-neutral-950 p-4 sm:p-6 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-4xl space-y-6 pb-24">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-sm">
              <Bell className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Notification Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                Control how you receive alerts when your NEPSE price targets are
                reached.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold sm:self-auto ${
              settings.emailEnabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-gray-200 bg-white text-gray-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                settings.emailEnabled
                  ? "bg-emerald-500 dark:bg-emerald-400"
                  : "bg-gray-400 dark:bg-neutral-600"
              }`}
            />
            {settings.emailEnabled
              ? "Notifications active"
              : "Notifications disabled"}
          </div>
        </div>

        {/* Delivery Methods Card */}
        <Card className="overflow-hidden border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Delivery Methods
                </CardTitle>

                <CardDescription className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  Choose where your stock alerts should be delivered.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Email Toggle Row */}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 sm:flex">
                  <Mail className="h-4 w-4" />
                </div>

                <div>
                  <label
                    htmlFor="emailEnabled"
                    className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Email Notifications
                  </label>

                  <p className="mt-1 max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-400">
                    Receive price target alerts directly in your inbox.
                  </p>
                </div>
              </div>

              <Switch
                id="emailEnabled"
                checked={!!settings.emailEnabled}
                onCheckedChange={(checked) =>
                  handleToggleChange("emailEnabled", checked)
                }
                onChange={(e) => handleToggleChange("emailEnabled", e)}
              />
            </div>

            {/* Expanded Email Settings */}
            {settings.emailEnabled && (
              <div className="border-t border-gray-100 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/50 px-6 py-6">
                <div className="max-w-xl space-y-5">
                  <div>
                    <Input
                      id="notification-email"
                      type="email"
                      label="Alert email address"
                      value={settings.email ?? ""}
                      onChange={(e) =>
                        updateSettings({ email: e.target.value })
                      }
                      placeholder="alerts@example.com"
                      helperText="This address will receive your automated price alerts."
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendTestEmail}
                      loading={testingEmail}
                      className="w-full sm:w-auto"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send test email
                    </Button>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Verify that email delivery is working properly.
                    </span>
                  </div>

                  {testResult && (
                    <div
                      className={`rounded-xl border p-4 ${
                        testResult.success
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                          : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-0.5 shrink-0 ${
                            testResult.success
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {testResult.success ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Info className="h-5 w-5" />
                          )}
                        </div>

                        <div className="text-sm">
                          <p
                            className={
                              testResult.success
                                ? "text-emerald-800 dark:text-emerald-300"
                                : "text-red-800 dark:text-red-300"
                            }
                          >
                            {testResult.message}
                          </p>

                          {testResult.previewUrl && (
                            <a
                              href={testResult.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block font-medium text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              View generated test email
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Types Card */}
        <Card className="overflow-hidden border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-neutral-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Alert Types
                </CardTitle>

                <CardDescription className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  Select the market events you want to monitor.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="divide-y divide-gray-100 dark:divide-neutral-800 p-0">
            {/* Buy Alert */}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="h-5 w-5" />
                </div>

                <div>
                  <label
                    htmlFor="buyAlerts"
                    className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Buy Target Alerts
                  </label>

                  <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    Notify when a stock falls to or below your buy target.
                  </p>
                </div>
              </div>

              <Switch
                id="buyAlerts"
                checked={!!settings.buyAlerts}
                onCheckedChange={(checked) =>
                  handleToggleChange("buyAlerts", checked)
                }
                onChange={(e) => handleToggleChange("buyAlerts", e)}
              />
            </div>

            {/* Sell Alert */}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>
                  <label
                    htmlFor="sellAlerts"
                    className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Sell Target Alerts
                  </label>

                  <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    Notify when a stock rises to or above your sell target.
                  </p>
                </div>
              </div>

              <Switch
                id="sellAlerts"
                checked={!!settings.sellAlerts}
                onCheckedChange={(checked) =>
                  handleToggleChange("sellAlerts", checked)
                }
                onChange={(e) => handleToggleChange("sellAlerts", e)}
              />
            </div>

            {/* ATH Alert */}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <label
                    htmlFor="athAlerts"
                    className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    All-Time High Alerts
                  </label>

                  <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    Notify when a stock reaches a new all-time high.
                  </p>
                </div>
              </div>

              <Switch
                id="athAlerts"
                checked={!!settings.athAlerts}
                onCheckedChange={(checked) =>
                  handleToggleChange("athAlerts", checked)
                }
                onChange={(e) => handleToggleChange("athAlerts", e)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/70 dark:bg-blue-500/10 px-5 py-4">
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400">
              <Info className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Email delivery details
              </h3>

              <div className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-300">
                <p>
                  <span className="font-medium">Provider:</span> Resend API
                </p>
                <p>
                  <span className="font-medium">Sender domain:</span>{" "}
                  <code className="rounded bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 font-mono text-blue-900 dark:text-blue-200">
                    sumit.info.np
                  </code>
                </p>
                <p>
                  <span className="font-medium">Access:</span> Only verified and
                  authenticated accounts receive automated alerts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 p-4 shadow-lg backdrop-blur">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Notification preferences
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Save changes to update your market target alert preferences.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto sm:ml-auto"
          >
            {saving ? (
              "Saving..."
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4 text-emerald-400" />
                Saved
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {saved && (
        <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 dark:bg-neutral-800 border dark:border-neutral-700 px-5 py-3 text-sm font-medium text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          Notification settings saved
        </div>
      )}
    </div>
  );
}
