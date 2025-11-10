import { LayoutGrid, Menu, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BottomBarProps {
  cartCount: number;
  isAdmin: boolean;
  onMenuToggle: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ cartCount, isAdmin, onMenuToggle }) => {
  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_-8px_20px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-md flex-col gap-2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-end justify-between gap-2">
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex w-full flex-col items-center justify-center rounded-md px-2 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
            <span className="mt-1 text-xs font-medium uppercase tracking-wide">Menu</span>
          </button>

          <Link
            to="/products"
            className="flex w-full flex-col items-center justify-center rounded-md px-2 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LayoutGrid className="h-6 w-6" />
            <span className="mt-1 text-xs font-medium uppercase tracking-wide">Products</span>
          </Link>

          <Link
            to="/cart"
            className="relative flex w-full flex-col items-center justify-center rounded-md px-2 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ShoppingBag className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-5 min-w-[1.25rem] rounded-full bg-red-500 px-1 text-center text-xs font-semibold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="mt-1 text-xs font-medium uppercase tracking-wide">Cart</span>
          </Link>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center justify-center gap-2 rounded-md bg-emerald-500 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <LayoutGrid className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomBar;
