import { useEffect, useMemo, useState } from 'react';
import { Heart, Share2, ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { appralStore, useAppralStore } from '../store/appralStore';
import type { ProductVariant } from '../store/appral';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import OptimizedImage from '../components/hustle-hour/OptimizedImage';

const FALLBACK_IMAGE = '/placeholder-product.png';
const PRODUCT_IMAGES = [
  '/1.jpeg', '/2.jpeg', '/3.jpeg', '/4.jpeg', '/5.jpeg', '/6.jpeg',
  '/7.jpeg', '/8.jpeg', '/9.jpeg', '/10.jpeg', '/11.jpeg', '/12.jpeg'
];

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
      setQuantity(1);
      return;
    }
    const preferred = variants.find((variant) => variant.is_active && variant.stock > 0) ?? variants[0] ?? null;
    setSelectedVariantId(preferred?.id ?? null);
    setQuantity(1);
  }, [product, variants]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [FALLBACK_IMAGE];
    }
    const images = [product.primary_image?.image_url, ...(product.images ?? []).map((image) => image.image_url)]
      .filter(Boolean) as string[];

    // Add some premium fallbacks if only one image or placeholder
    if (images.length <= 1 || images[0]?.includes('placeholder')) {
      const idx = Math.abs(product.id) % PRODUCT_IMAGES.length;
      return [PRODUCT_IMAGES[idx], PRODUCT_IMAGES[(idx + 1) % PRODUCT_IMAGES.length]];
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
      navigate('/cart');
    } catch (error) {
      console.error('Unable to add to cart', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (!authState.isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.slug}` } });
      return;
    }
    setUpdatingWishlist(true);
    try {
      if (isWishlisted) {
        const current = wishlistState.data.find((item) => item.product.id === product.id);
        if (current) await appralStore.removeFromWishlist(current.id);
      } else {
        await appralStore.addToWishlist({
          product_id: product.id,
          variant_id: selectedVariant?.id ?? null,
        });
      }
      await appralStore.fetchWishlist();
    } catch (error) {
    } finally {
      setUpdatingWishlist(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        {productDetail.loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-foreground/40">Tracking Entity...</p>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <h1 className="font-display text-4xl uppercase">Entity Not Found</h1>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 font-body text-[10px] tracking-[0.4em] uppercase text-accent hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Archive
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-32 lg:pt-40 relative overflow-x-hidden">
      {/* Grain Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Breadcrumbs */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12 sm:mb-20 font-body text-[9px] tracking-[0.3em] uppercase text-foreground/40"
        >
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-accent transition-colors">The Archive</Link>
          <span>/</span>
          <span className="text-foreground font-bold">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={image + index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={cn(
                      "relative aspect-[3/4] bg-foreground/5 overflow-hidden group border border-foreground/5",
                      index === 0 && "md:col-span-2 aspect-[4/3] md:aspect-[16/9]"
                    )}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`${product.name} - ${index}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="space-y-12">
              {/* Product Header */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-accent" />
                  <span className="text-[10px] font-body tracking-[0.4em] uppercase text-accent font-bold">Artifact-0{product.id}</span>
                </div>

                <h1 className="font-display text-5xl md:text-6xl xl:text-7xl tracking-tighter leading-[0.85] uppercase">
                  {product.name}
                </h1>

                {product.short_description && (
                  <p className="font-body text-xs tracking-[0.1em] uppercase text-foreground/60 leading-relaxed max-w-sm">
                    {product.short_description}
                  </p>
                )}

                <div className="flex items-baseline gap-4 pt-4">
                  <span className="font-display text-4xl text-foreground">{productPrice}</span>
                  {compareAtPrice && (
                    <span className="font-body text-sm text-foreground/30 line-through tracking-widest">{compareAtPrice}</span>
                  )}
                </div>
              </motion.div>

              {/* Status & Options */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-10"
              >
                {variants.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
                      <h3 className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/40 font-bold">Configuration</h3>
                      {selectedVariant && (
                        <span className="font-body text-[9px] tracking-[0.2em] text-accent/60">ID: {selectedVariant.sku}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {variants.map((variant) => {
                        const disabled = !variant.is_active || variant.stock <= 0;
                        const active = selectedVariantId === variant.id;

                        return (
                          <button
                            key={variant.id}
                            onClick={() => !disabled && setSelectedVariantId(variant.id)}
                            className={cn(
                              "relative px-4 py-4 border transition-all text-left group overflow-hidden",
                              active
                                ? "bg-foreground border-foreground"
                                : "bg-transparent border-foreground/10 hover:border-foreground/30",
                              disabled && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            <span className={cn(
                              "block font-body text-[10px] tracking-[0.2em] uppercase transition-colors relative z-10",
                              active ? "text-background" : "text-foreground"
                            )}>
                              {describeVariant(variant)}
                            </span>
                            {active && (
                              <motion.div
                                layoutId="variantActive"
                                className="absolute inset-0 bg-foreground"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-6">
                  <h3 className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/40 font-bold border-b border-foreground/5 pb-2">Scale</h3>
                  <div className="flex items-center gap-8">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 text-foreground/40 hover:text-foreground transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-display text-2xl w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-10">
                  <button
                    onClick={addToCart}
                    disabled={!isInStock || addingToCart}
                    className={cn(
                      "w-full h-16 flex items-center justify-center gap-3 px-8 font-body text-[11px] tracking-[0.4em] uppercase transition-all relative overflow-hidden group",
                      isInStock
                        ? "bg-foreground text-background hover:bg-accent hover:text-foreground"
                        : "bg-foreground/5 text-foreground/30 cursor-not-allowed"
                    )}
                  >
                    {addingToCart ? (
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        {isInStock ? 'Secure Access' : 'Depleted'}
                      </>
                    )}
                  </button>

                  <div className="flex gap-4">
                    <button
                      onClick={toggleWishlist}
                      disabled={updatingWishlist}
                      className="flex-1 h-14 border border-foreground/10 flex items-center justify-center gap-3 hover:bg-foreground/5 transition-all text-[10px] font-body tracking-[0.3em] uppercase group"
                    >
                      <Heart className={cn("w-4 h-4 transition-all", isWishlisted ? "fill-accent text-accent" : "text-foreground/40 group-hover:text-foreground")} />
                      {isWishlisted ? 'Archived' : 'Add to Archive'}
                    </button>
                    <button className="w-14 h-14 border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-all">
                      <Share2 className="w-4 h-4 text-foreground/40" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Details Detail */}
              <div className="pt-20 space-y-12">
                {product.description && (
                  <div className="space-y-4">
                    <h3 className="font-body text-[10px] tracking-[0.4em] uppercase text-accent font-bold">Provenance</h3>
                    <p className="font-body text-xs tracking-[0.1em] text-foreground/70 leading-relaxed uppercase whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.attributes && typeof product.attributes === 'object' && Object.keys(product.attributes).length > 0 && (
                  <div className="space-y-6 pt-12 border-t border-foreground/5">
                    <h3 className="font-body text-[10px] tracking-[0.4em] uppercase text-accent font-bold">Anatomy</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-baseline border-b border-foreground/5 pb-2">
                          <span className="font-body text-[9px] tracking-[0.2em] uppercase text-foreground/40">{key.replace(/_/g, ' ')}</span>
                          <span className="font-body text-[10px] tracking-[0.1em] uppercase text-foreground/80">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.related_products.length > 0 && (
          <section className="mt-32 pt-32 border-t border-foreground/10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-[1px] bg-accent" />
              <h2 className="font-display text-4xl uppercase tracking-tighter">Related Artifacts</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
              {product.related_products.map((related, i) => (
                <Link key={related.id} to={`/products/${related.slug}`} className="group">
                  <div className="aspect-[3/4] bg-foreground/5 mb-6 overflow-hidden relative border border-foreground/5">
                    <OptimizedImage
                      src={related.primary_image?.image_url ?? PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]}
                      alt={related.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                      <span className="font-body text-[8px] tracking-[0.3em] uppercase text-white font-bold">Inspect Item →</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/60 transition-colors group-hover:text-foreground">{related.name}</h3>
                    <p className="font-display text-xl">{formatCurrency(related.price)}</p>
                  </div>
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