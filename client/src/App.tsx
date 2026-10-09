import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthPromptModal from './components/AuthPromptModal'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CustomApparel from './pages/CustomApparel'
import Customize from './pages/Customize'
import BusinessBranding from './pages/BusinessBranding'
import About from './pages/About'
import Cart from './pages/Cart'
import Account from './pages/Account'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Wishlist from './pages/Wishlist'
import ProductDetails from './pages/ProductDetails'
import BundleBuilder from './pages/BundleBuilder'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import { trackFirstVisit } from './services/visitorApi'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductCreate from './pages/admin/AdminProductCreate'
import AdminProductEdit from './pages/admin/AdminProductEdit'
import AdminCustomRequests from './pages/admin/AdminCustomRequests'
import AdminBusinessRequests from './pages/admin/AdminBusinessRequests'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminReviews from './pages/admin/AdminReviews'
import AdminReviewDetail from './pages/admin/AdminReviewDetail'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
import CartToast from './components/CartToast'
import LiveSocialProof from './components/LiveSocialProof'
import BottomNav from './components/BottomNav'
import './App.css'

function App() {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  useEffect(() => {
    // Record anonymous first visit to KALA (only sends once, rate-limited, idempotent)
    trackFirstVisit()
  }, [])

  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <div className={`kala-app ${isAdminPath ? 'kala-admin-app' : ''}`}>
              {!isAdminPath && <Navbar />}
              {!isAdminPath && <AuthPromptModal />}
              {!isAdminPath && <CartToast />}
              {!isAdminPath && <LiveSocialProof />}
              <div className={isAdminPath ? 'kala-admin-app-content' : 'kala-main-content'}>
                <Routes>
                  {/* Customer Storefront Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/bundle" element={<BundleBuilder />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/custom-apparel" element={<CustomApparel />} />
                  <Route path="/customize" element={<Customize />} />
                  <Route path="/business-branding" element={<BusinessBranding />} />
                  <Route path="/bulk-order" element={<BusinessBranding />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:orderId" element={<OrderDetails />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/login" element={<Account />} />
                  <Route path="/account/orders/:orderId" element={<OrderDetails />} />
                  <Route path="/wishlist" element={<Wishlist />} />

                  {/* Dedicated Admin Portal Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminDashboard />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminOrders />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders/:orderId"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminOrderDetail />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminProducts />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/new"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminProductCreate />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/:id/edit"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminProductEdit />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/custom-requests"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminCustomRequests />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/business-requests"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminBusinessRequests />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminCustomers />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/customers/:userId"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminCustomerDetail />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/coupons"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminCoupons />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/reviews"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminReviews />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/reviews/:reviewId"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminReviewDetail />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminAnalytics />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <AdminRoute>
                        <AdminLayout>
                          <AdminSettings />
                        </AdminLayout>
                      </AdminRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              {!isAdminPath && <Footer />}
              {!isAdminPath && <BottomNav />}
            </div>
          </WishlistProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App
