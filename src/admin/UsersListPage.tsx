import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { adminStore, useAdminStore } from '../store/adminStore';

const UsersListPage: React.FC = () => {
  const { data, loading, error } = useAdminStore((state) => state.users);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!loading && data.length === 0) {
      adminStore.loadUsers().catch((err) => {
        console.error('Failed to load admin users', err);
      });
    }
  }, [data.length, loading]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((user) => {
      const matchesSearch = !term
        ? true
        : [user.email, user.first_name, user.last_name].some((value) =>
            value?.toLowerCase().includes(term),
          );
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [data, roleFilter, search]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    data.forEach((user) => {
      if (user.role) {
        roles.add(user.role);
      }
    });
    return Array.from(roles).sort();
  }, [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Admin users</h2>
          <p className="text-sm text-slate-500">Manage staff accounts, permissions, and activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users"
              className="w-56 rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="all">All roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role || 'Unknown'}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            onClick={() => {
              adminStore.loadUsers().catch((err) => {
                console.error('Failed to refresh users', err);
              });
            }}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Last login</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-sm text-slate-500">
                  {search || roleFilter !== 'all' ? 'No users match your filters.' : 'No admin users found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {`${user.first_name} ${user.last_name}`.trim() || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 text-slate-600">{user.role || '—'}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.is_staff ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {user.is_staff ? 'Staff' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      View profile
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersListPage;
