'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { User } from '@/types/api';

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addIsAdmin, setAddIsAdmin] = useState(false);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);


  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      if (!addEmail || !addEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      await api.createUser({
        email: addEmail.trim(),
        isAdmin: addIsAdmin,
      });

      setShowAddModal(false);
      setAddEmail('');
      setAddIsAdmin(false);
      await fetchUsers();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleAdmin = async (targetUser: User) => {
    try {
      await api.updateUser(targetUser.id, {
        isAdmin: !targetUser.isAdmin,
      });
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleToggleAuthenticated = async (targetUser: User) => {
    try {
      await api.updateUser(targetUser.id, {
        authenticated: !targetUser.authenticated,
      });
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update authentication status');
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    try {
      const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
      await api.updateUser(targetUser.id, {
        status: newStatus,
      });
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${targetUser.email}"?`)) {
      return;
    }

    try {
      await api.deleteUser(targetUser.id);
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // Unauthorized screen for non-admin users
  if (!user?.isAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-red-200 dark:border-red-900/50">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">403 - Access Denied</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
              You do not have administrative authorization to view or access this page. Users cannot view the admin panel without admin authorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-2">
            <Link href="/dashboard">
              <Button className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    if (roleFilter === 'admin') return matchesSearch && u.isAdmin;
    if (roleFilter === 'user') return matchesSearch && !u.isAdmin;
    return matchesSearch;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.isAdmin).length;
  const activeCount = users.filter((u) => u.status !== 'suspended').length;
  const telegramCount = users.filter((u) => u.telegramLinked).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage platform users, roles, and authorization</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add New User</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{adminCount}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Accounts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Telegram Linked</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{telegramCount}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View, create, manage roles, or suspend user accounts</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Input
              placeholder="Search by email or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Regular Users</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              <p>{error}</p>
              <Button onClick={fetchUsers} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No users found matching your search filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">User Email</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Authenticated</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Telegram</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Created At</th>
                    <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900">
                      <td className="p-3">
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {u.email}
                          {u.id === user.id && (
                            <Badge variant="info" className="text-[10px]">You</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{u.id}</div>
                      </td>
                      <td className="p-3">
                        {u.isAdmin ? (
                          <Badge variant="warning">ADMIN</Badge>
                        ) : (
                          <Badge variant="default">USER</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {u.authenticated ? (
                          <Badge variant="success">AUTHENTICATED</Badge>
                        ) : (
                          <Badge variant="warning">PENDING</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {u.status === 'suspended' ? (
                          <Badge variant="danger">SUSPENDED</Badge>
                        ) : (
                          <Badge variant="success">ACTIVE</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {u.telegramLinked ? (
                          <Badge variant="info">LINKED</Badge>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAuthenticated(u)}
                            disabled={u.id === user.id}
                            className={u.authenticated ? 'text-yellow-600' : 'text-green-600 font-semibold'}
                            title={u.authenticated ? 'Revoke authentication' : 'Authenticate user so they can receive emails and access full services'}
                          >
                            {u.authenticated ? 'Unauthenticate' : 'Authenticate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAdmin(u)}
                            disabled={u.id === user.id}
                            title={u.isAdmin ? 'Demote to regular user' : 'Promote to Admin'}
                          >
                            {u.isAdmin ? 'Demote' : 'Make Admin'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            disabled={u.id === user.id}
                            className={u.status === 'suspended' ? 'text-green-600' : 'text-yellow-600'}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === user.id}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Create a new account with optional admin privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                {addError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400" role="alert">
                    {addError}
                  </div>
                )}
                <Input
                  label="Email Address"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  disabled={addLoading}
                  autoFocus
                />
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="addIsAdmin"
                    checked={addIsAdmin}
                    onChange={(e) => setAddIsAdmin(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="addIsAdmin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grant Administrator Role
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                    disabled={addLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" loading={addLoading}>
                    Create User
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
