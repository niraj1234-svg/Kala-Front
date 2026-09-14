import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../lib/api';
import { useCart } from '../CartContext';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize((product.availableSizes && product.availableSizes[0]) || 'Standard');
      setSelectedColor((product.availableColors && product.availableColors[0]) || 'Standard');
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.isSoldOut) return;

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      size: selectedSize,
      color: selectedColor,
      image: product.image,
      quantity,
      category: product.category,
      subCategory: product.subCategory,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background text-mid hover:text-foreground border border-border transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8 items-center">
              {/* Image Preview */}
              <div className="aspect-square rounded-2xl bg-[#faf8f5] dark:bg-[#181614] border border-border p-6 flex items-center justify-center relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#1c1a17] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Details & Options */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-mid block mb-1">
                    {product.category} &bull; {product.subCategory}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold uppercase text-foreground leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-serif text-2xl font-bold text-foreground">
                      ₹{product.price}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs text-mid line-through font-serif">
                        ₹{product.salePrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Size Selection */}
                {product.availableSizes && product.availableSizes.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-foreground">
                      <span>Size</span>
                      <span className="font-mono text-[11px] text-mid">{selectedSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.availableSizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            selectedSize === s
                              ? 'bg-foreground text-background border-foreground shadow-2xs'
                              : 'bg-background border-border text-mid hover:text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.availableColors && product.availableColors.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-foreground">
                      <span>Color</span>
                      <span className="font-mono text-[11px] text-mid">{selectedColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.availableColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                            selectedColor === c
                              ? 'bg-kala-emerald text-white border-kala-emerald'
                              : 'bg-background border-border text-mid hover:text-foreground'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Qty:
                  </span>
                  <div className="flex items-center border border-border rounded-lg bg-background">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-xs text-mid hover:text-foreground"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-xs text-mid hover:text-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.isSoldOut}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-kala-emerald hover:bg-kala-emerald/90 text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added To Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add To Cart &bull; ₹{product.price * quantity}</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="w-full py-2.5 bg-background border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <span>View Full Product Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickViewModal;
