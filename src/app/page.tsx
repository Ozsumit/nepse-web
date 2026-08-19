"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

// Mock Live Market Ticker Data
const MOCK_TICKERS = [
  { symbol: "NABIL", ltp: 585.0, change: "+2.4%", up: true },
  { symbol: "SHIVM", ltp: 492.1, change: "-1.1%", up: false },
  { symbol: "HDL", ltp: 1420.0, change: "+0.8%", up: true },
  { symbol: "CIT", ltp: 2180.0, change: "+3.2%", up: true },
  { symbol: "GBIME", ltp: 212.5, change: "-0.5%", up: false },
  { symbol: "NICA", ltp: 418.0, change: "+1.9%", up: true },
];

export default function HomePage() {
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [copied, setCopied] = useState(false);

  const upiId = "nepsealerts@fonepay";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnId.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus("success");
    }, 1400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 selection:bg-emerald-500 selection:text-black overflow-x-hidden font-sans">
      <Header />

      {/* Live Market Ticker Tape */}
      <div className="w-full bg-[#0D1322] border-b border-slate-800/80 py-2.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-xs">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live Market
          </span>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="flex gap-8 items-center">
            {MOCK_TICKERS.map((t) => (
              <div key={t.symbol} className="flex items-center gap-2 font-mono">
                <span className="font-semibold text-slate-200">{t.symbol}</span>
                <span className="text-slate-400">Rs. {t.ltp.toFixed(1)}</span>
                <span className={t.up ? "text-emerald-400" : "text-rose-400"}>
                  {t.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Radial Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-[130px] -z-10 pointer-events-none rounded-full" />

          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Automated NEPSE Target Engine v2.0
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Never miss a NEPSE swing again.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Set automated target buy/sell trigger points. Get instant
              latency-free alerts directly via SMS, Email, and Telegram bot.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 shadow-lg shadow-emerald-500/25 border-0"
                >
                  Sign Up & Authenticate
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-slate-900/60 border-slate-700 hover:bg-slate-800 text-slate-200 h-12"
                >
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Payment & Authentication Section */}
        <section
          id="authenticate"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-emerald-500/40 via-slate-800/40 to-slate-900/80 shadow-2xl">
            <div className="bg-[#0B101B] rounded-[22px] p-6 sm:p-10 backdrop-blur-xl">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left details */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Step 1 • Authentication
                    </span>
                    <span className="text-xs text-slate-400">
                      One-time validation
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    Unlock Live Execution Alerts for{" "}
                    <span className="text-emerald-400">Rs. 35</span> monthly
                  </h2>

                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    We charge a nominal verification fee of{" "}
                    <strong>Rs. 35</strong> to filter spam bots and allocate
                    dedicated live-market monitoring compute threads for your
                    watchlist.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      "Sub-second target execution",
                      "SMS + Telegram real-time push",
                      "Auto-synced portfolio targets",
                      "No recurring subscriptions",
                    ].map((perk) => (
                      <div
                        key={perk}
                        className="flex items-center gap-2 text-xs font-medium text-slate-300"
                      >
                        <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                        {perk}
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Merchant UPI / Fonepay ID:
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="font-mono text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
                    >
                      {upiId}
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {copied ? "Copied!" : "Copy"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right QR Box */}
                <div className="lg:col-span-5 bg-gradient-to-b from-[#121A2D] to-[#0E1424] p-6 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col items-center text-center">
                  <div className="relative p-3.5 bg-white rounded-2xl shadow-inner mb-4">
                    <img
                      src="/qr.png"
                      alt="Pay Rs. 35 QR"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg"
                    />
                    <div className="absolute -bottom-2.5 left-1/2 object-cover -translate-x-1/2 bg-slate-950 text-white font-mono text-[10px] font-bold px-3 py-0.5 rounded-full border border-slate-800 shadow">
                      Rs. 35 NPR
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4 mt-1">
                    Scan via <strong>eSewa, Khalti, IME Pay,</strong> or any{" "}
                    <strong>Banking App</strong>
                  </p>

                  {status === "success" ? (
                    <div className="w-full py-4 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold animate-fade-in">
                      ✓ Transaction received! Account authenticated.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleVerify}
                      className="w-full space-y-2.5"
                    >
                      <input
                        type="text"
                        placeholder="Enter Transaction ID / Reference"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        required
                        className="w-full text-xs px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting || !txnId}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-3 rounded-xl transition-all"
                      >
                        {isSubmitting
                          ? "Verifying Payment..."
                          : "Submit & Authenticate (Rs. 35)"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Engineered for NEPSE Day Traders & Investors
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Eliminate emotional checking. Set your price triggers and let
              automated workers handle the surveillance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Sub-Minute Polling
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Our Cloudflare edge workers poll live market books and tick
                records continuously to catch sharp breakouts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                🔔
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Multi-Channel Alerts
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Receive notifications through your preferred channel: Telegram
                bot triggers, high-priority SMS, or direct email.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-4">
                📊
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Automated Target Rebalancing
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Easily modify your targets, track trailing stop-losses, and
                visualize target progress against real-time LTP.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A12] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} NEPSE Alerts. High frequency stock
            monitoring.
          </p>
          <div className="flex gap-6 text-slate-400">
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
            <Link href="#authenticate" className="hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
