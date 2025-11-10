import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { adminStore, useAdminStore } from '../store/adminStore';
import { getProductCategoryLabel } from '../store/admin';
import type { ProductListItem, AdminUser } from '../store/admin';

type MetricKey = 'total_users' | 'total_products' | 'total_categories' | 'total_carts' | 'total_stock';

const METRIC_CONFIG: { key: MetricKey; label: string }[] = [
  { key: 'total_users', label: 'Users' },
  { key: 'total_products', label: 'Products' },
  { key: 'total_categories', label: 'Categories' },
  { key: 'total_carts', label: 'Active Carts' },
  { key: 'total_stock', label: 'Units in Stock' },
];

const DashboardOverviewPage: React.FC = () => {
  const { loading: isLoading, data: summary, error } = useAdminStore((state) => state.dashboard);

  useEffect(() => {
    if (!summary && !isLoading) {
      adminStore
        .loadDashboard()
        .catch((err) => {
          console.error('Failed to load admin dashboard', err);
        });
    }
  }, [isLoading, summary]);

  const recentProducts = (summary?.recent_products ?? []) as ProductListItem[];
  const recentUsers = (summary?.recent_users ?? []) as AdminUser[];
  const productsPerCategory = summary?.products_per_category ?? [];
  const maxCategoryCount = productsPerCategory.reduce((max, item) => Math.max(max, item.count), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of store performance and activity</p>
        </div>
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Key metrics</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {METRIC_CONFIG.map(({ key, label }) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {summary ? summary[key] : '—'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Recent products</h3>
            <button
              type="button"
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
              onClick={() => {
                adminStore.refreshRecentProducts().catch((err) => {
                  console.error('Failed to refresh recent products', err);
                });
              }}
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 overflow-auto rounded-md border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.slice(0, 6).map((product) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-700">{product.name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {getProductCategoryLabel(product.category)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">₹{product.price}</td>
                  </tr>
                ))}
                {recentProducts.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={3}>
                      No recent products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recent users</h3>
          <div className="mt-4 overflow-auto rounded-md border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 hidden md:table-cell">Role</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.slice(0, 6).map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      <div className="flex flex-col">
                        <span>{`${user.first_name} ${user.last_name}`.trim() || user.email}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{user.role}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={3}>
                      No recent users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Products per category</h3>
          <p className="text-xs text-slate-500">Top categories by number of products</p>
        </div>
        <div className="mt-4 space-y-3">
          {productsPerCategory.length > 0 ? (
            productsPerCategory.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{item.name}</span>
                  <span>{item.count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{
                      width: `${Math.max(4, maxCategoryCount ? (item.count / maxCategoryCount) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">No category data available</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardOverviewPage;
