import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "NEPSE Portfolio Tracker",
  description:
    "Track your NEPSE stock portfolio with real-time price alerts via email and SMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-gray-50 dark:bg-neutral-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
