'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { PortfolioResponse, PortfolioItem } from '@/types/api';

export default function WatchlistPage() {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', targetBuy: '', targetSell: '' });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (token) {
      api.setToken(token);
      fetchPortfolio();
    }
  }, [token]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);

    const symbol = newStock.symbol.trim().toUpperCase();
    const targetBuy = parseFloat(newStock.targetBuy) || 0;
    const targetSell = parseFloat(newStock.targetSell) || 0;

    if (!symbol) {
      setAddError('Symbol is required');
      setAdding(false);
      return;
    }

    if (targetBuy === 0 && targetSell === 0) {
      setAddError('At least one target (buy or sell) is required');
      setAdding(false);
      return;
    }

    if (targetBuy > 0 && targetSell > 0 && targetBuy >= targetSell) {
      setAddError('Buy target should be lower than sell target');
      setAdding(false);
      return;
    }

    try {
      await api.addStock({ symbol, targetBuy, targetSell });
      setShowAddModal(false);
      setNewStock({ symbol: '', targetBuy: '', targetSell: '' });
      await fetchPortfolio();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add stock');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return;

    try {
      await api.removeStock(symbol);
      await fetchPortfolio();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove stock');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 dark:bg-neutral-700" />
        <div className="h-64 bg-gray-200 rounded-xl dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your stock price targets</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Stock</Button>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Stocks
            <Badge variant="info">{portfolio?.count || 0} stocks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio?.items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No stocks in watchlist</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Add your first stock to start monitoring</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>Add Stock</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Symbol</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">LTP</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Buy Target</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Sell Target</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.items.map((item: PortfolioItem) => (
                    <tr key={item.symbol} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900">
                      <td className="p-3 font-mono font-medium">{item.symbol}</td>
                      <td className="p-3">NPR {formatPrice(item.ltp)}</td>
                      <td className="p-3">{item.targetBuy > 0 ? `NPR ${formatPrice(item.targetBuy)}` : '-'}</td>
                      <td className="p-3">{item.targetSell > 0 ? `NPR ${formatPrice(item.targetSell)}` : '-'}</td>
                      <td className="p-3">
                        {item.isSellHit && <Badge variant="danger">SELL Hit</Badge>}
                        {item.isBuyHit && <Badge variant="success">BUY Hit</Badge>}
                        {!item.isBuyHit && !item.isSellHit && <Badge variant="info">Monitoring</Badge>}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStock(item.symbol)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Stock to Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStock} className="space-y-4">
                {addError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400" role="alert">
                    {addError}
                  </div>
                )}
                <Input
                  label="Stock Symbol"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., NABIL, GBIME, HDL"
                  required
                  disabled={adding}
                  autoFocus
                />
                <Input
                  label="Buy Target (NPR)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newStock.targetBuy}
                  onChange={(e) => setNewStock({ ...newStock, targetBuy: e.target.value })}
                  placeholder="e.g., 480"
                  disabled={adding}
                />
                <Input
                  label="Sell Target (NPR)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newStock.targetSell}
                  onChange={(e) => setNewStock({ ...newStock, targetSell: e.target.value })}
                  placeholder="e.g., 650"
                  disabled={adding}
                />
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1" disabled={adding}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" loading={adding}>
                    Add Stock
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}