import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { Request, Response } from 'express'
import { createAdminProduct, updateAdminProduct } from '../src/controllers/adminProductController'
import { createVendorProduct, updateVendorProduct } from '../src/controllers/vendorController'
import { Product } from '../src/models/Product'
import { VendorProfile } from '../src/models/VendorProfile'
import { VendorShop } from '../src/models/VendorShop'

// Helper to create mock Express Req/Res
function createMockReqRes(body: any = {}, params: any = {}, user: any = undefined) {
  let statusCode = 200
  let responseData: any = null

  const req = {
    body,
    params,
    user,
    headers: {},
  } as unknown as Request

  const res = {
    status(code: number) {
      statusCode = code
      return this
    },
    json(data: any) {
      responseData = data
      return this
    },
  } as unknown as Response

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData,
  }
}

describe('Product Weight Management & Controller Validation Suite', () => {
  const origFindOne = Product.findOne
  const origCreate = Product.create
  const origFindByIdAndUpdate = Product.findByIdAndUpdate
  const origVendorProfile = VendorProfile.findOne
  const origVendorShop = VendorShop.findOne

  afterEach(() => {
    Product.findOne = origFindOne
    Product.create = origCreate
    Product.findByIdAndUpdate = origFindByIdAndUpdate
    VendorProfile.findOne = origVendorProfile
    VendorShop.findOne = origVendorShop
  })

  describe('1. Admin Product Weight Management', () => {
    it('creates an admin product with valid finished garment weight (in grams)', async () => {
      Product.findOne = (async () => null) as any
      let createdPayload: any = null
      Product.create = (async (doc: any) => {
        createdPayload = doc
        return { ...doc, _id: 'mock_mongo_id_1' }
      }) as any

      const mock = createMockReqRes({
        id: `test-admin-tee-${Date.now()}`,
        name: 'Admin Test Tee 280g',
        category: 'Streetwear',
        price: 999,
        image: 'Streetwear 01.png',
        description: 'Test tee with finished weight 280 grams',
        available: true,
        weight: 280,
      })

      await createAdminProduct(mock.req, mock.res)

      assert.equal(mock.getStatus(), 201, 'Should return HTTP 201 Created')
      assert.equal(mock.getData()?.success, true)
      assert.equal(createdPayload?.weight, 280, 'Created product must persist weight: 280')
    })

    it('creates an admin product without weight (optional backward compatibility)', async () => {
      Product.findOne = (async () => null) as any
      let createdPayload: any = null
      Product.create = (async (doc: any) => {
        createdPayload = doc
        return { ...doc, _id: 'mock_mongo_id_2' }
      }) as any

      const mock = createMockReqRes({
        id: `test-admin-tee-noweight-${Date.now()}`,
        name: 'Admin Test Tee Unweighted',
        category: 'Streetwear',
        price: 899,
        image: 'Streetwear 01.png',
        description: 'Test tee with no weight provided',
        available: true,
      })

      await createAdminProduct(mock.req, mock.res)

      assert.equal(mock.getStatus(), 201)
      assert.equal(createdPayload?.weight, undefined, 'Weight should remain undefined when not provided')
    })

    it('rejects negative or invalid weight in admin product creation', async () => {
      Product.findOne = (async () => null) as any

      const mockNeg = createMockReqRes({
        name: 'Invalid Negative Tee',
        category: 'Streetwear',
        price: 999,
        image: 'Streetwear 01.png',
        description: 'Desc',
        weight: -50,
      })
      await createAdminProduct(mockNeg.req, mockNeg.res)
      assert.equal(mockNeg.getStatus(), 400, 'Negative weight must return HTTP 400')
      assert.match(mockNeg.getData()?.message, /valid positive number in grams/)

      const mockZero = createMockReqRes({
        name: 'Invalid Zero Tee',
        category: 'Streetwear',
        price: 999,
        image: 'Streetwear 01.png',
        description: 'Desc',
        weight: 0,
      })
      await createAdminProduct(mockZero.req, mockZero.res)
      assert.equal(mockZero.getStatus(), 400, 'Zero weight must return HTTP 400')

      const mockNaN = createMockReqRes({
        name: 'Invalid NaN Tee',
        category: 'Streetwear',
        price: 999,
        image: 'Streetwear 01.png',
        description: 'Desc',
        weight: 'invalid_weight',
      })
      await createAdminProduct(mockNaN.req, mockNaN.res)
      assert.equal(mockNaN.getStatus(), 400, 'Non-numeric weight must return HTTP 400')
    })

    it('updates an existing admin product weight and clears weight with null', async () => {
      Product.findOne = (async () => ({ _id: 'mock_prod_1', id: 'existing-tee', weight: 280 })) as any

      // Test update weight
      let updateDoc: any = null
      Product.findByIdAndUpdate = (async (_id: any, doc: any) => {
        updateDoc = doc
        return { _id, id: 'existing-tee', weight: doc.$set?.weight }
      }) as any

      const mockUpdate = createMockReqRes({ weight: 350 }, { id: 'existing-tee' })
      await updateAdminProduct(mockUpdate.req, mockUpdate.res)

      assert.equal(mockUpdate.getStatus(), 200)
      assert.equal(updateDoc?.$set?.weight, 350, 'Updated weight must be set to 350g')

      // Test clearing weight (null)
      let unsetDoc: any = null
      Product.findByIdAndUpdate = (async (_id: any, doc: any) => {
        unsetDoc = doc
        return { _id, id: 'existing-tee' }
      }) as any

      const mockClear = createMockReqRes({ weight: null }, { id: 'existing-tee' })
      await updateAdminProduct(mockClear.req, mockClear.res)

      assert.equal(mockClear.getStatus(), 200)
      assert.equal(unsetDoc?.$unset?.weight, '', 'Clearing weight must use $unset for backward compatibility')
    })
  })

  describe('2. Vendor Product Weight Management', () => {
    it('creates a vendor product with finished garment weight while preserving approval status', async () => {
      VendorProfile.findOne = (async () => ({ status: 'APPROVED' })) as any
      VendorShop.findOne = (async () => ({ slug: 'my-shop' })) as any
      Product.findOne = (async () => null) as any

      let createdDoc: any = null
      Product.create = (async (doc: any) => {
        createdDoc = doc
        return { ...doc, _id: 'vendor_prod_1' }
      }) as any

      const mock = createMockReqRes(
        {
          name: 'Vendor Heavy Hoodie 650g',
          category: 'Streetwear',
          description: '450 GSM fleece hoodie weighing 650 grams',
          price: 1999,
          image: 'https://cdn.kala.com/hoodie.jpg',
          weight: 650,
        },
        {},
        { userId: 'vendor_user_123' }
      )

      await createVendorProduct(mock.req, mock.res)

      assert.equal(mock.getStatus(), 201)
      assert.equal(createdDoc?.weight, 650, 'Vendor product must store weight: 650')
      assert.equal(createdDoc?.approvalStatus, 'APPROVED', 'Approved vendor profile publishes product')
      assert.equal(createdDoc?.status, 'ACTIVE')
    })

    it('rejects invalid weight in vendor product creation', async () => {
      VendorProfile.findOne = (async () => ({ status: 'APPROVED' })) as any
      VendorShop.findOne = (async () => ({ slug: 'my-shop' })) as any
      Product.findOne = (async () => null) as any

      const mock = createMockReqRes(
        {
          name: 'Vendor Negative Weight Tee',
          category: 'Streetwear',
          description: 'Desc',
          price: 499,
          image: 'https://cdn.kala.com/tee.jpg',
          weight: -100,
        },
        {},
        { userId: 'vendor_user_123' }
      )

      await createVendorProduct(mock.req, mock.res)
      assert.equal(mock.getStatus(), 400)
      assert.match(mock.getData()?.message, /valid positive number in grams/)
    })

    it('updates vendor product weight and unsets when cleared', async () => {
      const mockProductInstance: any = {
        id: 'v-prod-1',
        vendorId: 'vendor_user_123',
        weight: 650,
        save: async function () {
          return this
        },
      }

      Product.findOne = (async () => mockProductInstance) as any

      // Update weight
      const mockUpdate = createMockReqRes({ weight: 700 }, { id: 'v-prod-1' }, { userId: 'vendor_user_123' })
      await updateVendorProduct(mockUpdate.req, mockUpdate.res)

      assert.equal(mockUpdate.getStatus(), 200)
      assert.equal(mockProductInstance.weight, 700, 'Weight should update to 700')

      // Clear weight
      const mockClear = createMockReqRes({ weight: '' }, { id: 'v-prod-1' }, { userId: 'vendor_user_123' })
      await updateVendorProduct(mockClear.req, mockClear.res)

      assert.equal(mockClear.getStatus(), 200)
      assert.equal(mockProductInstance.weight, undefined, 'Weight should be cleared to undefined')
    })
  })
})
