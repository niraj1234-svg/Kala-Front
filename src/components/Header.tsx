import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag, User, X, ChevronRight } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currencies = [
    { code: 'AUD', flag: 'au', name: 'Australian Dollar' },
    { code: 'USD', flag: 'us', name: 'US Dollar' },
    { code: 'EUR', flag: 'eu', name: 'Euro' },
    { code: 'GBP', flag: 'gb', name: 'British Pound' },
    { code: 'INR', flag: 'in', name: 'Indian Rupee' },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.currency-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Show header when dropdown is open
  useEffect(() => {
    if (isDropdownOpen && window.scrollY < 100) {
      setIsScrolled(true);
    } else if (window.scrollY < 100) {
      setIsScrolled(false);
    }
  }, [isDropdownOpen]);

  const menuItems = [
    {
      title: 'NEW ARRIVALS',
      items: ['All New', 'Clothing', 'Accessories', 'Featured'],
    },
    {
      title: 'CLOTHING',
      items: ['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts', 'Jeans', 'Activewear'],
    },
    {
      title: 'ACCESSORIES',
      items: ['Hats', 'Bags', 'Belts', 'Sunglasses', 'Watches', 'Wallets'],
    },
    {
      title: 'COLLECTIONS',
      items: ['Summer Collection', 'Winter Collection', 'Limited Edition', 'Essentials'],
    },
    {
      title: 'SALE',
      items: ['Up to 50% Off', 'Clearance', 'Last Chance'],
    },
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white text-xs sm:text-sm py-2 px-4 text-center z-50">
        <div className="flex items-center justify-center gap-4">
          <button className="hover:opacity-70">←</button>
          <span className="font-medium tracking-wide">
            FREE SHIPPING AVAILABLE WORLDWIDE - <span className="underline">READ MORE</span>
          </span>
          <button className="hover:opacity-70">→</button>
        </div>
      </div>

      {/* Main Header - Always Visible (Hides on Scroll) */}
      <header 
        className={`fixed top-8 sm:top-10 left-0 right-0 z-40 bg-transparent transition-opacity duration-500 ${
          isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left Side - Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 p-2 hover:opacity-70 transition-opacity text-white"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium tracking-wider">MENU</span>
            </button>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <a href="#" className="text-2xl sm:text-3xl font-bold tracking-[0.3em] text-white">
                Appral
              </a>
            </div>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Currency Dropdown */}
              <div className="relative currency-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hidden lg:flex items-center gap-1 text-white text-sm hover:opacity-70 transition-opacity"
                >
                  <img 
                    src={`https://flagcdn.com/w20/${selectedCurrency.flag}.png`} 
                    alt={selectedCurrency.code} 
                    className="w-5 h-3" 
                  />
                  <span className="font-medium">{selectedCurrency.code} $</span>
                  <ChevronRight className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && !isScrolled && (
                  <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-[100] border border-gray-200">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setSelectedCurrency(currency);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${currency.flag}.png`} 
                          alt={currency.code} 
                          className="w-5 h-3" 
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{currency.code}</div>
                          <div className="text-xs text-gray-500">{currency.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-2 hover:opacity-70 transition-opacity text-white">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 hover:opacity-70 transition-opacity text-white">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:opacity-70 transition-opacity text-white">
                <ShoppingBag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scrolled Header - White Background */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white shadow-md translate-y-0'
            : 'bg-transparent -translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left Side - Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-900"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium tracking-wider">MENU</span>
            </button>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <a href="#" className="text-2xl sm:text-3xl font-bold tracking-[0.3em] text-gray-900">
              Appral
              </a>
            </div>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Currency Dropdown */}
              <div className="relative currency-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hidden lg:flex items-center gap-1 text-gray-900 text-sm hover:opacity-70 transition-opacity"
                >
                  <img 
                    src={`https://flagcdn.com/w20/${selectedCurrency.flag}.png`} 
                    alt={selectedCurrency.code} 
                    className="w-5 h-3" 
                  />
                  <span className="font-medium">{selectedCurrency.code} $</span>
                  <ChevronRight className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-[100] border border-gray-200">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setSelectedCurrency(currency);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                      >
                        <img 
                          src={`https://flagcdn.com/w20/${currency.flag}.png`} 
                          alt={currency.code} 
                          className="w-5 h-3" 
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{currency.code}</div>
                          <div className="text-xs text-gray-500">{currency.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                <ShoppingBag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-wider">MENU</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-6 space-y-8">
            {menuItems.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-sm font-bold tracking-widest text-gray-900 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a
                        href="#"
                        className="block text-gray-700 hover:text-black transition-colors text-sm py-1"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Additional Links */}
            <div className="pt-8 border-t border-gray-200 space-y-3">
              <a href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-600">
                About Us
              </a>
              <a href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-600">
                Contact
              </a>
              <a href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-600">
                Store Locator
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;