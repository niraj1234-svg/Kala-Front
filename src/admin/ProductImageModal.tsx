import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/ToastProvider';
import { adminStore } from '../store/adminStore';
import type { ProductImage, ProductImagePayload } from '../store/admin';

interface ProductImageModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  slug: string;
  image?: ProductImage;
  onClose: () => void;
  onSuccess: (image: ProductImage) => void;
}

interface ImageFormValues {
  file: File | null;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: string;
}

const defaultValues: ImageFormValues = {
  file: null,
  imageUrl: '',
  altText: '',
  isPrimary: false,
  displayOrder: '',
};

const ProductImageModal: React.FC<ProductImageModalProps> = ({ open, mode, slug, image, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [values, setValues] = useState<ImageFormValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(defaultValues);
      setIsSubmitting(false);
      return;
    }

    if (mode === 'edit' && image) {
      setValues({
        file: null,
        imageUrl: image.image_url ?? '',
        altText: image.alt_text ?? '',
        isPrimary: image.is_primary,
        displayOrder: image.display_order !== null && image.display_order !== undefined ? String(image.display_order) : '',
      });
    } else {
      setValues(defaultValues);
    }
  }, [image, mode, open]);

  const handleChange = (field: keyof ImageFormValues, value: string | boolean | File | null) => {
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

    if (!values.file && !values.imageUrl.trim()) {
      addToast({
        variant: 'error',
        title: 'Image required',
        description: 'Provide either an image file or a hosted image URL.',
      });
      return;
    }

    const displayOrderNumber = values.displayOrder.trim() ? Number(values.displayOrder) : null;
    if (values.displayOrder.trim() && Number.isNaN(displayOrderNumber)) {
      addToast({
        variant: 'error',
        title: 'Invalid order',
        description: 'Display order must be a number.',
      });
      return;
    }

    const payload: ProductImagePayload = {
      image: values.file,
      image_url: values.imageUrl.trim() || undefined,
      alt_text: values.altText.trim() || undefined,
      is_primary: values.isPrimary,
      display_order: displayOrderNumber,
    };

    setIsSubmitting(true);
    try {
      let saved: ProductImage;
      if (mode === 'create') {
        saved = await adminStore.createImage(slug, payload);
        addToast({
          variant: 'success',
          title: 'Image added',
          description: 'Product image has been uploaded.',
        });
      } else if (image) {
        saved = await adminStore.updateImage(slug, image.id, payload);
        addToast({
          variant: 'success',
          title: 'Image updated',
          description: 'Product image has been updated.',
        });
      } else {
        throw new Error('Image missing');
      }
      onSuccess(saved);
      onClose();
    } catch (error) {
      console.error('Failed to save product image', error);
      addToast({
        variant: 'error',
        title: 'Image error',
        description: 'Unable to save image. Please try again.',
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
      title={mode === 'create' ? 'Add image' : 'Edit image'}
      description={mode === 'create' ? 'Upload a new product image.' : 'Update details for this product image.'}
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
            form="image-form"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Add image' : 'Save changes'}
          </button>
        </div>
      }
    >
      <form id="image-form" onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-600">
        <label className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image file</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleChange('file', event.target.files?.[0] ?? null)}
            className="mt-1 text-sm"
          />
          <span className="mt-1 text-xs text-slate-500">Upload a new image. Overrides the URL if both are provided.</span>
        </label>

        <label className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image URL</span>
          <input
            type="url"
            value={values.imageUrl}
            onChange={(event) => handleChange('imageUrl', event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="https://..."
          />
        </label>

        <label className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alt text</span>
          <input
            type="text"
            value={values.altText}
            onChange={(event) => handleChange('altText', event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Describe the image for accessibility"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={values.isPrimary}
              onChange={(event) => handleChange('isPrimary', event.target.checked)}
              className="h-4 w-4"
            />
            <span>Primary image</span>
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Display order</span>
            <input
              type="number"
              min="0"
              value={values.displayOrder}
              onChange={(event) => handleChange('displayOrder', event.target.value)}
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="Optional order"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default ProductImageModal;
