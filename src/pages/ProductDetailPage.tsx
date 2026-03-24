import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { appralStore, useAppralStore } from '../store/appralStore';
import type { ProductVariant } from '../store/appral';
import { useAuthStore } from '../store/authStore';

const FALLBACK_IMAGE = '/placeholder-product.png';

const formatCurrency = (value: number | string | null | undefined): string => {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  }).format(numeric);
};

const describeVariant = (variant: ProductVariant): string => {
  const parts = [variant.size, variant.color_name].filter(Boolean) as string[];
  return parts.join(' • ') || variant.sku;
};

const ProductDetailPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authState = useAuthStore((state) => state);
  const productDetail = useAppralStore((state) => state.productDetail);
  const wishlistState = useAppralStore((state) => state.wishlist);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/products');
      return;
    }
    appralStore
      .fetchProductDetail(slug)
      .catch((error) => {
        console.error('Failed to load product detail', error);
        navigate('/products');
      });
  }, [navigate, slug]);

  useEffect(() => {
    if (!authState.isAuthenticated || wishlistState.loading || wishlistState.data.length > 0) {
      return;
    }
    appralStore.fetchWishlist().catch((error) => {
      console.error('Failed to fetch wishlist', error);
    });
  }, [authState.isAuthenticated, wishlistState.data.length, wishlistState.loading]);

  const product = productDetail.data;
  const variants = product?.variants ?? [];

  useEffect(() => {
    if (!product) {
      setSelectedVariantId(null);
      setSelectedImageIndex(0);
      setQuantity(1);
      return;
    }
    const preferred = variants.find((variant) => variant.is_active && variant.stock > 0) ?? variants[0] ?? null;
    setSelectedVariantId(preferred?.id ?? null);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product, variants]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [FALLBACK_IMAGE];
    }
    const images = [product.primary_image?.image_url, ...(product.images ?? []).map((image) => image.image_url)]
      .filter(Boolean) as string[];
    if (images.length === 0) {
      return [FALLBACK_IMAGE];
    }
    return Array.from(new Set(images));
  }, [product]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants],
  );

  const isWishlisted = useMemo(() => {
    if (!product) {
      return false;
    }
    return wishlistState.data.some((item) => item.product.id === product.id);
  }, [product, wishlistState.data]);

  const productPrice = formatCurrency(selectedVariant?.price_override ?? product?.price ?? 0);
  const compareAtPrice = product?.compare_at_price ? formatCurrency(product.compare_at_price) : null;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : product?.in_stock ?? false;

  const changeVariant = (variant: ProductVariant) => {
    if (!variant.is_active || variant.stock <= 0 || addingToCart) {
      return;
    }
    setSelectedVariantId(variant.id);
  };

  const changeQuantity = (next: number) => {
    if (!product) {
      return;
    }
    const max = selectedVariant?.stock ?? product.total_stock ?? 1;
    setQuantity(Math.max(1, Math.min(next, max)));
  };

  const addToCart = async () => {
    if (!product || !selectedVariant) {
      alert('Please select an available option before continuing.');
      return;
    }
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.slug}` } });
      return;
    }
    setAddingToCart(true);
    try {
      await appralStore.addCartItem({
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity,
      });
      const shouldRedirect = window.confirm(`${product.name} has been added to your cart. View cart now?`);
      if (shouldRedirect) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Unable to add to cart', error);
      alert('Something went wrong while adding this product to your cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) {
      return;
    }
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.slug}` } });
      return;
    }
    setUpdatingWishlist(true);
    try {
      if (isWishlisted) {
        const current = wishlistState.data.find((item) => item.product.id === product.id);
        if (current) {
          await appralStore.removeFromWishlist(current.id);
        }
      } else {
        await appralStore.addToWishlist({
          product_id: product.id,
          variant_id: selectedVariant?.id ?? null,
        });
      }
      await appralStore.fetchWishlist();
    } catch (error) {
      console.error('Unable to update wishlist', error);
      alert('Unable to update your wishlist right now. Please try again.');
    } finally {
      setUpdatingWishlist(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {productDetail.loading ? (
          <p className="text-gray-500">Loading product…</p>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-500">We couldn’t find that product.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900 transition"
            >
              Browse products
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-4">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-black">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden group">
              <img
                src={galleryImages[selectedImageIndex] ?? FALLBACK_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(event) => {
                  (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((current) => (current + 1) % galleryImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-black' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.short_description && (
                <p className="text-base text-gray-600">{product.short_description}</p>
              )}
            </div>

            <div className="flex items-baseline gap-3 pb-5 border-b border-gray-200">
              <span className="text-2xl font-bold text-gray-900">{productPrice}</span>
              {compareAtPrice && (
                <span className="text-lg text-gray-400 line-through">{compareAtPrice}</span>
              )}
            </div>

            <div className="pb-5 border-b border-gray-200">
              {isInStock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">In stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium">Currently unavailable</span>
                </div>
              )}
            </div>

            {variants.length > 0 && (
              <div className="space-y-3 pb-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Select an option</h3>
                  {selectedVariant && (
                    <span className="text-xs text-gray-500">SKU: {selectedVariant.sku}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {variants.map((variant) => {
                    const disabled = !variant.is_active || variant.stock <= 0;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => changeVariant(variant)}
                        disabled={disabled || addingToCart}
                        className={`px-4 py-2 text-sm border rounded transition-all text-left ${
                          selectedVariantId === variant.id ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-300 hover:border-black'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="block font-medium">{describeVariant(variant)}</span>
                        <span className="block text-xs text-gray-500 mt-1">
                          {disabled ? 'Unavailable' : `${variant.stock} in stock`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-sm font-semibold mb-3">Quantity</h3>
              <div className="flex items-center border border-gray-300 rounded-md w-32 overflow-hidden">
                <button
                  onClick={() => changeQuantity(quantity - 1)}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity <= 1 || addingToCart}
                >
                  -
                </button>
                <span className="w-12 text-center text-gray-700">{quantity}</span>
                <button
                  onClick={() => changeQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  disabled={addingToCart}
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={addToCart}
                disabled={!isInStock || addingToCart}
                className={`w-full py-4 px-8 font-semibold text-base rounded transition-colors ${
                  isInStock ? 'bg-gray-900 text-white hover:bg-black disabled:bg-gray-700' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {addingToCart ? 'Adding…' : isInStock ? 'Add to cart' : 'Sold out'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleWishlist}
                  disabled={updatingWishlist}
                  className="flex-1 border border-gray-300 py-3 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm font-medium">{updatingWishlist ? 'Updating…' : isWishlisted ? 'In wishlist' : 'Wishlist'}</span>
                </button>
                <button className="border border-gray-300 p-3 rounded hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {product.description && (
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-2">Product description</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.attributes && typeof product.attributes === 'object' && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key}>
                      <dt className="font-medium capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-gray-600">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {product.related_products.length > 0 && (
          <section className="mt-16 pt-16 border-t">
            <h2 className="text-2xl font-bold mb-8 uppercase tracking-wider">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.related_products.map((related) => (
                <Link key={related.id} to={`/products/${related.slug}`} className="group">
                  <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                    <img
                      src={related.primary_image?.image_url ?? FALLBACK_IMAGE}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <h3 className="text-sm font-medium mb-1 group-hover:text-gray-600 transition-colors">{related.name}</h3>
                  <p className="text-sm font-semibold">{formatCurrency(related.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;