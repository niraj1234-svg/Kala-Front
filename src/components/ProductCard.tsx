import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../lib/api';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const secondaryImage = product.additionalImages && product.additionalImages.length > 1
    ? product.additionalImages[1]
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.isSoldOut) return;

    const defaultSize = (product.availableSizes && product.availableSizes[0]) || 'Standard';
    const defaultColor = (product.availableColors && product.availableColors[0]) || 'Standard';

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      size: defaultSize,
      color: defaultColor,
      image: product.image,
      quantity: 1,
      category: product.category,
      subCategory: product.subCategory,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-[#faf8f5] dark:bg-[#181614] p-6 flex items-center justify-center select-none">
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={isHovered && secondaryImage ? secondaryImage : product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="bg-[#1c1a17] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-xs">
              {product.badge}
            </span>
          )}
          {product.isSoldOut && (
            <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 dark:bg-black/50 text-foreground hover:scale-110 shadow-xs'
          }`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button Hover Overlay */}
        {onQuickView && (
          <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden sm:block">
            <button
              onClick={handleQuickViewClick}
              className="w-full py-2 bg-background/95 hover:bg-background text-foreground border border-border rounded-xl text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Design Tag */}
          <div className="flex items-center justify-between text-[10px] font-mono text-mid uppercase mb-1">
            <span>{product.subCategory || product.category}</span>
            {product.designCategory && (
              <span className="text-kala-emerald dark:text-emerald-400 font-semibold">
                {product.designCategory}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base font-bold text-foreground group-hover:text-kala-emerald transition-colors line-clamp-2">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Color Dots if available */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-mid font-mono mr-1">Colors:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {product.availableColors.slice(0, 3).map((col, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-foreground font-mono"
                    title={col}
                  >
                    {col.split(' ')[0]}
                  </span>
                ))}
                {product.availableColors.length > 3 && (
                  <span className="text-[9px] text-mid font-mono">
                    +{product.availableColors.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & CTA Row */}
        <div className="pt-4 mt-4 border-t border-border space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">₹{product.price}</span>
              {product.salePrice && (
                <span className="text-xs text-mid line-through">₹{product.salePrice}</span>
              )}
            </div>
            {product.isSoldOut ? (
              <span className="text-[10px] font-bold text-red-500 uppercase">
                Out of Stock
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                In Stock
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/product/${product.id}`}
              className="w-full py-2 bg-card border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center transition-colors shadow-2xs"
            >
              Details
            </Link>

            {product.isSoldOut ? (
              <button
                disabled
                className="w-full py-2 bg-black/10 dark:bg-white/10 text-mid rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed text-center"
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-kala-emerald hover:bg-kala-emerald/90 text-white hover:-translate-y-0.5'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
