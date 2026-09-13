import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { ToastProvider } from './components/ui/ToastProvider';

// Components
import KalaHeader from './components/KalaHeader';
import KalaFooter from './components/KalaFooter';
import KalaStudioConnectModal from './components/KalaStudioConnectModal';
import KalaChatbot from './components/KalaChatbot';
import KalaSearchModal from './components/KalaSearchModal';
import CartDrawer from './components/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import CustomApparelPage from './pages/CustomApparelPage';
import BusinessBrandingPage from './pages/BusinessBrandingPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import BookMeetingPage from './pages/BookMeetingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Contact Modal State (KALA Studio Connect)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-kala-emerald selection:text-white transition-colors duration-300">
      {/* Header */}
      <KalaHeader
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenContactModal={() => setIsContactModalOpen(true)}
      />

      {/* Main Content & Routes */}
      <main className="flex-1">
        <Routes>
          {/* 1. Home */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />

          {/* 2. Custom Apparel */}
          <Route path="/custom-apparel" element={<CustomApparelPage />} />

          {/* 3. Business Branding */}
          <Route path="/business-branding" element={<BusinessBrandingPage />} />

          {/* 4. Products / Shop */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ShopPage />} />

          {/* 5. Product Details */}
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* 6. About */}
          <Route path="/about" element={<AboutPage />} />

          {/* 7. Contact */}
          <Route path="/contact" element={<ContactPage />} />

          {/* 8. FAQ */}
          <Route path="/faq" element={<FAQPage />} />

          {/* 9. Login & Signup */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 10. My Account & Orders */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/profile" element={<AccountPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />

          {/* 11. Cart, Wishlist & Checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />

          {/* 12. Book Meeting */}
          <Route path="/book-meeting" element={<BookMeetingPage />} />

          {/* 13. Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isAdminRoute && <KalaFooter />}

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Floating KALA Studio Connect Contact Modal */}
      <KalaStudioConnectModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Floating Contact Trigger Button (Left side of Chatbot) */}
      {!isAdminRoute && (
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="fixed bottom-6 right-24 z-40 px-4 py-2.5 bg-card hover:bg-black/5 dark:hover:bg-white/10 text-foreground border border-border rounded-full shadow-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
          title="KALA Studio Connect"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Connect Studio</span>
        </button>
      )}

      {/* 20-FAQ Interactive Chatbot */}
      {!isAdminRoute && <KalaChatbot />}

      {/* Live Search Modal */}
      <KalaSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => (
  <CartProvider>
    <WishlistProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </ToastProvider>
    </WishlistProvider>
  </CartProvider>
);

export default App;
