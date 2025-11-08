import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { adminStore, useAdminStore } from '../store/adminStore';
import type { AdminUser } from '../store/admin';

const ROLE_OPTIONS = ['admin', 'manager', 'editor', 'support'];

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);
  const usersSlice = useAdminStore((state) => state.users);
  const selectedUserSlice = useAdminStore((state) => state.selectedUser);
  const userFromList = useMemo(() => usersSlice.data.find((user) => user.id === numericId), [numericId, usersSlice.data]);
  const user: AdminUser | null = selectedUserSlice.data ?? userFromList ?? null;
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    role: 'support',
    isActive: true,
    isStaff: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      return;
    }
    if (!selectedUserSlice.loading && (!selectedUserSlice.data || selectedUserSlice.data.id !== numericId)) {
      adminStore.loadUser(numericId).catch((err) => {
        console.error('Failed to load admin user', err);
      });
    }
  }, [numericId, selectedUserSlice.data, selectedUserSlice.loading]);

  useEffect(() => {
    if (user) {
      setFormValues({
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        role: user.role ?? 'support',
        isActive: user.is_active,
        isStaff: user.is_staff,
      });
    }
  }, [user]);

  if (!Number.isFinite(numericId)) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to users
        </button>
        <p className="text-sm text-red-600">Invalid user id.</p>
      </div>
    );
  }

  const handleChange = (field: keyof typeof formValues, value: string | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setIsSaving(true);
    try {
      await adminStore.updateUser(user.id, {
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        role: formValues.role,
        is_active: formValues.isActive,
        is_staff: formValues.isStaff,
      });
    } catch (err) {
      console.error('Failed to update admin user', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to users
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          onClick={() => {
            adminStore.loadUser(numericId).catch((err) => {
              console.error('Failed to refresh user', err);
            });
          }}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">User profile</h2>
            <p className="text-sm text-slate-500">Edit account information, permissions, and status.</p>
          </div>
          {selectedUserSlice.loading && (
            <span className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </span>
          )}
        </div>

        {selectedUserSlice.error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {selectedUserSlice.error}
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">First name</span>
                <input
                  type="text"
                  value={formValues.firstName}
                  onChange={(event) => handleChange('firstName', event.target.value)}
                  className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder="First name"
                />
              </label>
              <label className="flex flex-col text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last name</span>
                <input
                  type="text"
                  value={formValues.lastName}
                  onChange={(event) => handleChange('lastName', event.target.value)}
                  className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Last name"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
                <select
                  value={formValues.role}
                  onChange={(event) => handleChange('role', event.target.value)}
                  className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-3 rounded-md border border-slate-200 px-3 py-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formValues.isActive}
                    onChange={(event) => handleChange('isActive', event.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Account active</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formValues.isStaff}
                    onChange={(event) => handleChange('isStaff', event.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Staff permissions</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-70"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 text-sm text-slate-500">User information unavailable.</div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
