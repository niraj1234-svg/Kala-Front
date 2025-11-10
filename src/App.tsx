import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';

import ScrollToTop from './components/ScrollToTop';
import { useAuthStore, authStore } from './store/authStore';
import { useAppralStore, appralStore } from './store/appralStore';
import { ToastProvider } from './components/ui/ToastProvider';

// Existing pages
import HeroSection from './components/HeroSection';
import FeaturedCollections from './components/FeaturedCollections';
import BrandStorySection from './components/BrandStorySection';


// NEW PAGES
import ProductsListingPage from './pages/ProductsListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';

// Admin pages
import AdminLayout from './admin/AdminLayout';
import DashboardOverviewPage from './admin/DashboardOverviewPage';
import ProductsListPage from './admin/ProductsListPage';
import ProductDetailConsolePage from './admin/ProductDetailConsolePage';
import CategoriesPage from './admin/CategoriesPage';
import UsersListPage from './admin/UsersListPage';
import UserProfilePage from './admin/UserProfilePage';

const HomePage = () => (
  <>
    <HeroSection />
    <FeaturedCollections />
    <BrandStorySection />
    {/* <ProductCategoryShowcase /> */}
    {/* <FeatureSections /> */}
  </>
);

const AppContent: React.FC = () => {
  const authState = useAuthStore((state) => state);
  const categoriesState = useAppralStore((state) => state.categories);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const containerClassName = isAdminRoute
    ? 'min-h-screen'
    : 'min-h-screen pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0';

  useEffect(() => {
    if (!authState.isAuthenticated && authState.tokens?.access) {
      authStore.fetchProfile().catch(() => {
        // Ignore error; authStore already handles state reset on failure
      });
    }
  }, [authState.isAuthenticated, authState.tokens?.access]);

  useEffect(() => {
    if (!categoriesState.loading && categoriesState.data.length === 0) {
      appralStore.fetchCategories().catch((error) => {
        console.error('Failed to load categories', error);
      });
    }
  }, [categoriesState.data.length, categoriesState.loading]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      appralStore.fetchCart().catch((error) => {
        console.error('Failed to load cart', error);
      });
    }
  }, [authState.isAuthenticated]);

  return (
    <div className={containerClassName}>
      {!isAdminRoute && (
        <Header
          isLoggedIn={authState.isAuthenticated}
          userName={authState.user?.first_name ?? authState.user?.email ?? ''}
          userRole={authState.user?.role}
          onLogout={() => authStore.logout()}
        />
      )}

      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Products Listing Page */}
        <Route path="/products" element={<ProductsListingPage />} />

        {/* Product Detail Page */}
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Cart Page */}
        <Route path="/cart" element={<CartPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/:slug" element={<ProductDetailConsolePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/:id" element={<UserProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <Router>
      {/* ScrollToTop component to reset scroll position on route change */}
      <ScrollToTop />
      <AppContent />
    </Router>
  </ToastProvider>
);

export default App;