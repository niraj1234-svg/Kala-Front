import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  Heart,
  Shield,
  Truck,
  RotateCcw,
  AlertCircle,
  Check
} from 'lucide-react';
import { getProductBySlugOrId, getRelatedProducts, KALA_PRODUCTS, type KalaProduct } from '../constants/products';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import ProductCard from '../components/ProductCard';
import { KALA_CONFIG } from '../constants/config';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { recentProducts, recordProductView } = useRecentlyViewed();

  const [product, setProduct] = useState<KalaProduct | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const found = getProductBySlugOrId(id) || KALA_PRODUCTS.find(p => p.id === id || p.slug === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.image);
      if (found.availableSizes && found.availableSizes.length > 0) {
        setSelectedSize(found.availableSizes[0]);
      }
      if (found.availableColors && found.availableColors.length > 0) {
        setSelectedColor(found.availableColors[0]);
      }
      setQuantity(1);
      recordProductView(found);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-40 pb-24">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-mid mx-auto opacity-50" />
          <h2 className="font-serif text-3xl font-bold uppercase">Product Not Found</h2>
          <p className="text-xs text-mid">The requested apparel piece could not be located in our catalog.</p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-kala-emerald text-white text-xs font-bold uppercase tracking-wider rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [product.image, ...(product.additionalImages || [])].filter((v, i, a) => a.indexOf(v) === i);
  const related = getRelatedProducts(product, 4);
  const isFavorited = isInWishlist(product.id);

  // Check if chosen variant is in stock
  const isSelectedSizeInStock = product.stockByVariant
    ? product.stockByVariant[selectedSize] !== false
    : !product.isSoldOut;

  const handleAddToCart = () => {
    if (product.isSoldOut || !isSelectedSizeInStock) return;

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      size: selectedSize || 'Standard',
      color: selectedColor || 'Standard',
      image: product.image,
      quantity,
      category: product.category,
      subCategory: product.subCategory
    });

    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (product.isSoldOut || !isSelectedSizeInStock) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        size: selectedSize || 'Standard',
        color: selectedColor || 'Standard',
        image: product.image,
        quantity,
        category: product.category,
        subCategory: product.subCategory
      },
      false // don't open drawer, jump straight to checkout
    );

    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Navigation & Breadcrumbs (Rule 69) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono uppercase text-mid">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>&rarr;</span>
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            {product.designCategory && (
              <>
                <span>&rarr;</span>
                <Link to={`/shop?collection=${encodeURIComponent(product.designCategory)}`} className="hover:text-foreground">
                  {product.designCategory}
                </Link>
              </>
            )}
            <span>&rarr;</span>
            <span className="text-foreground font-bold truncate max-w-[200px]">{product.name}</span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-mid hover:text-foreground transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Product Layout: Gallery Left, Details Right (Rule 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT: Product Gallery (Rule 9) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#faf8f5] dark:bg-[#181614] border border-border p-8 sm:p-12 flex items-center justify-center shadow-xs">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
              />

              {/* Status Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="bg-[#1c1a17] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded shadow-xs">
                    {product.badge}
                  </span>
                )}
                {product.isSoldOut && (
                  <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                    SOLD OUT
                  </span>
                )}
              </div>

              {/* Wishlist Toggle Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-transform hover:scale-110 ${
                  isFavorited
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 dark:bg-black/60 text-foreground hover:bg-white'
                }`}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Carousel (Rule 9: Multiple angles, front, back, detail) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-[#faf8f5] dark:bg-[#181614] shrink-0 ${
                      activeImage === img
                        ? 'border-kala-emerald scale-105 shadow-xs'
                        : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-mid mb-2">
                <span>{product.category}</span>
                <span>&bull;</span>
                <span>{product.subCategory}</span>
                {product.designCategory && (
                  <>
                    <span>&bull;</span>
                    <span className="text-kala-emerald dark:text-emerald-400 font-bold">
                      {product.designCategory}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground uppercase leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                  ₹{product.price}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-base text-mid line-through font-serif">
                      ₹{product.salePrice}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded font-mono">
                      Save ₹{product.salePrice - product.price}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Sold out alert if applicable */}
            {product.isSoldOut && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>This item is currently sold out. Check back soon for archive restocks.</span>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm text-mid leading-relaxed border-t border-border pt-4">
              {product.description}
            </p>

            {/* Color Swatches (Rule 10) */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-foreground">
                  <span>Available Colours</span>
                  <span className="font-mono text-[11px] text-mid">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                        selectedColor === color
                          ? 'bg-kala-emerald text-white border-kala-emerald shadow-xs'
                          : 'bg-card border-border hover:border-foreground text-mid'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Options with Out of Stock State (Rule 10 & 41) */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-foreground">
                  <span>Select Size</span>
                  <span className="font-mono text-[11px] text-mid">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size) => {
                    const isAvailable = product.stockByVariant
                      ? product.stockByVariant[size] !== false
                      : true;

                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all border relative ${
                          !isAvailable
                            ? 'bg-black/5 dark:bg-white/5 text-mid/50 border-border cursor-not-allowed line-through'
                            : selectedSize === size
                            ? 'bg-foreground text-background border-foreground shadow-xs'
                            : 'bg-card border-border hover:border-foreground text-mid hover:text-foreground'
                        }`}
                        title={!isAvailable ? 'Out of Stock' : undefined}
                      >
                        <span>{size}</span>
                        {!isAvailable && (
                          <span className="block text-[8px] font-mono no-underline uppercase text-red-500">
                            Sold Out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Controls (Rule 11) */}
            <div className="border-t border-border pt-4 flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl bg-card shadow-2xs">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={product.isSoldOut}
                  className="px-3 py-1.5 text-sm font-bold text-mid hover:text-foreground disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-mono font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  disabled={product.isSoldOut}
                  className="px-3 py-1.5 text-sm font-bold text-mid hover:text-foreground disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: ADD TO CART & BUY NOW (Rules 12 & 13) */}
            <div className="pt-4 space-y-3">
              {product.isSoldOut ? (
                <button
                  disabled
                  className="w-full py-4 bg-black/10 dark:bg-white/10 text-mid rounded-xl text-xs font-bold uppercase tracking-widest cursor-not-allowed text-center"
                >
                  Sold Out
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3.5 bg-card border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-2xs"
                    >
                      {isAddedToast ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    {/* Buy Now (Direct Checkout - Rule 13) */}
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Information (Rule 24) */}
            <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-mid">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-kala-emerald shrink-0" />
                <span>Estimated delivery: <strong>{KALA_CONFIG.shipping.estimatedDays}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-kala-emerald shrink-0" />
                <span>Tested inks & 100% combed cotton</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-kala-emerald shrink-0" />
                <span>Replacement on manufacturing defects</span>
              </div>
            </div>
          </div>
        </div>

        {/* You may also like (Rule 14 & 39) */}
        {related.length > 0 && (
          <div className="pt-16 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-mid block">
                  RECOMMENDATIONS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
                  You may also like
                </h2>
              </div>
              <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-kala-emerald hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed (Rule 15) */}
        {recentProducts.length > 1 && (
          <div className="pt-16 border-t border-border space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-mid block">
                RECENTLY VIEWED
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
                Your Browsing History
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentProducts.filter(p => p.id !== product.id).slice(0, 4).map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;