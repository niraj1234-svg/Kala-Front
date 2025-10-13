import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/footer';

// Existing pages
import HeroSection from './components/HeroSection';
import FeaturedCollections from './components/FeaturedCollections';
import BrandStorySection from './components/BrandStorySection';
import ProductCategoryShowcase from './components/ProductCategoryShowcase';
import FeatureSections from './components/FeatureSections';

// NEW PAGES
import ProductsListingPage from './pages/ProductsListingPage';
import ProductDetailPage from './pages/ProductDetailPage';

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
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Products Listing Page */}
          <Route path="/products" element={<ProductsListingPage />} />
          
          {/* Product Detail Page */}
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;