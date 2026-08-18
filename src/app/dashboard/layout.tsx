'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { Providers } from '@/components/Providers';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isUnauthorized = user.authenticated === false && !user.isAdmin;

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950">
        <Header />
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
          {isUnauthorized ? (
            <div className="max-w-3xl mx-auto py-12 px-4">
              <div className="bg-white dark:bg-neutral-900 border border-yellow-200 dark:border-yellow-900/50 rounded-2xl p-8 shadow-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-6">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Pending Authentication</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6">
                  Your account was created successfully! To access full features including the mail service, email alerts, and portfolio dashboard, an administrator must authenticates your account.
                </p>

                <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-6 mb-8 text-left border border-gray-100 dark:border-neutral-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Available Basic Features:</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Account profile viewing ({user.email})
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Public market status & system health checks
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="line-through text-gray-400 dark:text-gray-500">Live mail service & price alert notifications (Requires Admin Authentication)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="line-through text-gray-400 dark:text-gray-500">Portfolio management & watchlist tracking (Requires Admin Authentication)</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="mailto:admin@nepse.com"
                    className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition"
                  >
                    Contact Admin for Activation
                  </a>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </Providers>
  );
}