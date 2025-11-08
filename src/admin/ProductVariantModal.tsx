import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/ToastProvider';
import { adminStore } from '../store/adminStore';
import type { ProductVariant } from '../store/admin';

interface VariantFormValues {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  priceOverride: string;
  stock: string;
  isActive: boolean;
  additionalAttributes: string;
}

interface ProductVariantModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  slug: string;
  variant?: ProductVariant;
  onClose: () => void;
  onSuccess: (variant: ProductVariant) => void;
}

const defaultValues: VariantFormValues = {
  sku: '',
  size: '',
  colorName: '',
  colorHex: '',
  priceOverride: '',
  stock: '0',
  isActive: true,
  additionalAttributes: '',
};

const ProductVariantModal: React.FC<ProductVariantModalProps> = ({ open, mode, slug, variant, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [values, setValues] = useState<VariantFormValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(defaultValues);
      setIsSubmitting(false);
      return;
    }

    if (mode === 'create' || !variant) {
      setValues(defaultValues);
      return;
    }

    setValues({
      sku: variant.sku ?? '',
      size: variant.size ?? '',
      colorName: variant.color_name ?? '',
      colorHex: variant.color_hex ?? '',
      priceOverride: variant.price_override ?? '',
      stock: String(variant.stock ?? 0),
      isActive: variant.is_active,
      additionalAttributes: variant.additional_attributes
        ? JSON.stringify(variant.additional_attributes, null, 2)
        : '',
    });
  }, [open, mode, variant]);

  const handleChange = (field: keyof VariantFormValues, value: string | boolean) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slug) {
      return;
    }

    if (!values.sku.trim()) {
      addToast({
        variant: 'error',
        title: 'SKU required',
        description: 'Please provide a unique SKU for this variant.',
      });
      return;
    }

    const stockNumber = Number(values.stock);
    if (Number.isNaN(stockNumber) || stockNumber < 0) {
      addToast({
        variant: 'error',
        title: 'Invalid stock',
        description: 'Stock must be a non-negative number.',
      });
      return;
    }

    let parsedAttributes: Record<string, unknown> | null = null;
    if (values.additionalAttributes.trim()) {
      try {
        parsedAttributes = JSON.parse(values.additionalAttributes);
      } catch (error) {
        console.error('Invalid JSON string for additional attributes', error);
        addToast({
          variant: 'error',
          title: 'Invalid attributes',
          description: 'Additional attributes must be valid JSON.',
        });
        return;
      }
    }

    const payload = {
      sku: values.sku.trim(),
      size: values.size.trim() || null,
      color_name: values.colorName.trim() || null,
      color_hex: values.colorHex.trim() || null,
      price_override: values.priceOverride.trim() || null,
      stock: stockNumber,
      is_active: values.isActive,
      additional_attributes: parsedAttributes,
    };

    setIsSubmitting(true);
    try {
      let saved: ProductVariant;
      if (mode === 'create') {
        saved = await adminStore.createVariant(slug, payload);
        addToast({
          variant: 'success',
          title: 'Variant created',
          description: `${saved.sku} has been added.`,
        });
      } else if (variant) {
        saved = await adminStore.updateVariant(slug, variant.id, payload);
        addToast({
          variant: 'success',
          title: 'Variant updated',
          description: `${saved.sku} has been updated.`,
        });
      } else {
        throw new Error('Variant missing');
      }
      onSuccess(saved);
      onClose();
    } catch (error) {
      console.error('Failed to save variant', error);
      addToast({
        variant: 'error',
        title: 'Variant error',
        description: 'Unable to save variant. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      title={mode === 'create' ? 'Add variant' : 'Edit variant'}
      description={mode === 'create' ? 'Create a new product variant.' : 'Update this product variant.'}
      size="md"
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
            form="variant-form"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create variant' : 'Save changes'}
          </button>
        </div>
      }
    >
      <form id="variant-form" onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-600">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU *</span>
            <input
              type="text"
              value={values.sku}
              onChange={(event) => handleChange('sku', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              required
            />
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Size</span>
            <input
              type="text"
              value={values.size}
              onChange={(event) => handleChange('size', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="e.g. M, L"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Color name</span>
            <input
              type="text"
              value={values.colorName}
              onChange={(event) => handleChange('colorName', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="e.g. Midnight Blue"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Color hex</span>
            <input
              type="text"
              value={values.colorHex}
              onChange={(event) => handleChange('colorHex', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="#000000"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price override</span>
            <input
              type="text"
              value={values.priceOverride}
              onChange={(event) => handleChange('priceOverride', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="Override base price"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock *</span>
            <input
              type="number"
              min="0"
              value={values.stock}
              onChange={(event) => handleChange('stock', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              required
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => handleChange('isActive', event.target.checked)}
            className="h-4 w-4"
          />
          <span>Variant is active</span>
        </label>

        <label className="flex flex-col text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Additional attributes (JSON)</span>
          <textarea
            value={values.additionalAttributes}
            onChange={(event) => handleChange('additionalAttributes', event.target.value)}
            className="mt-1 min-h-[120px] rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder='{"material": "cotton"}'
          />
        </label>
      </form>
    </Modal>
  );
};

export default ProductVariantModal;
