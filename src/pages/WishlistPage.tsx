import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../WishlistContext';

export const WishlistPage: React.FC = () => {
  const { wishlistItems, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400 block mb-1">
              SAVED ARCHIVE
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black uppercase text-foreground">
              My Wishlist ({wishlistItems.length})
            </h1>
          </div>

          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-red-500 hover:text-red-700 underline font-mono self-start sm:self-auto"
            >
              Clear All Wishlist
            </button>
          )}
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          /* Empty State (Rule 49) */
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase text-foreground">
              Save something you love.
            </h2>
            <p className="text-xs sm:text-sm text-mid leading-relaxed">
              Your wishlist is currently empty. Tap the heart icon on any design or apparel piece to save it for later.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-kala-emerald hover:bg-kala-emerald/90 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-transform hover:-translate-y-0.5"
              >
                <span>Explore Designs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-[#faf8f5] dark:bg-[#181614] p-6 flex items-center justify-center">
                  <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 text-mid hover:text-red-500 flex items-center justify-center shadow-2xs transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-mid uppercase mb-1">
                      <span>{product.subCategory || product.category}</span>
                      {product.designCategory && (
                        <span className="text-kala-emerald dark:text-emerald-400 font-bold">
                          {product.designCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-base font-bold text-foreground line-clamp-1">
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h3>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-bold text-foreground">₹{product.price}</span>
                      {product.salePrice && (
                        <span className="text-xs text-mid line-through">₹{product.salePrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex gap-2">
                    <button
                      onClick={() => moveToCart(product)}
                      disabled={product.isSoldOut}
                      className="flex-1 py-2.5 bg-kala-emerald hover:bg-kala-emerald/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
