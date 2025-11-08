import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { adminStore, useAdminStore } from '../store/adminStore';
import type { Category } from '../store/admin';

const CategoriesPage: React.FC = () => {
  const { data, loading, error } = useAdminStore((state) => state.categories);
  const [filter, setFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && data.length === 0) {
      adminStore.loadCategories().catch((err) => {
        console.error('Failed to load categories', err);
      });
    }
  }, [data.length, loading]);

  const filteredCategories = useMemo(() => {
    if (!filter.trim()) {
      return data;
    }
    const term = filter.trim().toLowerCase();
    return data.filter((category) => category.name.toLowerCase().includes(term));
  }, [data, filter]);

  const rootCategories = filteredCategories.filter((category) => category.parent === null);
  const childrenMap = filteredCategories.reduce<Record<number, Category[]>>((acc, category) => {
    if (category.parent) {
      acc[category.parent] = acc[category.parent] ?? [];
      acc[category.parent].push(category);
    }
    return acc;
  }, {});

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }
    setIsCreating(true);
    try {
      await adminStore.createCategory({
        name: newCategoryName.trim(),
        is_active: true,
        parent: parentId,
      });
      setNewCategoryName('');
      setParentId(null);
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">Organize catalogue hierarchy and parent/child relationships.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter categories"
            className="w-64 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            onClick={() => {
              adminStore.loadCategories().catch((err) => {
                console.error('Failed to refresh categories', err);
              });
            }}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Create category</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="category-name" className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Name
            </label>
            <input
              id="category-name"
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="Category name"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="parent-category" className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Parent (optional)
            </label>
            <select
              id="parent-category"
              value={parentId ?? ''}
              onChange={(event) => setParentId(event.target.value ? Number(event.target.value) : null)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="">No parent</option>
              {rootCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-70"
            onClick={handleCreateCategory}
            disabled={isCreating || !newCategoryName.trim()}
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isCreating ? 'Creating…' : 'Create category'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Category hierarchy</h3>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {rootCategories.length === 0 && !loading ? (
            <p className="text-sm text-slate-500">No categories defined yet.</p>
          ) : (
            <ul className="space-y-3">
              {rootCategories.map((category) => (
                <li key={category.id} className="rounded-md border border-slate-200">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{category.name}</p>
                      <p className="text-xs text-slate-500">Slug: {category.slug}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {childrenMap[category.id]?.length ? (
                    <ul className="divide-y divide-slate-200">
                      {childrenMap[category.id].map((child) => (
                        <li key={child.id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{child.name}</p>
                            <p className="text-xs text-slate-500">Slug: {child.slug}</p>
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            {child.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No child categories</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;
