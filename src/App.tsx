import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/footer';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './CartContext'; 

// Existing pages
import HeroSection from './components/copyHerosection';
import FeaturedCollections from './components/FeaturedCollections';
import BrandStorySection from './components/BrandStorySection';
import ProductCategoryShowcase from './components/ProductCategoryShowcase';
import FeatureSections from './components/newFeature';

// NEW PAGES
import ProductsListingPage from './pages/ProductsListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';

const HomePage = () => (
  <>
    <HeroSection />
    <FeaturedCollections />
    <BrandStorySection />
    <ProductCategoryShowcase />
    <FeatureSections />
  </>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [_userEmail, setUserEmail] = useState('');

  const handleLogin = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleSignup = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
  };

  return (
    <Router>
      {/* ScrollToTop component to reset scroll position on route change */}
      <ScrollToTop />
      
      {/* Wrap everything with CartProvider */}
      <CartProvider>
        <div className="min-h-screen">
          <Header
            isLoggedIn={isLoggedIn}
            userName={userName}
            onLogout={handleLogout}
          />
            
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
            
            {/* Products Listing Page */}
            <Route path="/products" element={<ProductsListingPage />} />
            
            {/* Product Detail Page */}
            <Route path="/products/:id" element={<ProductDetailPage />} />
            
            {/* Cart Page */}
            <Route path="/cart" element={<CartPage />} />
          </Routes>
          
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
};

export default App;