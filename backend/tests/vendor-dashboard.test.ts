import express from 'express'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { loadEnv } from '../src/config/env'
import { connectDB } from '../src/config/db'
import { User } from '../src/models/User'
import { VendorProfile } from '../src/models/VendorProfile'
import { VendorShop } from '../src/models/VendorShop'
import { Product } from '../src/models/Product'
import { Order } from '../src/models/Order'
import vendorRouter from '../src/routes/vendorRoutes'
import marketplaceRouter from '../src/routes/marketplaceRoutes'

loadEnv()

async function runVendorDashboardTests() {
  console.log('=== Running KALA Vendor Dashboard E2E Tests ===\n')

  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Failed to connect to MongoDB.')
    process.exit(1)
  }

  console.log('✓ Connected to MongoDB')

  const app = express()
  app.use(express.json())
  app.use('/api/vendor', vendorRouter)
  app.use('/api/marketplace', marketplaceRouter)
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
  })

  const server = app.listen(0)
  const port = (server.address() as any).port
  const baseUrl = `http://localhost:${port}`

  try {
    // 1. Setup Test Vendor User & Profile
    const testUserId = 'test_vendor_' + Date.now()
    const testEmail = `vendor_${Date.now()}@test.com`
    const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_kala'

    await User.create({
      userId: testUserId,
      email: testEmail,
      firstName: 'E2E',
      lastName: 'Vendor',
      phone: '+919999988888',
      role: 'vendor',
      passwordHash: 'dummy_hash',
    })

    const vendorProfile = await VendorProfile.create({
      userId: testUserId,
      businessName: 'Patna Print Works',
      category: 'Clothing Brand',
      email: testEmail,
      phone: '+91 9999988888',
      city: 'Patna',
      state: 'Bihar',
      status: 'APPROVED',
    })

    const vendorShop = await VendorShop.create({
      vendorId: testUserId,
      shopName: 'Patna Print Works',
      slug: 'patna-print-works-' + Date.now(),
      category: 'Streetwear',
      contactEmail: testEmail,
      contactPhone: '+91 9999988888',
      city: 'Patna',
      state: 'Bihar',
      description: 'Handcrafted streetwear from Bihar.',
      isActive: true,
    })

    console.log(`✓ Test vendor created: ${vendorProfile.businessName} (ID: ${testUserId})`)

    const token = jwt.sign({ userId: testUserId, email: testEmail }, jwtSecret, { expiresIn: '1h' })
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    // 2. Test GET /api/vendor/stats
    console.log('\n[Test 1] Testing GET /api/vendor/stats...')
    const statsRes = await fetch(`${baseUrl}/api/vendor/stats`, { headers: authHeaders })
    const statsData = await statsRes.json()
    console.log('Stats response:', statsData)
    if (statsRes.status === 200 && statsData.success && statsData.stats) {
      console.log('✓ PASS: GET /api/vendor/stats returned valid statistics.')
      console.log(`  Total Products: ${statsData.stats.totalProducts}`)
      console.log(`  Active Products: ${statsData.stats.activeProducts}`)
      console.log(`  Total Orders: ${statsData.stats.totalOrders}`)
      console.log(`  Total Earnings: ₹${statsData.stats.totalEarnings}`)
    } else {
      throw new Error(`GET /api/vendor/stats failed: ${JSON.stringify(statsData)}`)
    }

    // 3. Test POST /api/vendor/products (Save as DRAFT)
    console.log('\n[Test 2] Creating a product with approvalStatus = DRAFT...')
    const draftProductRes = await fetch(`${baseUrl}/api/vendor/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Oversized Mithila Graphic Tee',
        price: 999,
        mrp: 1499,
        category: 'Streetwear',
        subcategory: 'T-Shirts',
        description: 'Heavyweight oversized cotton t-shirt with traditional Mithila art prints.',
        stock: 50,
        sku: 'MITH-001-BLK',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        sizes: ['M', 'L', 'XL'],
        colors: ['Black', 'Off-White'],
        shippingInfo: 'Dispatched within 24 hours via Delhivery.',
        approvalStatus: 'DRAFT',
      }),
    })
    const draftProductData = await draftProductRes.json()
    if (draftProductRes.status === 201 && draftProductData.success && draftProductData.product) {
      console.log(`✓ PASS: Product saved as DRAFT. ID: ${draftProductData.product._id || draftProductData.product.id}`)
      console.log(`  Approval Status: ${draftProductData.product.approvalStatus}`)
    } else {
      throw new Error(`Failed to create draft product: ${JSON.stringify(draftProductData)}`)
    }
    const draftProductId = draftProductData.product._id || draftProductData.product.id

    // 4. Verify draft product is NOT visible in public marketplace
    console.log('\n[Test 3] Verifying DRAFT product is hidden from public marketplace...')
    const publicMarketplaceRes = await fetch(`${baseUrl}/api/marketplace/products`)
    const publicMarketplaceData = await publicMarketplaceRes.json()
    const draftFoundInPublic = publicMarketplaceData.products?.some((p: any) => p._id === draftProductId || p.id === draftProductId)
    if (!draftFoundInPublic) {
      console.log('✓ PASS: DRAFT product is safely excluded from public marketplace.')
    } else {
      throw new Error('❌ FAIL: DRAFT product was visible in public marketplace!')
    }

    // 5. Test POST /api/vendor/products (Submit for Approval: PENDING)
    console.log('\n[Test 4] Creating a product with approvalStatus = PENDING...')
    const pendingProductRes = await fetch(`${baseUrl}/api/vendor/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Bihar Underground Hoodie',
        price: 2499,
        mrp: 3499,
        category: 'Streetwear',
        subcategory: 'Hoodies',
        description: 'French Terry 400 GSM hoodie with custom puff print.',
        stock: 25,
        sku: 'BHR-HD-001',
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Charcoal Grey'],
        shippingInfo: 'Free pan-India shipping.',
        approvalStatus: 'PENDING',
      }),
    })
    const pendingProductData = await pendingProductRes.json()
    if (pendingProductRes.status === 201 && pendingProductData.success && pendingProductData.product) {
      console.log(`✓ PASS: Product created as PENDING approval. ID: ${pendingProductData.product._id || pendingProductData.product.id}`)
    } else {
      throw new Error(`Failed to create pending product: ${JSON.stringify(pendingProductData)}`)
    }
    const pendingProductId = pendingProductData.product._id || pendingProductData.product.id

    // 6. Test toggle status (Activate / Deactivate)
    console.log('\n[Test 5] Testing PUT /api/vendor/products/:id/toggle-status...')
    const toggleRes = await fetch(`${baseUrl}/api/vendor/products/${pendingProductId}/toggle-status`, {
      method: 'PUT',
      headers: authHeaders,
    })
    const toggleData = await toggleRes.json()
    console.log('Toggle response:', toggleData)
    if (toggleRes.status === 200 && toggleData.success) {
      console.log(`✓ PASS: Toggled product availability to: ${toggleData.product.available}`)
    } else {
      throw new Error(`Toggle status failed: ${JSON.stringify(toggleData)}`)
    }

    // 7. Test Order Retrieval & Status Update
    console.log('\n[Test 6] Testing Order Management for Vendor...')
    // Create an order containing the vendor's pending product
    const testOrderId = 'ORD-TEST-' + Date.now()
    const testOrder = await Order.create({
      orderId: testOrderId,
      userId: 'test_customer_123',
      customer: {
        firstName: 'Rahul',
        lastName: 'Kumar',
        email: 'rahul@test.com',
        phone: '+919123456789',
      },
      items: [
        {
          productId: pendingProductId,
          name: 'Bihar Underground Hoodie',
          price: 2499,
          quantity: 2,
          size: 'L',
          color: 'Charcoal Grey',
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
        },
      ],
      shippingAddress: {
        address: 'Boring Road, Near Canal',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
      },
      pricing: {
        subtotal: 4998,
        shipping: 0,
        total: 4998,
      },
      status: 'pending',
    })
    console.log(`✓ Created test order: ${testOrder.orderId} for ₹4998`)

    // Query vendor orders
    const ordersRes = await fetch(`${baseUrl}/api/vendor/orders`, { headers: authHeaders })
    const ordersData = await ordersRes.json()
    if (ordersRes.status === 200 && ordersData.success && ordersData.orders?.length > 0) {
      const foundOrder = ordersData.orders.find((o: any) => o.orderId === testOrderId)
      if (foundOrder) {
        console.log(`✓ PASS: Found vendor order ${foundOrder.orderId} with vendorTotal = ₹${foundOrder.vendorTotal}`)
        console.log(`  Customer Name: ${foundOrder.customer?.firstName} ${foundOrder.customer?.lastName}`)
      } else {
        throw new Error('Test order not found in vendor orders list!')
      }
    } else {
      throw new Error(`Failed to fetch vendor orders: ${JSON.stringify(ordersData)}`)
    }

    // Update order status & add tracking
    console.log('\n[Test 7] Updating vendor order status to SHIPPED with tracking details...')
    const updateOrderRes = await fetch(`${baseUrl}/api/vendor/orders/${testOrderId}/status`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'shipped',
        carrier: 'BlueDart Express',
        trackingNumber: 'BD123456789IN',
      }),
    })
    const updateOrderData = await updateOrderRes.json()
    if (updateOrderRes.status === 200 && updateOrderData.success) {
      console.log('✓ PASS: Order status successfully updated to SHIPPED with carrier and tracking number.')
    } else {
      throw new Error(`Failed to update order status: ${JSON.stringify(updateOrderData)}`)
    }

    // 8. Re-check stats after order to verify real earnings computation
    console.log('\n[Test 8] Checking recomputed stats after order creation...')
    const statsAfterOrderRes = await fetch(`${baseUrl}/api/vendor/stats`, { headers: authHeaders })
    const statsAfterData = await statsAfterOrderRes.json()
    console.log('Updated Stats:', statsAfterData.stats)
    if (statsAfterData.stats.totalOrders >= 1 && statsAfterData.stats.totalEarnings >= 4998) {
      console.log('✓ PASS: Real earnings & orders correctly calculated from MongoDB!')
    } else {
      throw new Error(`Expected totalEarnings >= 4998 and totalOrders >= 1. Got: ${JSON.stringify(statsAfterData)}`)
    }

    // 9. Clean up test records
    console.log('\nCleaning up test records...')
    await Product.deleteMany({ _id: { $in: [draftProductId, pendingProductId] } })
    await Order.deleteOne({ orderId: testOrderId })
    await VendorShop.deleteOne({ _id: vendorShop._id })
    await VendorProfile.deleteOne({ _id: vendorProfile._id })
    await User.deleteOne({ userId: testUserId })
    console.log('✓ Cleaned up test data.')

    console.log('\n========================================')
    console.log('🎉 ALL VENDOR DASHBOARD TESTS PASSED!')
    console.log('========================================\n')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    server.close()
    await mongoose.connection.close()
    process.exit(0)
  }
}

runVendorDashboardTests()
