import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, RefreshCw, Search, Trash2, Edit3 } from 'lucide-react';
import { adminStore, useAdminStore } from '../store/adminStore';
import { getProductCategoryLabel } from '../store/admin';
import { useToast } from '../components/ui/ToastProvider';
import ProductFormModal from './ProductFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const ProductsListPage: React.FC = () => {
  const { data, loading, error } = useAdminStore((state) => state.products);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; open: boolean; slug?: string }>({
    mode: 'create',
    open: false,
  });
  const [confirmState, setConfirmState] = useState<{ open: boolean; slug?: string; name?: string }>({
    open: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && data.length === 0) {
      adminStore.loadProducts().catch((err) => {
        console.error('Failed to load products', err);
      });
    }
  }, [data.length, loading]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return data;
    }
    const term = search.trim().toLowerCase();
    return data.filter((product) => {
      const categoryLabel = getProductCategoryLabel(product.category);
      return [product.name, product.sku, categoryLabel].some((value) =>
        value?.toLowerCase().includes(term),
      );
    });
  }, [data, search]);

  const renderCategory = (product: typeof data[number]): string => getProductCategoryLabel(product.category);

  const openCreateModal = () => {
    setModalState({ mode: 'create', open: true });
  };

  const openEditModal = (slug: string) => {
    setModalState({ mode: 'edit', open: true, slug });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  const handleProductSaved = () => {
    adminStore.loadProducts().catch((err) => {
      console.error('Failed to refresh products', err);
    });
  };

  const askDelete = (slug: string, name: string) => {
    setConfirmState({ open: true, slug, name });
  };

  const closeConfirm = () => setConfirmState({ open: false });

  const handleDelete = async () => {
    if (!confirmState.slug) {
      return;
    }
    setIsDeleting(true);
    try {
      await adminStore.deleteProduct(confirmState.slug);
      addToast({
        variant: 'success',
        title: 'Product deleted',
        description: `${confirmState.name ?? 'Product'} has been removed.`,
      });
      await adminStore.loadProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      addToast({
        variant: 'error',
        title: 'Delete failed',
        description: 'Something went wrong while removing the product.',
      });
    } finally {
      setIsDeleting(false);
      closeConfirm();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">Manage catalogue inventory, pricing, and visibility.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-64 rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            onClick={() => {
              adminStore.loadProducts().catch((err) => {
                console.error('Failed to refresh products', err);
              });
            }}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                  {search ? 'No products match your search.' : 'No products found.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      {product.short_description && (
                        <span className="text-xs text-slate-500">{product.short_description}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{product.sku}</td>
                  <td className="px-5 py-4 text-slate-600">{renderCategory(product)}</td>
                  <td className="px-5 py-4 text-right font-medium text-slate-800">₹{product.price}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {product.in_stock ? 'In stock' : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        onClick={() => openEditModal(product.slug)}
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <Link
                        to={`/admin/products/${product.slug}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        Details
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        onClick={() => askDelete(product.slug, product.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        mode={modalState.mode}
        open={modalState.open}
        productSlug={modalState.slug}
        onClose={closeModal}
        onSuccess={handleProductSaved}
      />

      <ConfirmDialog
        open={confirmState.open}
        title="Delete product"
        description={`Are you sure you want to delete ${confirmState.name ?? 'this product'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={closeConfirm}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default ProductsListPage;
