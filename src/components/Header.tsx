import { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag, User, X} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext'; 
interface HeaderProps {
  isLoggedIn: boolean;
  userName: string;
  onLogout: () => void;
}

const Header = ({ isLoggedIn, userName, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Get cart state
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.currency-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('.user-menu-dropdown')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isDropdownOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isUserMenuOpen]);

  const menuItems = [
    {
      title: 'NEW ARRIVALS',
      items: [
        { name: 'All New', link: '/products' },
        { name: 'Clothing', link: '/products?category=Clothing' },
        { name: 'Accessories', link: '/products?category=Accessories' },
        { name: 'Featured', link: '/products?featured=true' }
      ],
    },
    {
      title: 'CLOTHING',
      items: [
        { name: 'T-Shirts', link: '/products?category=T-Shirts' },
        { name: 'Shirts', link: '/products?category=Shirts' },
        { name: 'Hoodies', link: '/products?category=Hoodies' },
        { name: 'Jackets', link: '/products?category=Jackets' },
        { name: 'Pants', link: '/products?category=Pants' },
        { name: 'Shorts', link: '/products?category=Shorts' }
      ],
    },
    {
      title: 'ACCESSORIES',
      items: [
        { name: 'Hats', link: '/products?category=Hats' },
        { name: 'Bags', link: '/products?category=Bags' },
        { name: 'Belts', link: '/products?category=Belts' }
      ],
    }
  ];

  // Handle user actions
  const handleUserIconClick = () => {
    if (isLoggedIn) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white text-xs sm:text-sm py-2 px-4 text-center z-50">
        <div className="flex items-center justify-center">
          <span className="font-medium tracking-wide">
            FREE SHIPPING AVAILABLE WORLDWIDE
          </span>
        </div>
      </div>

      {/* Main Transparent Header */}
      <header 
        className={`fixed top-8 left-0 right-0 z-40 bg-transparent transition-all duration-300 ${
          isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 p-2 rounded-md bg-black/40 text-white hover:bg-black/60"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium tracking-wider">MENU</span>
            </button>

            {/* Center - Logo */}
            <div className="flex flex-col items-center">
              <Link to="/" className="text-xl font-bold tracking-wider text-white">
                <img src="/lo.png" alt="Logo" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-2">
              <div className="relative currency-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hidden lg:flex items-center gap-1 text-white text-sm bg-black/40 py-1 px-2 rounded-md"
                >
                  <img 
                    src={`https://flagcdn.com/w20/${selectedCurrency.flag}.png`} 
                    alt={selectedCurrency.code} 
                    className="w-5 h-3" 
                  />
                  <span>{selectedCurrency.code}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setSelectedCurrency(currency);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
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
              
              {/* User Button - Connect with Login */}
              <div className="relative user-menu-dropdown">
                <button
                  onClick={handleUserIconClick}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 relative"
                >
                  <User className="w-5 h-5" />
                  {isLoggedIn && (
                    <span className="absolute -top-1 -right-1 bg-green-500 rounded-full w-2 h-2"></span>
                  )}
                </button>
                
                {/* User Menu - Displayed when logged in */}
                {isLoggedIn && isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">Hello, {userName}</div>
                      <div className="text-xs text-gray-500">Manage your account</div>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <button className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
                <Search className="w-5 h-5" />
              </button>
              
              <Link to="/cart" className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Solid Header - Shows on Scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-md translate-y-0'
            : 'bg-transparent -translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium tracking-wider">MENU</span>
            </button>

            {/* Center - Logo */}
            <div className="flex flex-col items-center">
              <Link to="/" className="text-xl font-bold tracking-wider text-white">
                <img src="/lo.png" alt="Logo" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-2">
              <div className="relative currency-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hidden lg:flex items-center gap-1 text-gray-900 text-sm border border-gray-200 py-1 px-2 rounded-md"
                >
                  <img 
                    src={`https://flagcdn.com/w20/${selectedCurrency.flag}.png`} 
                    alt={selectedCurrency.code} 
                    className="w-5 h-3" 
                  />
                  <span>{selectedCurrency.code}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setSelectedCurrency(currency);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
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
              
              {/* User Button - Solid Header */}
              <div className="relative user-menu-dropdown">
                <button
                  onClick={handleUserIconClick}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                >
                  <User className="w-5 h-5" />
                  {isLoggedIn && (
                    <span className="absolute -top-1 -right-1 bg-green-500 rounded-full w-2 h-2"></span>
                  )}
                </button>
                
                {/* User Menu - Displayed when logged in */}
                {isLoggedIn && isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">Hello, {userName}</div>
                      <div className="text-xs text-gray-500">Manage your account</div>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5" />
              </button>
              
              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-50">
        <div className="grid grid-cols-4 h-14">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>
          
          <button className="flex flex-col items-center justify-center">
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </button>
          
          {/* User Button - Mobile */}
          <button 
            onClick={handleUserIconClick}
            className="flex flex-col items-center justify-center relative"
          >
            <User className="w-5 h-5" />
            {isLoggedIn && (
              <span className="absolute top-0 right-1/3 bg-green-500 rounded-full w-2 h-2"></span>
            )}
            <span className="text-xs mt-1">Account</span>
          </button>
          
          <Link to="/cart" className="flex flex-col items-center justify-center relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-1/3 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </Link>
        </div>
      </div>

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
          className={`absolute left-0 top-0 bottom-0 w-full sm:w-80 bg-white transition-transform duration-300 overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <div className="text-lg font-bold">
                <img src="/lo.png" alt="Logo" className="h-8 w-auto" />
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4">
            {/* User Login Section */}
            {!isLoggedIn ? (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <Link 
                  to="/login" 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition mb-2 inline-block text-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full block text-center border border-black py-2 px-4 rounded-md hover:bg-gray-100 transition"
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{userName}</div>
                    <div className="text-xs text-gray-500">Member</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Link to="/profile" className="text-sm text-gray-700 hover:text-black">Profile</Link>
                  <Link to="/orders" className="text-sm text-gray-700 hover:text-black">Orders</Link>
                  <Link to="/wishlist" className="text-sm text-gray-700 hover:text-black">Wishlist</Link>
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsSidebarOpen(false);
                    }}
                    className="text-sm text-gray-700 hover:text-black text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {menuItems.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-sm font-bold tracking-widest text-gray-900 mb-3">
                  {section.title}
                </h3>
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        to={item.link}
                        onClick={() => setIsSidebarOpen(false)}
                        className="block text-gray-700 py-2 hover:text-black"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;