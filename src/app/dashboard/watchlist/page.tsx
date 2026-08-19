"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { PortfolioResponse, PortfolioItem } from "@/types/api";

export default function WatchlistPage() {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Stock Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: "",
    targetBuy: "",
    targetSell: "",
  });
  const [addError, setAddError] = useState("");

  // Edit Stock Modal
  const [editingStock, setEditingStock] = useState<PortfolioItem | null>(null);
  const [editForm, setEditForm] = useState({ targetBuy: 0, targetSell: 0 });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("auth_token")
          : null);

      if (activeToken) {
        api.setToken(activeToken);
      } else {
        throw new Error("No authentication token found. Please sign in.");
      }

      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err: unknown) {
      let msg = "Failed to load watchlist";
      if (err instanceof Error) {
        msg = err.message;
        if (msg.includes("Failed to fetch")) {
          msg =
            "Unable to reach backend API. Ensure your server is running and ALLOWED_ORIGINS is configured.";
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Handle ESC close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setEditingStock(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Add Stock
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAdding(true);

    const symbol = newStock.symbol.trim().toUpperCase();
    const targetBuy = parseFloat(newStock.targetBuy) || 0;
    const targetSell = parseFloat(newStock.targetSell) || 0;

    if (!symbol) {
      setAddError("Stock symbol is required.");
      setAdding(false);
      return;
    }

    if (targetBuy === 0 && targetSell === 0) {
      setAddError("Set at least one target — buy price, sell price, or both.");
      setAdding(false);
      return;
    }

    if (targetBuy > 0 && targetSell > 0 && targetBuy >= targetSell) {
      setAddError("Your buy target should be lower than your sell target.");
      setAdding(false);
      return;
    }

    try {
      await api.addStock({ symbol, targetBuy, targetSell });
      setShowAddModal(false);
      setNewStock({ symbol: "", targetBuy: "", targetSell: "" });
      await fetchPortfolio();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add stock.");
    } finally {
      setAdding(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (stock: PortfolioItem) => {
    setEditingStock(stock);
    setEditForm({
      targetBuy: stock.targetBuy || 0,
      targetSell: stock.targetSell || 0,
    });
    setEditError("");
  };

  // Save Edit (Calls POST /api/v1/portfolio which upserts)
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

      await api.updateStock(editingStock.symbol, { targetBuy, targetSell });

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
        err instanceof Error ? err.message : "Failed to update target.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Remove Stock
  const handleRemoveStock = async (symbol: string) => {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return;

    try {
      await api.removeStock(symbol);
      setPortfolio((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          count: prev.count - 1,
          items: prev.items.filter((item) => item.symbol !== symbol),
        };
      });
      if (editingStock?.symbol === symbol) {
        setEditingStock(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove stock.");
    }
  };

  const filteredItems = useMemo(() => {
    if (!portfolio?.items) return [];
    return portfolio.items.filter((item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [portfolio, searchQuery]);

  const triggeredCount =
    portfolio?.items.filter((i) => i.isBuyHit || i.isSellHit).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="h-9 bg-slate-200 rounded-xl w-32" />
        </div>
        <div className="h-96 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
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
            Connection Error
          </h3>
          <p className="text-slate-600 text-xs mb-6 leading-relaxed">{error}</p>
          <Button
            onClick={() => fetchPortfolio()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl shadow-md"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-7 font-sans selection:bg-emerald-500/20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
              Watchlist & Targets
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 border border-slate-300 text-slate-700">
              {portfolio?.count || 0} Symbols
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated floor and ceiling triggers for NEPSE securities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 text-xs h-9 px-3.5 rounded-xl shadow-sm"
            >
              ← Back to Terminal
            </Button>
          </Link>

          <Button
            onClick={() => {
              setAddError("");
              setShowAddModal(true);
            }}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            + Add Stock Target
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <input
            type="text"
            placeholder="Search symbol (e.g. NABIL, CIT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono shadow-sm"
          />

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            {triggeredCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                {triggeredCount} Target{triggeredCount > 1 ? "s" : ""} Hit
              </span>
            )}
            <span>
              Showing <strong>{filteredItems.length}</strong> of{" "}
              {portfolio?.items.length || 0} stocks
            </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              No matching stocks in watchlist
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first stock symbol or adjust your search filter to begin
              monitoring live price triggers.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md mt-2"
            >
              + Add First Stock
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Market Price (LTP)</th>
                  <th className="py-3 px-4">Buy Floor Target</th>
                  <th className="py-3 px-4">Sell Ceiling Target</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {filteredItems.map((item) => {
                  const isTriggered = item.isBuyHit || item.isSellHit;

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
                      {/* Status */}
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

                      {/* Buy Target */}
                      <td className="py-3.5 px-4">
                        {item.targetBuy > 0 ? (
                          <span
                            className={
                              item.isBuyHit
                                ? "text-emerald-700 font-black text-sm"
                                : "text-slate-800 font-bold"
                            }
                          >
                            Rs. {formatPrice(item.targetBuy)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Sell Target */}
                      <td className="py-3.5 px-4">
                        {item.targetSell > 0 ? (
                          <span
                            className={
                              item.isSellHit
                                ? "text-rose-700 font-black text-sm"
                                : "text-slate-800 font-bold"
                            }
                          >
                            Rs. {formatPrice(item.targetSell)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleOpenEdit(item)}
                            variant="outline"
                            size="sm"
                            className="bg-white border-slate-300 hover:bg-slate-50 text-slate-800 text-xs h-7 px-2.5 rounded-lg font-bold shadow-sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleRemoveStock(item.symbol)}
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs h-7 px-2.5 rounded-lg font-semibold"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Target Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-mono flex items-center gap-2">
                  <span>Edit {editingStock.symbol}</span>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                    LTP: Rs. {formatPrice(editingStock.ltp)}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update price breakout alert levels.
                </p>
              </div>
              <button
                onClick={() => setEditingStock(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-emerald-950 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-rose-950 font-bold focus:border-rose-600 focus:bg-white focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRemoveStock(editingStock.symbol)}
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

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-mono">
                  Add Stock to Watchlist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set target thresholds to receive live price breakout alerts.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newStock.symbol}
                  onChange={(e) =>
                    setNewStock({
                      ...newStock,
                      symbol: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. NABIL, CIT, GBIME"
                  required
                  disabled={adding}
                  autoFocus
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:border-emerald-600 focus:bg-white focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[11px] font-bold text-emerald-800 block mb-1 uppercase tracking-wider">
                    Buy Floor (NPR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={newStock.targetBuy}
                    onChange={(e) =>
                      setNewStock({ ...newStock, targetBuy: e.target.value })
                    }
                    placeholder="e.g. 480"
                    disabled={adding}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-emerald-950 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-rose-800 block mb-1 uppercase tracking-wider">
                    Sell Ceiling (NPR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={newStock.targetSell}
                    onChange={(e) =>
                      setNewStock({ ...newStock, targetSell: e.target.value })
                    }
                    placeholder="e.g. 650"
                    disabled={adding}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-rose-950 font-bold focus:border-rose-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border-slate-300 text-slate-700 text-xs h-10 rounded-xl"
                  disabled={adding}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl shadow-md shadow-emerald-600/20"
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add to Watchlist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
