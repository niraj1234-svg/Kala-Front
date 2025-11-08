import { NavLink, Outlet } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { authStore, useAuthStore } from '../store/authStore';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Users', path: '/admin/users' },
];

const AdminLayout = () => {
  const authState = useAuthStore((state) => state);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center border-b border-slate-200 px-6 text-lg font-semibold">
            Appral Admin
          </div>
          <nav className="px-4 py-6">
            <ul className="space-y-2 text-sm font-medium text-slate-600">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-slate-100 ${
                        isActive ? 'bg-slate-900 text-white hover:bg-slate-900' : 'text-slate-600'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="flex flex-1 flex-col lg:ml-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-200 p-2 text-slate-600 shadow-sm hover:bg-slate-100 lg:hidden"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="hidden flex-col text-right leading-tight sm:flex">
                <span className="font-medium text-slate-900">{authState.user?.first_name ?? 'Admin'}</span>
                <span className="text-xs text-slate-500">{authState.user?.email ?? 'admin@appral'}</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                onClick={() => authStore.logout()}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
