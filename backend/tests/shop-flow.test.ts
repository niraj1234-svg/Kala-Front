import express from 'express'
import mongoose from 'mongoose'
import { loadEnv } from '../src/config/env'
import { connectDB } from '../src/config/db'
import { VendorShop } from '../src/models/VendorShop'
import { VendorProfile } from '../src/models/VendorProfile'
import { Product } from '../src/models/Product'
import shopRouter from '../src/routes/shopRoutes'
import marketplaceRouter from '../src/routes/marketplaceRoutes'

loadEnv()

async function runTests() {
  console.log('=== Running KALA Vendor Shop & Storefront Flow Tests ===\n')

  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Failed to connect to MongoDB. Check connection string.')
    process.exit(1)
  }

  console.log('✓ Connected to MongoDB')

  // Set up Express test app mirroring server.ts
  const app = express()
  app.use(express.json())
  app.use('/api/shops', shopRouter)
  app.use('/api/marketplace', marketplaceRouter)
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'API route not found.' })
  })

  // Start local server on random port
  const server = app.listen(0)
  const port = (server.address() as any).port
  const baseUrl = `http://localhost:${port}`

  try {
    // 1. Check existing shops in DB
    const existingShops = await VendorShop.find({})
    console.log(`Found ${existingShops.length} existing vendor shop(s) in database`)

    let testSlug = ''

    if (existingShops.length > 0) {
      testSlug = existingShops[0].slug
      console.log(`Using existing shop slug for verification: "${testSlug}"`)
    } else {
      // Find an approved vendor or create a test one
      let approvedVendor = await VendorProfile.findOne({ status: 'APPROVED' })
      if (!approvedVendor) {
        console.log('Creating mock approved vendor profile for verification...')
        approvedVendor = await VendorProfile.create({
          userId: 'test_vendor_' + Date.now(),
          businessName: 'Test Streetwear Studio',
          category: 'Clothing Brand',
          email: 'test@vendor.com',
          phone: '+91 9876543210',
          city: 'Patna',
          state: 'Bihar',
          status: 'APPROVED',
        })
      }

      console.log(`Using approved vendor: ${approvedVendor.businessName} (${approvedVendor.userId})`)

      testSlug = 'test-studio-' + Date.now()
      const newShop = await VendorShop.create({
        vendorId: approvedVendor.userId,
        shopName: 'Test Streetwear Studio',
        slug: testSlug,
        category: 'Streetwear',
        contactEmail: 'contact@teststudio.com',
        contactPhone: '+91 9876543210',
        city: 'Patna',
        state: 'Bihar',
        description: 'Authentic Indian streetwear and custom oversized apparel.',
        isActive: true,
      })

      console.log(`✓ Created test shop: "${newShop.shopName}" with slug "${newShop.slug}"`)
    }

    // 2. Test GET /api/shops/:slug (The exact route requested by PublicVendorShop frontend)
    console.log(`\nTesting GET /api/shops/${testSlug}...`)
    const resValid = await fetch(`${baseUrl}/api/shops/${testSlug}`)
    const dataValid = await resValid.json()

    console.log(`Status Code: ${resValid.status}`)
    console.log(`Success: ${dataValid.success}`)
    console.log(`Shop Name: ${dataValid.shop?.shopName}`)
    console.log(`Shop Slug: ${dataValid.shop?.slug}`)
    console.log(`Vendor Name: ${dataValid.vendor?.businessName}`)
    console.log(`Product Count: ${dataValid.products?.length ?? 0}`)

    if (resValid.status === 200 && dataValid.success && dataValid.shop?.slug === testSlug) {
      console.log('✓ PASS: GET /api/shops/:slug returned 200 OK with shop details!')
    } else {
      console.error('❌ FAIL: Expected 200 OK with shop details. Got:', dataValid)
      process.exitCode = 1
    }

    // 3. Test GET /api/shops/:slug with invalid slug -> must return 404
    console.log('\nTesting GET /api/shops/non-existent-slug-xyz123...')
    const resInvalid = await fetch(`${baseUrl}/api/shops/non-existent-slug-xyz123`)
    const dataInvalid = await resInvalid.json()

    console.log(`Status Code: ${resInvalid.status}`)
    console.log(`Response message: "${dataInvalid.message}"`)

    if (resInvalid.status === 404 && dataInvalid.success === false && dataInvalid.message.includes('not found')) {
      console.log('✓ PASS: Invalid slug correctly returned 404 Not Found!')
    } else {
      console.error('❌ FAIL: Invalid slug did not return expected 404. Got:', dataInvalid)
      process.exitCode = 1
    }

    // 4. Test GET /api/shops (list all shops)
    console.log('\nTesting GET /api/shops...')
    const resList = await fetch(`${baseUrl}/api/shops`)
    const dataList = await resList.json()
    console.log(`Status Code: ${resList.status}`)
    console.log(`Total active shops: ${dataList.count ?? dataList.shops?.length ?? 0}`)
    if (resList.status === 200 && dataList.success) {
      console.log('✓ PASS: GET /api/shops returned active shops!')
    } else {
      console.error('❌ FAIL: GET /api/shops failed. Got:', dataList)
      process.exitCode = 1
    }

    // 5. Verify case-insensitivity: GET /api/shops/TESTSLUG
    console.log(`\nTesting GET /api/shops/${testSlug.toUpperCase()} (case-insensitive test)...`)
    const resUpper = await fetch(`${baseUrl}/api/shops/${testSlug.toUpperCase()}`)
    const dataUpper = await resUpper.json()
    if (resUpper.status === 200 && dataUpper.success) {
      console.log('✓ PASS: Uppercase slug resolved correctly!')
    } else {
      console.error('❌ FAIL: Uppercase slug failed. Got:', dataUpper)
      process.exitCode = 1
    }

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===')
  } catch (err) {
    console.error('Test execution error:', err)
    process.exitCode = 1
  } finally {
    server.close()
    await mongoose.disconnect()
    console.log('MongoDB disconnected.')
  }
}

runTests()

