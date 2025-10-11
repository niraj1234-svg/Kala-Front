import React from 'react';
import Header from './components/Header'; 
import HeroSection from './components/HeroSection'; 
import FeaturedCollections  from './components/FeaturedCollections';
import BrandStorySection from './components/BrandStorySection';
import ProductCategoryShowcase from './components/ProductCategoryShowcase';
import FeatureSections from './components/FeatureSections';
import Footer from './components/footer';
const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedCollections/>
   <BrandStorySection/>
   <ProductCategoryShowcase/>
   <FeatureSections/>
   <Footer/>
    </div>
  );
};

export default App;