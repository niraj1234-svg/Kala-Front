import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/ToastProvider';
import { adminStore, useAdminStore } from '../store/adminStore';
import type { AdminProductPayload, Category, ProductDetail } from '../store/admin';

interface ProductFormValues {
  name: string;
  slug: string;
  sku: string;
  category: number | '';
  additionalCategories: number[];
  basePrice: string;
  comparePrice: string;
  badge: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
  attributesInput: string;
}

interface ProductFormModalProps {
  mode: 'create' | 'edit';
  open: boolean;
  productSlug?: string;
  onClose: () => void;
  onSuccess: (product: ProductDetail) => void;
}

const defaultValues: ProductFormValues = {
  name: '',
  slug: '',
  sku: '',
  category: '',
  additionalCategories: [],
  basePrice: '',
  comparePrice: '',
  badge: '',
  shortDescription: '',
  description: '',
  isActive: true,
  attributesInput: '',
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ mode, open, productSlug, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const categoriesSlice = useAdminStore((state) => state.categories);
  const productDetailSlice = useAdminStore((state) => state.productDetail);
  const [values, setValues] = useState<ProductFormValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingProduct: ProductDetail | null = useMemo(() => {
    if (mode !== 'edit') {
      return null;
    }
    if (productDetailSlice.data && productDetailSlice.data.slug === productSlug) {
      return productDetailSlice.data;
    }
    return null;
  }, [mode, productDetailSlice.data, productSlug]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!categoriesSlice.loading && categoriesSlice.data.length === 0) {
      adminStore.loadCategories().catch((error) => {
        console.error('Failed to load categories', error);
        addToast({
          variant: 'error',
          title: 'Unable to load categories',
          description: 'Please try again shortly.',
        });
      });
    }
  }, [addToast, categoriesSlice.data.length, categoriesSlice.loading, open]);

  useEffect(() => {
    if (!open || mode !== 'edit' || !productSlug) {
      return;
    }
    if (!productDetailSlice.loading && (!productDetailSlice.data || productDetailSlice.data.slug !== productSlug)) {
      adminStore.loadProductDetail(productSlug).catch((error) => {
        console.error('Failed to fetch product', error);
        addToast({
          variant: 'error',
          title: 'Unable to load product',
          description: 'Please try again shortly.',
        });
      });
    }
  }, [addToast, mode, open, productDetailSlice.data, productDetailSlice.loading, productSlug]);

  useEffect(() => {
    if (!open) {
      setValues(defaultValues);
      setIsSubmitting(false);
      return;
    }

    if (mode === 'create') {
      setValues(defaultValues);
      return;
    }

    if (editingProduct) {
      const matchedCategory = categoriesSlice.data.find((category) => category.name === editingProduct.category);
      const additionalCategoryIds = (editingProduct.additional_categories ?? []).map((category) => category.id);
      setValues({
        name: editingProduct.name ?? '',
        slug: editingProduct.slug ?? '',
        sku: editingProduct.sku ?? '',
        category: matchedCategory ? matchedCategory.id : '',
        additionalCategories: matchedCategory
          ? additionalCategoryIds.filter((id) => id !== matchedCategory.id)
          : additionalCategoryIds,
        basePrice: editingProduct.price ?? '',
        comparePrice: editingProduct.compare_at_price ?? '',
        badge: editingProduct.badge ?? '',
        shortDescription: editingProduct.short_description ?? '',
        description: editingProduct.description ?? '',
        isActive: editingProduct.in_stock ?? true,
        attributesInput: editingProduct.attributes ? JSON.stringify(editingProduct.attributes, null, 2) : '',
      });
    }
  }, [categoriesSlice.data, editingProduct, mode, open]);

  const formTitle = mode === 'create' ? 'Create product' : 'Edit product';
  const submitLabel = mode === 'create' ? 'Create product' : 'Save changes';

  const categories: Category[] = categoriesSlice.data;
  const primaryCategoryId = typeof values.category === 'number' ? values.category : null;
  const additionalCategoryOptions = useMemo(
    () => categories.filter((category) => category.id !== primaryCategoryId),
    [categories, primaryCategoryId],
  );

  const handleChange = (field: keyof ProductFormValues, value: string | number | boolean) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleAdditionalCategory = (categoryId: number) => {
    setValues((prev) => {
      const isSelected = prev.additionalCategories.includes(categoryId);
      return {
        ...prev,
        additionalCategories: isSelected
          ? prev.additionalCategories.filter((id) => id !== categoryId)
          : [...prev.additionalCategories, categoryId],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim() || !values.sku.trim() || !values.basePrice.trim() || !values.category) {
      addToast({
        variant: 'error',
        title: 'Missing information',
        description: 'Name, SKU, price, and category are required.',
      });
      return;
    }

    const primaryCategory = Number(values.category);
    const sanitizedAdditional = Array.from(
      new Set(values.additionalCategories.filter((id) => id !== primaryCategory)),
    );

    const attributesInput = values.attributesInput.trim();
    let attributesPayload: Record<string, unknown> | null = null;
    if (attributesInput) {
      try {
        const parsed = JSON.parse(attributesInput);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Attributes must be a JSON object');
        }
        attributesPayload = parsed as Record<string, unknown>;
      } catch (error) {
        console.error('Invalid attributes JSON', error);
        addToast({
          variant: 'error',
          title: 'Invalid attributes',
          description: 'Attributes must be valid JSON (object only).',
        });
        return;
      }
    }

    const payload: AdminProductPayload = {
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      sku: values.sku.trim(),
      category: primaryCategory,
      additional_categories: sanitizedAdditional,
      base_price: values.basePrice.trim(),
      compare_at_price: values.comparePrice.trim() || null,
      badge: values.badge.trim() || null,
      short_description: values.shortDescription.trim() || undefined,
      description: values.description.trim() || undefined,
      is_active: values.isActive,
      attributes: attributesInput ? attributesPayload : null,
    };
    setIsSubmitting(true);
    try {
      let product: ProductDetail;
      if (mode === 'create') {
        product = await adminStore.createProduct(payload);
        addToast({
          variant: 'success',
          title: 'Product created',
          description: `${product.name} has been added to the catalogue.`,
        });
      } else if (editingProduct) {
        product = await adminStore.updateProduct(editingProduct.slug, payload);
        addToast({
          variant: 'success',
          title: 'Product updated',
          description: `${product.name} has been updated successfully.`,
        });
      } else {
        throw new Error('Product unavailable for editing');
      }
      onSuccess(product);
      onClose();
    } catch (error) {
      console.error('Failed to save product', error);
      addToast({
        variant: 'error',
        title: 'Save failed',
        description: 'We could not save the product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingInitialData = mode === 'edit' && (!editingProduct || productDetailSlice.loading);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      title={formTitle}
      description={mode === 'create' ? 'Add a new product to your catalogue.' : 'Update product information.'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      }
    >
      {isLoadingInitialData ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing product details…
        </div>
      ) : (
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name *</span>
              <input
                type="text"
                value={values.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</span>
              <input
                type="text"
                value={values.slug}
                onChange={(event) => handleChange('slug', event.target.value)}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="auto-generated if left blank"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU *</span>
              <input
                type="text"
                value={values.sku}
                onChange={(event) => handleChange('sku', event.target.value)}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category *</span>
              <select
                value={values.category}
                onChange={(event) => {
                  const nextCategory = event.target.value ? Number(event.target.value) : '';
                  setValues((prev) => ({
                    ...prev,
                    category: nextCategory,
                    additionalCategories:
                      typeof nextCategory === 'number'
                        ? prev.additionalCategories.filter((id) => id !== nextCategory)
                        : prev.additionalCategories,
                  }));
                }}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Badge</span>
              <input
                type="text"
                value={values.badge}
                onChange={(event) => handleChange('badge', event.target.value)}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="New, Featured, etc."
              />
            </label>
          </div>

          <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Additional categories
              </span>
              <span className="text-xs text-slate-400">Optional — select more collections</span>
            </div>
            <div className="mt-3 space-y-2">
              {categoriesSlice.loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading categories…
                </div>
              ) : additionalCategoryOptions.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {additionalCategoryOptions.map((category) => (
                    <label key={category.id} className="flex items-start gap-3 rounded-md border border-slate-200 px-3 py-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={values.additionalCategories.includes(category.id)}
                        onChange={() => handleToggleAdditionalCategory(category.id)}
                      />
                      <span>
                        <span className="block font-medium text-slate-700">{category.name}</span>
                        {category.parent && (
                          <span className="text-xs text-slate-500">Parent ID: {category.parent}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No other categories available.</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base price *</span>
              <input
                type="text"
                value={values.basePrice}
                onChange={(event) => handleChange('basePrice', event.target.value)}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="e.g. 1299.00"
                required
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compare at price</span>
              <input
                type="text"
                value={values.comparePrice}
                onChange={(event) => handleChange('comparePrice', event.target.value)}
                className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="e.g. 1499.00"
              />
            </label>
            <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) => handleChange('isActive', event.target.checked)}
                className="h-4 w-4"
              />
              <span>Product is active</span>
            </label>
          </div>

          <label className="flex flex-col text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Short description</span>
            <input
              type="text"
              value={values.shortDescription}
              onChange={(event) => handleChange('shortDescription', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="Displayed in product list"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full description</span>
            <textarea
              value={values.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="mt-1 min-h-[120px] rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="Detailed description shown on product page"
            />
          </label>

          <div className="rounded-md border border-slate-200 p-4">
            <label className="flex flex-col text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attributes (JSON)</span>
              <textarea
                value={values.attributesInput}
                onChange={(event) => handleChange('attributesInput', event.target.value)}
                className="mt-1 min-h-[140px] rounded-md border border-slate-200 px-3 py-2 font-mono text-xs shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder='{"material": "Cotton", "fit": "Relaxed"}'
              />
              <span className="mt-2 text-xs text-slate-500">
                Provide a JSON object of key/value pairs for structured specs. Leave empty to clear attributes.
              </span>
            </label>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ProductFormModal;
