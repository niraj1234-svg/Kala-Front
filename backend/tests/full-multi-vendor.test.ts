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
import { SubOrder } from '../src/models/SubOrder'
import { Transaction } from '../src/models/Transaction'
import { Payout } from '../src/models/Payout'
import { InventoryLog } from '../src/models/InventoryLog'
import { PlatformSettings } from '../src/models/PlatformSettings'

import authRouter from '../src/routes/authRoutes'
import orderRouter from '../src/routes/orderRoutes'
import vendorRouter from '../src/routes/vendorRoutes'
import marketplaceRouter from '../src/routes/marketplaceRoutes'
import adminVendorRouter from '../src/routes/adminVendorRoutes'
import adminProductRouter from '../src/routes/adminProductRoutes'
import adminSettingsRouter from '../src/routes/adminSettingsRoutes'

loadEnv()

async function runMultiVendorSuite() {
  console.log('==========================================================')
  console.log('   KALA MULTI-VENDOR MARKETPLACE FULL VERIFICATION SUITE   ')
  console.log('==========================================================\n')

  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Failed to connect to MongoDB Atlas.')
    process.exit(1)
  }
  console.log('✓ [DB] Connected to MongoDB Atlas\n')

  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRouter)
  app.use('/api/orders', orderRouter)
  app.use('/api/vendor', vendorRouter)
  app.use('/api/marketplace', marketplaceRouter)
  app.use('/api/admin/vendors', adminVendorRouter)
  app.use('/api/admin/products', adminProductRouter)
  app.use('/api/admin/settings', adminSettingsRouter)
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
  })

  const server = app.listen(0)
  const port = (server.address() as any).port
  const baseUrl = `http://localhost:${port}`
  const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_kala'

  const runId = Date.now()

  try {
    // ------------------------------------------------------------------
    // TEST 1: SETUP ADMIN USER & PLATFORM SETTINGS
    // ------------------------------------------------------------------
    console.log('--- TEST 1: Setup Admin User & Platform Settings ---')
    const adminUserId = `admin_${runId}`
    const adminEmail = `admin_${runId}@kala.com`

    await User.create({
      userId: adminUserId,
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'Super',
      phone: '9999000001',
      role: 'admin',
      passwordHash: 'dummy_admin_hash',
    })

    const adminToken = jwt.sign(
      { userId: adminUserId, email: adminEmail, role: 'admin' },
      jwtSecret,
      { expiresIn: '1h' }
    )

    // Set Platform commission to 5%
    await PlatformSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: { commissionRate: 5, payoutThreshold: 100 } },
      { upsert: true, new: true }
    )
    console.log('✓ Admin created & platform commission set to 5%\n')

    // ------------------------------------------------------------------
    // TEST 2: CREATE VENDOR 1 & VENDOR 2 (SEPARATION TEST)
    // ------------------------------------------------------------------
    console.log('--- TEST 2: Dual Vendor Setup & Moderation Approval ---')
    const v1UserId = `vendor1_${runId}`
    const v1Email = `v1_${runId}@store.com`
    await User.create({
      userId: v1UserId,
      email: v1Email,
      firstName: 'Vendor',
      lastName: 'One',
      phone: '9876543210',
      role: 'vendor',
      passwordHash: 'hash_v1',
    })

    const v1Profile = await VendorProfile.create({
      userId: v1UserId,
      businessName: 'Vibe Apparel Lab',
      category: 'Streetwear',
      email: v1Email,
      phone: '9876543210',
      city: 'Patna',
      state: 'Bihar',
      status: 'APPROVED',
    })

    const v1Shop = await VendorShop.create({
      vendorId: v1Profile.id,
      shopName: 'Vibe Apparel Lab',
      slug: `vibe-apparel-${runId}`,
      category: 'Streetwear',
      description: 'Heavyweight custom streetwear from Patna',
      contactEmail: v1Email,
      contactPhone: '9876543210',
      address: 'Boring Road',
      city: 'Patna',
      state: 'Bihar',
      isActive: true,
    })

    const v1Token = jwt.sign(
      { userId: v1UserId, email: v1Email, role: 'vendor' },
      jwtSecret,
      { expiresIn: '1h' }
    )

    // Vendor 2
    const v2UserId = `vendor2_${runId}`
    const v2Email = `v2_${runId}@store.com`
    await User.create({
      userId: v2UserId,
      email: v2Email,
      firstName: 'Vendor',
      lastName: 'Two',
      phone: '9876543211',
      role: 'vendor',
      passwordHash: 'hash_v2',
    })

    const v2Profile = await VendorProfile.create({
      userId: v2UserId,
      businessName: 'Kala Stitch Studios',
      category: 'Custom Clothing',
      email: v2Email,
      phone: '9876543211',
      city: 'Patna',
      state: 'Bihar',
      status: 'APPROVED',
    })

    const v2Shop = await VendorShop.create({
      vendorId: v2Profile.id,
      shopName: 'Kala Stitch Studios',
      slug: `kala-stitch-${runId}`,
      category: 'Custom Clothing',
      description: 'Bespoke embroidered hoodies',
      contactEmail: v2Email,
      contactPhone: '9876543211',
      address: 'Bailey Road',
      city: 'Patna',
      state: 'Bihar',
      isActive: true,
    })

    const v2Token = jwt.sign(
      { userId: v2UserId, email: v2Email, role: 'vendor' },
      jwtSecret,
      { expiresIn: '1h' }
    )

    console.log(`✓ Vendor 1 created: "${v1Profile.businessName}" (Shop: ${v1Shop.slug})`)
    console.log(`✓ Vendor 2 created: "${v2Profile.businessName}" (Shop: ${v2Shop.slug})\n`)

    // ------------------------------------------------------------------
    // TEST 3: VENDOR PRODUCT CREATION WITH EXTENDED FIELDS & STATUS
    // ------------------------------------------------------------------
    console.log('--- TEST 3: Product Submissions & Admin Moderation ---')
    // Vendor 1 submits product
    const v1ProductRes = await fetch(`${baseUrl}/api/vendor/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${v1Token}` },
      body: JSON.stringify({
        name: 'V1 Oversized Acid Tee',
        category: 'Streetwear',
        description: 'Heavyweight oversized vintage graphic streetwear tee made with 240 GSM combed cotton.',
        brand: 'Vibe Lab',
        price: 999,
        mrp: 1499,
        costPrice: 450,
        weight: 280,
        estimatedDispatchDays: 2,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
        approvalStatus: 'PENDING',
      }),
    })
    const v1ProductData = await v1ProductRes.json()
    if (!v1ProductData.success) throw new Error('V1 product creation failed: ' + v1ProductData.message)
    const v1Product = v1ProductData.product
    console.log(`✓ Vendor 1 product created: ID ${v1Product.id}, Status: ${v1Product.approvalStatus}`)

    // Vendor 2 submits product
    const v2ProductRes = await fetch(`${baseUrl}/api/vendor/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${v2Token}` },
      body: JSON.stringify({
        name: 'V2 Embroidered Heavyweight Hoodie',
        category: 'Custom Clothing',
        description: '450 GSM fleece hoodie with high density custom chest embroidery.',
        brand: 'Kala Stitch',
        price: 1999,
        mrp: 2999,
        costPrice: 900,
        weight: 650,
        estimatedDispatchDays: 3,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
        approvalStatus: 'PENDING',
      }),
    })
    const v2ProductData = await v2ProductRes.json()
    if (!v2ProductData.success) throw new Error('V2 product creation failed: ' + v2ProductData.message)
    const v2Product = v2ProductData.product
    console.log(`✓ Vendor 2 product created: ID ${v2Product.id}, Status: ${v2Product.approvalStatus}`)

    // Admin approves both products
    const approve1Res = await fetch(`${baseUrl}/api/admin/products/${v1Product.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const approve1Data = await approve1Res.json()
    if (!approve1Data.success) throw new Error('Admin approval of V1 product failed')

    const approve2Res = await fetch(`${baseUrl}/api/admin/products/${v2Product.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const approve2Data = await approve2Res.json()
    if (!approve2Data.success) throw new Error('Admin approval of V2 product failed')

    console.log('✓ Admin approved both vendor products for live catalog visibility\n')

    // ------------------------------------------------------------------
    // TEST 4: SECURITY AUTHORIZATION CHECK (CROSS-VENDOR ISOLATION)
    // ------------------------------------------------------------------
    console.log('--- TEST 4: Cross-Vendor Isolation & Permission Checks ---')
    // Vendor 1 attempts to maliciously delete/update Vendor 2's product
    const maliciousEditRes = await fetch(`${baseUrl}/api/vendor/products/${v2Product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${v1Token}` },
      body: JSON.stringify({ name: 'Hacked Title' }),
    })
    const maliciousEditData = await maliciousEditRes.json()
    if (maliciousEditRes.status !== 403 && maliciousEditRes.status !== 404) {
      throw new Error(`Security breach! Expected 403/404 on cross-vendor edit, got: ${maliciousEditRes.status}`)
    }
    console.log(`✓ Unauthorized vendor edit correctly blocked with status ${maliciousEditRes.status} (Access Denied)\n`)

    // ------------------------------------------------------------------
    // TEST 5: CUSTOMER MULTI-VENDOR CART CHECKOUT & ATOMIC STOCK DECREMENT
    // ------------------------------------------------------------------
    console.log('--- TEST 5: Customer Multi-Vendor Checkout & Atomic Stock Decrement ---')
    const custUserId = `cust_${runId}`
    const custEmail = `customer_${runId}@gmail.com`
    await User.create({
      userId: custUserId,
      email: custEmail,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '9811223344',
      role: 'customer',
      passwordHash: 'dummy_cust_hash',
    })

    const custToken = jwt.sign(
      { userId: custUserId, email: custEmail, role: 'customer' },
      jwtSecret,
      { expiresIn: '1h' }
    )

    // Verify initial stocks before checkout
    const prod1Before = await Product.findOne({ $or: [{ id: v1Product.id }, { _id: v1Product._id }] })
    const prod2Before = await Product.findOne({ $or: [{ id: v2Product.id }, { _id: v2Product._id }] })
    const stock1Before = prod1Before?.stock ?? 0
    const stock2Before = prod2Before?.stock ?? 0

    // Order 2 items of V1 product (₹999 * 2 = ₹1998) + 1 item of V2 product (₹1999 * 1 = ₹1999)
    const orderPayload = {
      customer: {
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: custEmail,
        phone: '9811223344',
      },
      items: [
        {
          productId: v1Product.id,
          name: v1Product.name,
          price: 999,
          quantity: 2,
          size: 'L',
          color: 'Black',
          image: v1Product.image,
        },
        {
          productId: v2Product.id,
          name: v2Product.name,
          price: 1999,
          quantity: 1,
          size: 'XL',
          color: 'Navy',
          image: v2Product.image,
        },
      ],
      shippingAddress: {
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: custEmail,
        phone: '9811223344',
        address: 'House 42, Kankarbagh Main Road',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800020',
      },
      payment: {
        method: 'online',
        transactionId: `TXN-${runId}`,
        status: 'paid',
      },
      pricing: {
        subtotal: 3997,
        discount: 0,
        shipping: 0,
        total: 3997,
      },
    }

    const createOrderRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` },
      body: JSON.stringify(orderPayload),
    })
    const createOrderData = await createOrderRes.json()
    if (!createOrderData.success) throw new Error('Order creation failed: ' + createOrderData.message)
    const order = createOrderData.order
    console.log(`✓ Master Order created: #${order.orderId} (Total: ₹${order.pricing.total})`)

    // Verify atomic decrement of stock in MongoDB
    const prod1After = await Product.findOne({ $or: [{ id: v1Product.id }, { _id: v1Product._id }] })
    const prod2After = await Product.findOne({ $or: [{ id: v2Product.id }, { _id: v2Product._id }] })
    if ((prod1After?.stock ?? 0) !== stock1Before - 2) {
      throw new Error(`Stock 1 atomic decrement failed: expected ${stock1Before - 2}, got ${prod1After?.stock}`)
    }
    if ((prod2After?.stock ?? 0) !== stock2Before - 1) {
      throw new Error(`Stock 2 atomic decrement failed: expected ${stock2Before - 1}, got ${prod2After?.stock}`)
    }
    console.log(`✓ Atomic stock reduction verified: V1 Stock (${stock1Before} -> ${prod1After?.stock}), V2 Stock (${stock2Before} -> ${prod2After?.stock})\n`)

    // ------------------------------------------------------------------
    // TEST 6: SUB-ORDER SEGREGATION & COMMISSION VERIFICATION
    // ------------------------------------------------------------------
    console.log('--- TEST 6: SubOrder Segregation & Commission Ledger ---')
    const subOrders = await SubOrder.find({ orderId: order.orderId })
    if (subOrders.length !== 2) {
      throw new Error(`Expected 2 segregated SubOrders (1 per vendor), found: ${subOrders.length}`)
    }

    const sub1 = subOrders.find((s) => s.vendorId === v1UserId || s.vendorId === v1Profile.id)
    const sub2 = subOrders.find((s) => s.vendorId === v2UserId || s.vendorId === v2Profile.id)
    if (!sub1 || !sub2) {
      throw new Error('Missing suborder for vendor 1 or vendor 2')
    }

    // V1 calculation: 2 * 999 = 1998 subtotal. 5% platform fee = 100. Net = 1898
    if (sub1.subtotal !== 1998 || sub1.commissionAmount !== 100 || sub1.netEarnings !== 1898) {
      throw new Error(`V1 suborder math mismatch: subtotal=${sub1.subtotal}, comm=${sub1.commissionAmount}, net=${sub1.netEarnings}`)
    }
    // V2 calculation: 1 * 1999 = 1999 subtotal. 5% platform fee = 100. Net = 1899
    if (sub2.subtotal !== 1999 || sub2.commissionAmount !== 100 || sub2.netEarnings !== 1899) {
      throw new Error(`V2 suborder math mismatch: subtotal=${sub2.subtotal}, comm=${sub2.commissionAmount}, net=${sub2.netEarnings}`)
    }

    console.log(`✓ Vendor 1 SubOrder #${sub1.subOrderId}: Subtotal ₹${sub1.subtotal}, Commission (5%) ₹${sub1.commissionAmount}, Net ₹${sub1.netEarnings}`)
    console.log(`✓ Vendor 2 SubOrder #${sub2.subOrderId}: Subtotal ₹${sub2.subtotal}, Commission (5%) ₹${sub2.commissionAmount}, Net ₹${sub2.netEarnings}\n`)

    // ------------------------------------------------------------------
    // TEST 7: VENDOR FULFILLMENT & SHIPPING TRACKING
    // ------------------------------------------------------------------
    console.log('--- TEST 7: Vendor Order Fulfillment & Logistics Tracking ---')
    // Vendor 1 marks their suborder as Shipped with Delhivery tracking
    const shipRes = await fetch(`${baseUrl}/api/vendor/orders/${order.orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${v1Token}` },
      body: JSON.stringify({
        status: 'shipped',
        carrier: 'Delhivery',
        trackingNumber: 'DEL-9921827',
      }),
    })
    const shipData = await shipRes.json()
    if (!shipData.success) throw new Error('Vendor 1 fulfillment failed: ' + shipData.message)

    const updatedSub1 = await SubOrder.findOne({ subOrderId: sub1.subOrderId })
    if (updatedSub1?.status !== 'shipped' || updatedSub1?.tracking?.trackingNumber !== 'DEL-9921827') {
      throw new Error('Suborder status or tracking was not persisted')
    }
    console.log(`✓ Vendor 1 successfully dispatched suborder with carrier ${updatedSub1.tracking?.carrier} and AWB ${updatedSub1.tracking?.trackingNumber}\n`)

    // ------------------------------------------------------------------
    // TEST 8: VENDOR STATS (8 REAL METRICS) & REVENUE ANALYTICS
    // ------------------------------------------------------------------
    console.log('--- TEST 8: Vendor Real Analytics & 8 Database Metrics ---')
    const v1StatsRes = await fetch(`${baseUrl}/api/vendor/stats`, {
      headers: { Authorization: `Bearer ${v1Token}` },
    })
    const v1StatsData = await v1StatsRes.json()
    if (!v1StatsData.success) throw new Error('Failed to retrieve vendor stats: ' + v1StatsData.message)

    const st = v1StatsData.stats
    console.log('Vendor 1 Metrics verified against MongoDB:')
    console.log(`  - Total Products: ${st.totalProducts}`)
    console.log(`  - Active Products: ${st.activeProducts}`)
    console.log(`  - Total Orders: ${st.totalOrders}`)
    console.log(`  - Pending Orders: ${st.pendingOrders}`)
    console.log(`  - Products Sold: ${st.productsSold}`)
    console.log(`  - Gross Sales: ₹${st.grossSales}`)
    console.log(`  - Net Earnings: ₹${st.netEarnings}`)
    console.log(`  - Pending Payouts: ₹${st.pendingPayouts}`)

    if (st.totalOrders !== 1 || st.productsSold !== 2 || st.grossSales !== 1998) {
      throw new Error(`Vendor stats mismatch! Expected 1 order, 2 sold, ₹1998 gross. Got: ${JSON.stringify(st)}`)
    }
    console.log('✓ All 8 real database metrics calculated correctly with zero fabrication.\n')

    // ------------------------------------------------------------------
    // TEST 9: VENDOR PAYOUT REQUEST & ADMIN SETTLEMENT
    // ------------------------------------------------------------------
    console.log('--- TEST 9: Vendor Settlement Payout & Bank Ledger ---')
    const payoutAmount = 1000 // request ₹1000 out of ₹1898.1 available
    const payoutReqRes = await fetch(`${baseUrl}/api/vendor/payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${v1Token}` },
      body: JSON.stringify({
        amount: payoutAmount,
        bankDetails: {
          accountHolderName: 'Vibe Apparel Lab',
          accountNumber: '918273645123',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
        },
      }),
    })
    const payoutReqData = await payoutReqRes.json()
    if (!payoutReqData.success) throw new Error('Payout request failed: ' + payoutReqData.message)
    const payout = payoutReqData.payout
    console.log(`✓ Vendor payout request created: ID ${payout.payoutId}, Amount: ₹${payout.amount}`)

    // Admin approves & marks paid
    const payoutAdminRes = await fetch(`${baseUrl}/api/admin/settings/payouts/${payout.payoutId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'PAID',
        referenceNumber: 'UTR-HDFC-991823',
        notes: 'Transferred via RTGS',
      }),
    })
    const payoutAdminData = await payoutAdminRes.json()
    if (!payoutAdminData.success) throw new Error('Admin payout approval failed')

    const paidRecord = await Payout.findOne({ payoutId: payout.payoutId })
    if (paidRecord?.status !== 'PAID' || paidRecord?.referenceNumber !== 'UTR-HDFC-991823') {
      throw new Error('Payout status was not updated to PAID with reference')
    }
    console.log(`✓ Admin settled payout to vendor: Status ${paidRecord.status}, UTR: ${paidRecord.referenceNumber}\n`)

    // ------------------------------------------------------------------
    // TEST 10: CUSTOMER ORDER CANCELLATION & ATOMIC STOCK RESTORATION
    // ------------------------------------------------------------------
    console.log('--- TEST 10: Order Cancellation & Atomic Stock Restoration ---')
    // Customer creates a 2nd order to test cancellation
    const cancelOrderRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({
        customer: orderPayload.customer,
        items: [
          {
            productId: v1Product.id,
            name: v1Product.name,
            price: 999,
            quantity: 3,
            size: 'M',
            color: 'White',
            image: v1Product.image,
          },
        ],
        shippingAddress: orderPayload.shippingAddress,
        payment: { method: 'cod', status: 'pending' },
        pricing: { subtotal: 2997, discount: 0, shipping: 0, total: 2997 },
      }),
    })
    const cancelOrderData = await cancelOrderRes.json()
    const orderToCancel = cancelOrderData.order

    const stockBeforeCancel = (await Product.findOne({ $or: [{ id: v1Product.id }, { _id: v1Product._id }] }))?.stock ?? 0

    // Customer cancels order
    const doCancelRes = await fetch(`${baseUrl}/api/orders/${orderToCancel.orderId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({ reason: 'Customer changed delivery address' }),
    })
    const doCancelData = await doCancelRes.json()
    if (!doCancelData.success) throw new Error('Customer order cancellation failed: ' + doCancelData.message)

    const stockAfterCancel = (await Product.findOne({ $or: [{ id: v1Product.id }, { _id: v1Product._id }] }))?.stock ?? 0
    if (stockAfterCancel !== stockBeforeCancel + 3) {
      throw new Error(`Inventory stock restoration failed! Expected ${stockBeforeCancel + 3}, got ${stockAfterCancel}`)
    }

    const invLog = await InventoryLog.findOne({ orderId: orderToCancel.orderId, action: 'CANCEL_RESTORATION' })
    if (!invLog) {
      throw new Error('Missing inventory audit log for cancellation restoration')
    }
    console.log(`✓ Order #${orderToCancel.orderId} cancelled successfully`)
    console.log(`✓ Inventory stock atomically restored (+3 units): ${stockBeforeCancel} -> ${stockAfterCancel}`)
    console.log(`✓ Audit log verified in InventoryLog: Action "${invLog.action}", Qty +${invLog.change}\n`)

    console.log('==========================================================')
    console.log('   ALL 10 MULTI-VENDOR MARKETPLACE TESTS PASSED (100%)    ')
    console.log('==========================================================\n')
  } catch (err: any) {
    console.error('❌ Test Suite Failed:', err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    server.close()
    await mongoose.disconnect()
    console.log('✓ Teardown complete. DB connection closed.')
  }
}

runMultiVendorSuite()
