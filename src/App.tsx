import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CustomApparel from './pages/CustomApparel'
import BusinessBranding from './pages/BusinessBranding'
import About from './pages/About'
import Cart from './pages/Cart'
import Account from './pages/Account'
import AccountOrderDetail from './pages/AccountOrderDetail'
import Wishlist from './pages/Wishlist'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="kala-app">
            <Navbar />
          <div className="kala-main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/custom-apparel" element={<CustomApparel />} />
          <Route path="/business-branding" element={<BusinessBranding />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/orders/:orderId" element={<AccountOrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
