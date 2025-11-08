import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { adminStore, useAdminStore } from '../store/adminStore';
import { useToast } from '../components/ui/ToastProvider';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { ProductVariant, ProductImage } from '../store/admin';
import ProductVariantModal from './ProductVariantModal';
import ProductImageModal from './ProductImageModal';

const ProductDetailConsolePage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: product, variants, images, loading, error } = useAdminStore((state) => state.productDetail);
  const { addToast } = useToast();
  const [variantModal, setVariantModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    variant?: ProductVariant;
  }>({ open: false, mode: 'create' });
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    image?: ProductImage;
  }>({ open: false, mode: 'create' });
  const [variantConfirm, setVariantConfirm] = useState<{ open: boolean; variant?: ProductVariant }>({ open: false });
  const [imageConfirm, setImageConfirm] = useState<{ open: boolean; image?: ProductImage }>({ open: false });
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  useEffect(() => {
    if (!slug) {
      return;
    }
    adminStore.loadProductDetail(slug).catch((err) => {
      console.error('Failed to load product detail', err);
    });
  }, [slug]);

  if (!slug) {
    return <p className="text-sm text-slate-500">No product selected.</p>;
  }

  const handleVariantDelete = async () => {
    if (!slug || !variantConfirm.variant) {
      return;
    }
    setIsDeletingVariant(true);
    try {
      await adminStore.deleteVariant(slug, variantConfirm.variant.id);
      addToast({
        variant: 'success',
        title: 'Variant deleted',
        description: `${variantConfirm.variant.sku} has been removed.`,
      });
    } catch (err) {
      console.error('Failed to delete variant', err);
      addToast({
        variant: 'error',
        title: 'Delete failed',
        description: 'We could not delete the variant. Please try again.',
      });
    } finally {
      setIsDeletingVariant(false);
      setVariantConfirm({ open: false });
    }
  };

  const handleImageDelete = async () => {
    if (!slug || !imageConfirm.image) {
      return;
    }
    setIsDeletingImage(true);
    try {
      await adminStore.deleteImage(slug, imageConfirm.image.id);
      addToast({
        variant: 'success',
        title: 'Image deleted',
        description: 'Product image has been removed.',
      });
    } catch (err) {
      console.error('Failed to delete image', err);
      addToast({
        variant: 'error',
        title: 'Delete failed',
        description: 'We could not delete the image. Please try again.',
      });
    } finally {
      setIsDeletingImage(false);
      setImageConfirm({ open: false });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Product detail</h2>
          <p className="text-sm text-slate-500">Inspect metadata, variants, and gallery for this product.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          onClick={() => {
            adminStore.loadProductDetail(slug).catch((err) => {
              console.error('Failed to refresh product detail', err);
            });
          }}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading product information…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {product ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Overview</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-slate-700">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Name</dt>
                  <dd className="mt-1 font-medium text-slate-900">{product.name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">SKU</dt>
                  <dd className="mt-1 font-medium text-slate-900">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Category</dt>
                  <dd className="mt-1">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Price</dt>
                  <dd className="mt-1 font-medium text-slate-900">₹{product.price}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {product.in_stock ? 'In stock' : 'Out of stock'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Badge</dt>
                  <dd className="mt-1">{product.badge ?? '—'}</dd>
                </div>
              </dl>
              {product.short_description && (
                <div className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Short description</h4>
                  <p className="mt-1 text-sm text-slate-600">{product.short_description}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Variants</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  onClick={() => setVariantModal({ open: true, mode: 'create' })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add variant
                </button>
              </div>
              {variants.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {variants.map((variant: ProductVariant) => (
                    <li key={variant.id} className="rounded-md border border-slate-200 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">SKU: {variant.sku}</span>
                          <span className="text-xs text-slate-500">
                            {variant.size ? `Size: ${variant.size}` : ''}
                            {variant.color_name ? ` | Color: ${variant.color_name}` : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="font-semibold text-slate-900">Stock: {variant.stock}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              variant.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {variant.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                              onClick={() => setVariantModal({ open: true, mode: 'edit', variant })}
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              onClick={() => setVariantConfirm({ open: true, variant })}
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No variants configured.</p>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Media</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  onClick={() => setImageModal({ open: true, mode: 'create' })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add image
                </button>
              </div>
              {images.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {images.map((image: ProductImage) => (
                    <li key={image.id} className="overflow-hidden rounded-md border border-slate-200">
                      <img
                        src={image.image_url ?? ''}
                        alt={image.alt_text ?? product.name}
                        className="h-28 w-full object-cover"
                        onError={(event) => {
                          (event.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                      <div className="px-3 py-2 space-y-2 text-xs text-slate-500">
                        <div>
                          <p>{image.alt_text ?? 'No alt text'}</p>
                          {image.is_primary && <p className="font-semibold text-slate-700">Primary</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                            onClick={() => setImageModal({ open: true, mode: 'edit', image })}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            onClick={() => setImageConfirm({ open: true, image })}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No images uploaded.</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Metadata</h3>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <dt>Created</dt>
                  <dd>{product.created_at ? new Date(product.created_at).toLocaleString() : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Updated</dt>
                  <dd>{product.updated_at ? new Date(product.updated_at).toLocaleString() : '—'}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      ) : (
        !loading && <p className="text-sm text-slate-500">Product information unavailable.</p>
      )}

      <ProductVariantModal
        open={variantModal.open}
        mode={variantModal.mode}
        slug={slug}
        variant={variantModal.variant}
        onClose={() => setVariantModal({ open: false, mode: 'create' })}
        onSuccess={() => {
          /* state already synced through adminStore */
        }}
      />

      <ProductImageModal
        open={imageModal.open}
        mode={imageModal.mode}
        slug={slug}
        image={imageModal.image}
        onClose={() => setImageModal({ open: false, mode: 'create' })}
        onSuccess={() => {
          /* state already synced through adminStore */
        }}
      />

      <ConfirmDialog
        open={variantConfirm.open}
        title="Delete variant"
        description={`Are you sure you want to delete ${variantConfirm.variant?.sku ?? 'this variant'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setVariantConfirm({ open: false })}
        onConfirm={handleVariantDelete}
        loading={isDeletingVariant}
      />

      <ConfirmDialog
        open={imageConfirm.open}
        title="Delete image"
        description="Are you sure you want to delete this product image? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setImageConfirm({ open: false })}
        onConfirm={handleImageDelete}
        loading={isDeletingImage}
      />
    </div>
  );
};

export default ProductDetailConsolePage;
