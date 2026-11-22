import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateOrderPackageSpecs,
  normalizeProductWeightKg,
} from '../src/services/shipmentAutomationService'
import { isValidPincode } from '../src/services/shiprocketServiceabilityService'
import { PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS } from '../src/controllers/orderController'
import { IOrderItem } from '../src/models/Order'

describe('Shiprocket Package Intelligence & PIN Validation Suite', () => {
  describe('1. Postal Code (PIN) Validation: isValidPincode()', () => {
    it('accepts valid 6-digit Indian PIN codes', () => {
      assert.equal(isValidPincode('495004'), true, 'Bilaspur pickup PIN should be valid')
      assert.equal(isValidPincode('110001'), true, 'Delhi PIN should be valid')
      assert.equal(isValidPincode('400001'), true, 'Mumbai PIN should be valid')
      assert.equal(isValidPincode('560001'), true, 'Bangalore PIN should be valid')
      assert.equal(isValidPincode('700001'), true, 'Kolkata PIN should be valid')
    })

    it('accepts valid 6-digit PIN with surrounding whitespace', () => {
      assert.equal(isValidPincode('  495004  '), true, 'Should trim surrounding spaces')
      assert.equal(isValidPincode('\t110001\n'), true, 'Should trim tabs and newlines')
    })

    it('rejects PIN codes with invalid lengths', () => {
      assert.equal(isValidPincode(''), false, 'Empty string should be invalid')
      assert.equal(isValidPincode('4950'), false, '4-digit PIN should be invalid')
      assert.equal(isValidPincode('49500'), false, '5-digit PIN should be invalid')
      assert.equal(isValidPincode('4950041'), false, '7-digit PIN should be invalid')
      assert.equal(isValidPincode('12345678'), false, '8-digit PIN should be invalid')
    })

    it('rejects PIN codes containing non-numeric characters', () => {
      assert.equal(isValidPincode('49500A'), false, 'Alphanumeric PIN should be invalid')
      assert.equal(isValidPincode('ABCDEF'), false, 'Alphabetical PIN should be invalid')
      assert.equal(isValidPincode('495-004'), false, 'Hyphenated PIN should be invalid')
      assert.equal(isValidPincode('495 004'), false, 'Internal space PIN should be invalid')
      assert.equal(isValidPincode('495.004'), false, 'Dot PIN should be invalid')
    })

    it('rejects null, undefined, or non-string inputs safely', () => {
      assert.equal(isValidPincode(null), false, 'null should be invalid')
      assert.equal(isValidPincode(undefined), false, 'undefined should be invalid')
      assert.equal(isValidPincode('   '), false, 'Whitespace-only string should be invalid')
    })
  })

  describe('2. Weight Normalization & Standardization: normalizeProductWeightKg()', () => {
    it('normalizes standard finished garment weights in grams into kilograms', () => {
      assert.equal(normalizeProductWeightKg(180), 0.18, '180g lightweight tee -> 0.18kg')
      assert.equal(normalizeProductWeightKg(250), 0.25, '250g custom/standard tee -> 0.25kg')
      assert.equal(normalizeProductWeightKg(280), 0.28, '280g heavyweight oversized tee -> 0.28kg')
      assert.equal(normalizeProductWeightKg(650), 0.65, '650g fleece hoodie -> 0.65kg')
      assert.equal(normalizeProductWeightKg(700), 0.70, '700g heavyweight custom hoodie -> 0.70kg')
      assert.equal(normalizeProductWeightKg(1200), 1.2, '1200g heavy outerwear -> 1.2kg')
    })

    it('preserves decimal kilogram weights (0 < w <= 10)', () => {
      assert.equal(normalizeProductWeightKg(0.18), 0.18, '0.18kg remains 0.18kg')
      assert.equal(normalizeProductWeightKg(0.25), 0.25, '0.25kg remains 0.25kg')
      assert.equal(normalizeProductWeightKg(0.5), 0.5, '0.5kg remains 0.5kg')
      assert.equal(normalizeProductWeightKg(0.7), 0.7, '0.7kg remains 0.7kg')
      assert.equal(normalizeProductWeightKg('0.8'), 0.8, 'String "0.8" parses to 0.8kg')
      assert.equal(normalizeProductWeightKg(10), 10, '10kg boundary remains 10kg')
    })

    it('returns undefined for missing, zero, negative, or invalid weights', () => {
      assert.equal(normalizeProductWeightKg(undefined), undefined, 'undefined returns undefined')
      assert.equal(normalizeProductWeightKg(null), undefined, 'null returns undefined')
      assert.equal(normalizeProductWeightKg(0), undefined, 'zero returns undefined')
      assert.equal(normalizeProductWeightKg(-50), undefined, 'negative grams returns undefined')
      assert.equal(normalizeProductWeightKg(-0.5), undefined, 'negative kg returns undefined')
      assert.equal(normalizeProductWeightKg('invalid'), undefined, 'non-numeric string returns undefined')
      assert.equal(normalizeProductWeightKg(NaN), undefined, 'NaN returns undefined')
      assert.equal(normalizeProductWeightKg(Infinity), undefined, 'Infinity returns undefined')
    })

    it('confirms GSM in product descriptions never influences normalized product weight', () => {
      // In KALA catalog, description might say "Heavyweight 450 GSM French Terry"
      // But only the numeric finished garment weight (e.g. 650g) is normalized
      const productWithGsmText = {
        name: 'Oversized Tee',
        description: 'Made with 240 GSM combed cotton.',
        weight: 280, // finished garment weight in grams
      }

      // Weight normalization uses product.weight ONLY, never regex parsing of GSM description
      const weightKg = normalizeProductWeightKg(productWithGsmText.weight)
      assert.equal(weightKg, 0.28, 'Normalized weight must be 0.28kg (from 280g), NOT 0.24kg (from 240 GSM)')
    })
  })

  describe('3. Custom Apparel Provisional Weight Defaults', () => {
    it('provides correct provisional defaults in grams for all custom apparel types', () => {
      assert.equal(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-t-shirt'], 250, 'Custom T-shirt default is 250g')
      assert.equal(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-tshirt'], 250)
      assert.equal(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-hoodie'], 700, 'Custom Hoodie default is 700g')
      assert.equal(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-jersey'], 200, 'Custom Jersey default is 200g')
      assert.equal(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['bulk-tshirt'], 250, 'Bulk T-shirt default is 250g')
    })

    it('normalizes custom apparel provisional weights into exact kilograms', () => {
      const teeKg = normalizeProductWeightKg(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-t-shirt'])
      const hoodieKg = normalizeProductWeightKg(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-hoodie'])
      const jerseyKg = normalizeProductWeightKg(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['custom-jersey'])
      const bulkTeeKg = normalizeProductWeightKg(PROVISIONAL_CUSTOM_APPAREL_WEIGHTS_GRAMS['bulk-tshirt'])

      assert.equal(teeKg, 0.25, 'Custom T-shirt must normalize to 0.25kg')
      assert.equal(hoodieKg, 0.70, 'Custom Hoodie must normalize to 0.70kg')
      assert.equal(jerseyKg, 0.20, 'Custom Jersey must normalize to 0.20kg')
      assert.equal(bulkTeeKg, 0.25, 'Bulk T-shirt must normalize to 0.25kg per unit')
    })
  })

  describe('4. Shipment Package Specs Calculation: calculateOrderPackageSpecs()', () => {
    it('uses item.weightKg for single item orders', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-tee-01',
          name: 'Heavyweight Tee',
          image: '',
          size: 'L',
          quantity: 1,
          price: 999,
          weightKg: 0.28,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.28, 'Single item weight should equal item weightKg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 3 })
    })

    it('correctly multiplies weightKg by item quantity once', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-hoodie-01',
          name: 'Heavyweight Hoodie',
          image: '',
          size: 'L',
          quantity: 2,
          price: 1999,
          weightKg: 0.65,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.30, '2 hoodies @ 0.65kg should equal 1.30kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 6 })
    })

    it('correctly handles bulk apparel orders (e.g. 5 bulk tees @ 0.25kg = 1.25kg)', () => {
      const items: IOrderItem[] = [
        {
          productId: 'bulk-tshirt',
          name: 'KALA Custom T-Shirt (Bulk)',
          image: '',
          size: 'BULK',
          quantity: 5,
          price: 175,
          weightKg: 0.25,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.25, '5 bulk tees @ 0.25kg = 1.25kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 15 }, '5 units * 3cm = 15cm height')
    })

    it('falls back to DEFAULT_SHIPMENT_WEIGHT_KG (0.5kg) when weightKg is missing (historical orders)', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-legacy-tee',
          name: 'Classic Tee',
          image: '',
          size: 'M',
          quantity: 1,
          price: 499,
          // weightKg is undefined (historical order)
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.5, 'Missing weight must default to 0.5kg for backward compatibility')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 3 })
    })

    it('handles multiple historical items with missing weights gracefully', () => {
      const items: IOrderItem[] = [
        {
          productId: 'item-1',
          name: 'Item 1',
          image: '',
          size: 'M',
          quantity: 1,
          price: 399,
        },
        {
          productId: 'item-2',
          name: 'Item 2',
          image: '',
          size: 'L',
          quantity: 2,
          price: 499,
        },
      ]

      // 1 item + 2 items = 3 units -> 3 * 0.5kg = 1.5kg
      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.5, '3 unweighted items should total 1.5kg (3 x 0.5kg)')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 9 })
    })

    it('handles mixed orders with both weighted and unweighted items', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-hoodie',
          name: 'Custom Hoodie',
          image: '',
          size: 'XL',
          quantity: 1,
          price: 699,
          weightKg: 0.70, // 0.70kg
        },
        {
          productId: 'prod-tee',
          name: 'Standard Tee',
          image: '',
          size: 'M',
          quantity: 2,
          price: 499,
          weightKg: 0.25, // 2 * 0.25 = 0.50kg
        },
        {
          productId: 'prod-unweighted',
          name: 'Legacy Product',
          image: '',
          size: 'S',
          quantity: 1,
          price: 299,
          // unweighted -> 0.50kg fallback
        },
      ]

      // Total = 0.70 + 0.50 + 0.50 = 1.70kg. Total units = 1 + 2 + 1 = 4 units -> height 12cm
      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.70, 'Mixed order weight should be 1.70kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 12 })
    })

    it('clamps lightweight items to MIN_SHIPMENT_WEIGHT_KG (0.1kg)', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-sticker',
          name: 'Sticker',
          image: '',
          size: 'FREE SIZE',
          quantity: 1,
          price: 49,
          weightKg: 0.04,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.1, 'Weight below 0.1kg must clamp to MIN_SHIPMENT_WEIGHT_KG (0.1kg)')
    })

    it('clamps heavy orders to 10.0kg maximum package weight', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-hoodie',
          name: 'Heavy Hoodie',
          image: '',
          size: 'XL',
          quantity: 20,
          price: 1999,
          weightKg: 0.70, // 20 * 0.70 = 14.0kg
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 10.0, 'Orders exceeding 10kg must clamp to 10.0kg')
    })

    it('caps mailer bag height at 30cm maximum', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-tee',
          name: 'T-Shirt',
          image: '',
          size: 'M',
          quantity: 15, // 15 * 3cm = 45cm -> capped at 30cm
          price: 499,
          weightKg: 0.25,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.dimensions.height, 30, 'Package height must be capped at 30cm')
    })

    it('safely handles empty array or undefined input without crashing', () => {
      const emptySpecs = calculateOrderPackageSpecs([])
      assert.equal(emptySpecs.weightKg, 0.1, 'Empty array clamps to 0.1kg')
      assert.deepEqual(emptySpecs.dimensions, { length: 25, breadth: 20, height: 3 })

      const undefSpecs = calculateOrderPackageSpecs(undefined)
      assert.equal(undefSpecs.weightKg, 0.1, 'Undefined items clamps to 0.1kg')
      assert.deepEqual(undefSpecs.dimensions, { length: 25, breadth: 20, height: 3 })
    })
  })
})
