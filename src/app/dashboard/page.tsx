'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { PortfolioResponse } from '@/types/api';

export default function DashboardPage() {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 dark:bg-neutral-700" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl dark:bg-neutral-800" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl dark:bg-neutral-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={fetchPortfolio}>Retry</Button>
      </div>
    );
  }

  const buyHits = portfolio?.items.filter((item) => item.isBuyHit).length || 0;
  const sellHits = portfolio?.items.filter((item) => item.isSellHit).length || 0;
  const totalHits = buyHits + sellHits;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your NEPSE portfolio</p>
        </div>
        <Link href="/dashboard/watchlist">
          <Button>Manage Watchlist</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stocks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{portfolio?.count || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  NPR {formatPrice(portfolio?.totalValue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalHits}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Status</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {portfolio?.marketStale ? (
                    <Badge variant="warning">Stale</Badge>
                  ) : (
                    <Badge variant="success">Live</Badge>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalHits > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Action Required
              <Badge variant="danger">{totalHits} alerts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Symbol</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">LTP</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Target</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.items
                    .filter((item) => item.isBuyHit || item.isSellHit)
                    .map((item) => (
                      <tr key={item.symbol} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900">
                        <td className="p-3 font-mono font-medium">{item.symbol}</td>
                        <td className="p-3">NPR {formatPrice(item.ltp)}</td>
                        <td className="p-3">NPR {formatPrice(item.isSellHit ? item.targetSell : item.targetBuy)}</td>
                        <td className="p-3">
                          {item.isSellHit ? (
                            <Badge variant="danger">SELL</Badge>
                          ) : (
                            <Badge variant="success">BUY</Badge>
                          )}
                        </td>
                        <td className="p-3 font-mono">
                          {item.isSellHit ? '+' : '-'}{formatPrice(Math.abs(item.ltp - (item.isSellHit ? item.targetSell : item.targetBuy)))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Watchlist
            <Link href="/dashboard/watchlist">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio?.items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No stocks in watchlist</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Add stocks to start monitoring price targets</p>
              <Link href="/dashboard/watchlist" className="mt-4 inline-block">
                <Button>Add Your First Stock</Button>
              </Link>
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
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.items.slice(0, 10).map((item) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {portfolio && portfolio.items.length > 10 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Showing 10 of {portfolio.items.length} stocks.{' '}
                  <Link href="/dashboard/watchlist" className="text-primary-600 hover:text-primary-500 font-medium">
                    View all
                  </Link>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}