import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import { useAuthStore, authStore } from "./store/authStore";
import { useAppralStore, appralStore } from "./store/appralStore";
import { ToastProvider } from "./components/ui/ToastProvider";

// Hustle Hour Rebuild Components
import Navbar from "./components/hustle-hour/Navbar";
import CustomCursor from "./components/hustle-hour/CustomCursor";
import Hero from "./sections/hustle-hour/Hero";
import Chronicle from "./sections/hustle-hour/Chronicle";
import Collections from "./sections/hustle-hour/Collections";
import Campaign from "./sections/hustle-hour/Campaign";
import Vancouver from "./sections/hustle-hour/Vancouver";
import AboutUs from "./sections/hustle-hour/AboutUs";
import HustleHourFooter from "./components/hustle-hour/Footer";
import { useScrollReveal } from "./hooks/useScrollReveal";

// NEW PAGES
import ProductsListingPage from "./pages/ProductsListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";

// Admin pages
import AdminLayout from "./admin/AdminLayout";
import DashboardOverviewPage from "./admin/DashboardOverviewPage";
import ProductsListPage from "./admin/ProductsListPage";
import ProductDetailConsolePage from "./admin/ProductDetailConsolePage";
import CategoriesPage from "./admin/CategoriesPage";
import UsersListPage from "./admin/UsersListPage";
import UserProfilePage from "./admin/UserProfilePage";
import FloatingContactButton from "./components/FloatingContactButton";

const HomePage = () => {
  useScrollReveal();

  return (
    <>
      <main>
        <Hero />
        <div className="reveal">
          <Chronicle />
        </div>
        <div className="reveal">
          <Collections />
        </div>
        <div className="reveal">
          <Campaign />
        </div>
        <div className="reveal">
          <Vancouver />
        </div>
        <div className="reveal">
          <AboutUs />
        </div>
      </main>

      <HustleHourFooter />
    </>
  );
};

const AppContent: React.FC = () => {
  const authState = useAuthStore((state) => state);
  const categoriesState = useAppralStore((state) => state.categories);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const containerClassName = "min-h-screen bg-background selection:bg-accent selection:text-foreground";

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
        console.error("Failed to load categories", error);
      });
    }
  }, [categoriesState.data.length, categoriesState.loading]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      appralStore.fetchCart().catch((error) => {
        console.error("Failed to load cart", error);
      });
    }
  }, [authState.isAuthenticated]);

  return (
    <div className={containerClassName}>
      {!isAdminRoute && (
        <>
          <CustomCursor />
          <Navbar />
        </>
      )}

      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Products Listing Page */}
        <Route path="/products" element={<ProductsListingPage />} />

        {/* Product Detail Page */}
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Cart Page */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />

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

      {!isAdminRoute && !isHomePage && <FloatingContactButton />}
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
