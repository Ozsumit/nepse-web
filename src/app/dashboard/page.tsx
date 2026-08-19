"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { PortfolioResponse, PortfolioItem } from "@/types/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ALERTS" | "MONITORING">(
    "ALL",
  );

  // Edit Stock Modal State
  const [editingStock, setEditingStock] = useState<PortfolioItem | null>(null);
  const [editForm, setEditForm] = useState({
    targetBuy: 0,
    targetSell: 0,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Safe fetch with fallback token resolution
  const fetchPortfolio = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setError("");

        const activeToken =
          token ||
          (typeof window !== "undefined"
            ? localStorage.getItem("auth_token") ||
              localStorage.getItem("token")
            : null);

        if (activeToken) {
          api.setToken(activeToken);
        } else {
          throw new Error("No authentication token found. Please sign in.");
        }

        const data = await api.getPortfolio();
        setPortfolio(data);
      } catch (err: unknown) {
        let msg = "Failed to load portfolio";
        if (err instanceof Error) {
          msg = err.message;
          if (msg.includes("Failed to fetch")) {
            msg =
              "Unable to reach backend API. Ensure your server is online and CORS is configured.";
          }
        }
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingStock(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenEdit = (stock: PortfolioItem) => {
    setEditingStock(stock);
    setEditForm({
      targetBuy: stock.targetBuy || 0,
      targetSell: stock.targetSell || 0,
    });
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;

    try {
      setIsSavingEdit(true);
      setEditError("");

      const targetBuy = Number(editForm.targetBuy) || 0;
      const targetSell = Number(editForm.targetSell) || 0;

      if (targetBuy === 0 && targetSell === 0) {
        setEditError(
          "Set at least one target — buy price, sell price, or both.",
        );
        setIsSavingEdit(false);
        return;
      }

      if (targetBuy > 0 && targetSell > 0 && targetBuy >= targetSell) {
        setEditError("Buy target should be lower than sell target.");
        setIsSavingEdit(false);
        return;
      }

      await api.updateStock(editingStock.symbol, {
        targetBuy,
        targetSell,
      });

      // Optimistic update
      setPortfolio((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.symbol === editingStock.symbol
              ? {
                  ...item,
                  targetBuy,
                  targetSell,
                  isBuyHit:
                    targetBuy > 0 && item.ltp > 0 && item.ltp <= targetBuy,
                  isSellHit: targetSell > 0 && item.ltp >= targetSell,
                }
              : item,
          ),
        };
      });

      setEditingStock(null);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update target",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingStock || !confirm(`Remove ${editingStock.symbol}?`)) return;
    try {
      setIsSavingEdit(true);
      await api.removeStock(editingStock.symbol);
      setPortfolio((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          count: prev.count - 1,
          items: prev.items.filter(
            (item) => item.symbol !== editingStock.symbol,
          ),
        };
      });
      setEditingStock(null);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to delete stock",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Active triggers list
  const triggeredItems = useMemo(() => {
    if (!portfolio?.items) return [];
    return portfolio.items.filter((item) => item.isBuyHit || item.isSellHit);
  }, [portfolio]);

  // Filtered & prioritized list
  const filteredItems = useMemo(() => {
    if (!portfolio?.items) return [];
    const list = portfolio.items.filter((item: PortfolioItem) => {
      const matchesSearch = item.symbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (filterType === "ALERTS")
        return matchesSearch && (item.isBuyHit || item.isSellHit);
      if (filterType === "MONITORING")
        return matchesSearch && !item.isBuyHit && !item.isSellHit;
      return matchesSearch;
    });

    return [...list].sort((a, b) => {
      const aHit = a.isBuyHit || a.isSellHit ? 1 : 0;
      const bHit = b.isBuyHit || b.isSellHit ? 1 : 0;
      return bHit - aHit;
    });
  }, [portfolio, searchQuery, filterType]);

  const buyHits = portfolio?.items.filter((item) => item.isBuyHit).length || 0;
  const sellHits =
    portfolio?.items.filter((item) => item.isSellHit).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-60 animate-pulse" />
        <div className="h-32 bg-slate-200/70 border border-slate-300 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-200/50 border border-slate-300 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white border border-rose-200 rounded-3xl max-w-md w-full shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-black text-xl border border-rose-100">
            !
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Feed Connection Error
          </h3>
          <p className="text-slate-600 text-xs mb-6 leading-relaxed">{error}</p>
          <Button
            onClick={() => fetchPortfolio()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-md"
          >
            Reconnect Terminal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-7 font-sans selection:bg-emerald-500/20">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          {/* <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" /> */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-mono flex items-center gap-2">
              NEPSE LIVE ALERTS
            </h1>
            <p className="text-xs text-slate-500">
              Automated price trigger monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => fetchPortfolio(true)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 text-xs h-9 px-3 rounded-xl shadow-sm"
          >
            {isRefreshing ? "Syncing..." : "Sync Market"}
          </Button>
          <Link href="/dashboard/watchlist">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              + Add Target
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. ACTIVE TRIGGERS HERO DECK (Instant Glance) */}
      {triggeredItems.length > 0 ? (
        <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* <span className="relative flex h-3 w-3"> */}
              {/* <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" /> */}
              {/* <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600" /> */}
              {/* </span> */}
              <h2 className="text-sm font-black tracking-wider text-amber-950 uppercase font-mono">
                Active Target Triggers ({triggeredItems.length})
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 font-mono">
              Immediate Action Recommended
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {triggeredItems.map((item) => (
              <div
                key={item.symbol}
                className={`p-4 rounded-xl border-2 flex items-center justify-between shadow-sm transition-all ${
                  item.isBuyHit
                    ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                    : "bg-rose-50 border-rose-400 text-rose-950"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-black font-mono tracking-wide">
                      {item.symbol}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                        item.isBuyHit
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {item.isBuyHit ? "BUY HIT" : "SELL HIT"}
                    </span>
                  </div>

                  <div className="text-xs font-mono">
                    <span className="text-slate-600">LTP:</span>{" "}
                    <strong className="text-slate-900 text-sm">
                      Rs. {formatPrice(item.ltp)}
                    </strong>{" "}
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Target: Rs.{" "}
                      {formatPrice(
                        item.isBuyHit ? item.targetBuy : item.targetSell,
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenEdit(item)}
                  size="sm"
                  className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs px-3 h-8 rounded-lg shadow-sm font-semibold"
                >
                  Adjust
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Normal State */
        <></>
      )}

      {/* 3. Fast Stats Overview */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 font-mono">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1 uppercase font-sans font-bold tracking-wider">
            Total Watchlist
          </div>
          <div className="text-3xl font-black text-slate-900">
            {portfolio?.count || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1 uppercase font-sans font-bold tracking-wider">
            Buy Floor Hits
          </div>
          <div className="text-3xl font-black text-emerald-600">{buyHits}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1 uppercase font-sans font-bold tracking-wider">
            Sell Ceiling Hits
          </div>
          <div className="text-3xl font-black text-rose-600">{sellHits}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1 uppercase font-sans font-bold tracking-wider">
            Portfolio Net Value
          </div>
          <div className="text-3xl font-black text-slate-900">
            <span className="text-xs text-slate-500 font-normal mr-1">Rs.</span>
            {formatPrice(portfolio?.totalValue || 0)}
          </div>
        </div>
      </div>

      {/* 4. Watchlist Table with Visual Proximity Gauges */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search symbol (e.g. NABIL, SHIVM)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 w-full sm:w-64 font-mono shadow-sm"
            />

            <div className="flex bg-slate-200/70 p-1 border border-slate-200 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-lg transition-all ${filterType === "ALL" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("ALERTS")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${filterType === "ALERTS" ? "bg-amber-100 text-amber-900 font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Alerts
                {triggeredItems.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black font-mono">
                    {triggeredItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterType("MONITORING")}
                className={`px-3 py-1 rounded-lg transition-all ${filterType === "MONITORING" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Tracking
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono hidden sm:block">
            {filteredItems.length} Stocks Displayed
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Market Price (LTP)</th>
                <th className="py-3 px-4">Buy Floor (Target)</th>
                <th className="py-3 px-4">Sell Ceiling (Target)</th>
                <th className="py-3 px-4">Target Proximity Gauge</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filteredItems.map((item) => {
                const isTriggered = item.isBuyHit || item.isSellHit;
                const buyDistPct =
                  item.targetBuy && item.ltp
                    ? ((item.ltp - item.targetBuy) / item.targetBuy) * 100
                    : null;
                const sellDistPct =
                  item.targetSell && item.ltp
                    ? ((item.targetSell - item.ltp) / item.ltp) * 100
                    : null;

                return (
                  <tr
                    key={item.symbol}
                    className={`transition-colors ${
                      item.isBuyHit
                        ? "bg-emerald-50/70 hover:bg-emerald-50 border-l-4 border-l-emerald-600"
                        : item.isSellHit
                          ? "bg-rose-50/70 hover:bg-rose-50 border-l-4 border-l-rose-600"
                          : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Status Pill */}
                    <td className="py-3.5 px-4 font-sans">
                      {item.isBuyHit && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-black text-[10px] bg-emerald-600 text-white shadow-sm animate-pulse">
                          BUY HIT
                        </span>
                      )}
                      {item.isSellHit && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-black text-[10px] bg-rose-600 text-white shadow-sm animate-pulse">
                          SELL HIT
                        </span>
                      )}
                      {!isTriggered && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium border border-slate-200">
                          Tracking
                        </span>
                      )}
                    </td>

                    {/* Symbol */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {item.symbol}
                    </td>

                    {/* LTP */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      Rs. {formatPrice(item.ltp)}
                    </td>

                    {/* Buy Floor */}
                    <td className="py-3.5 px-4">
                      {item.targetBuy > 0 ? (
                        <div
                          className={
                            item.isBuyHit
                              ? "text-emerald-700 font-black text-sm"
                              : "text-slate-800 font-bold"
                          }
                        >
                          Rs. {formatPrice(item.targetBuy)}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Sell Ceiling */}
                    <td className="py-3.5 px-4">
                      {item.targetSell > 0 ? (
                        <div
                          className={
                            item.isSellHit
                              ? "text-rose-700 font-black text-sm"
                              : "text-slate-800 font-bold"
                          }
                        >
                          Rs. {formatPrice(item.targetSell)}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Visual Proximity Bar */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                          <span>
                            {item.targetBuy > 0 ? (
                              buyDistPct && buyDistPct <= 0 ? (
                                <strong className="text-emerald-700">
                                  Floor Hit
                                </strong>
                              ) : (
                                `${buyDistPct?.toFixed(1)}% to buy`
                              )
                            ) : null}
                          </span>
                          <span>
                            {item.targetSell > 0 ? (
                              sellDistPct && sellDistPct <= 0 ? (
                                <strong className="text-rose-700">
                                  Ceiling Hit
                                </strong>
                              ) : (
                                `${sellDistPct?.toFixed(1)}% to sell`
                              )
                            ) : null}
                          </span>
                        </div>

                        {/* Progress line */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full ${
                              item.isBuyHit
                                ? "bg-emerald-600 w-full"
                                : item.isSellHit
                                  ? "bg-rose-600 w-full"
                                  : "bg-indigo-400 w-1/2"
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => handleOpenEdit(item)}
                        variant="outline"
                        size="sm"
                        className="bg-white border-slate-300 hover:bg-slate-50 text-slate-800 text-xs h-7 px-3 rounded-lg font-sans font-bold shadow-sm"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-mono flex items-center gap-2">
                  <span>{editingStock.symbol}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                    LTP: Rs. {formatPrice(editingStock.ltp)}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setEditingStock(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[11px] font-bold text-emerald-800 block mb-1 uppercase tracking-wider">
                    Buy Floor (NPR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.targetBuy}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        targetBuy: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-emerald-950 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-rose-800 block mb-1 uppercase tracking-wider">
                    Sell Ceiling (NPR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.targetSell}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        targetSell: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-rose-950 font-bold focus:border-rose-600 focus:bg-white focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDeleteFromModal}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                >
                  Remove Symbol
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingStock(null)}
                    className="bg-white border-slate-300 text-slate-700 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingEdit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    {isSavingEdit ? "Saving..." : "Save Targets"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
