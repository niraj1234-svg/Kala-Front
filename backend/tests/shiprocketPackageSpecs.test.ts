import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateOrderPackageSpecs,
  normalizeProductWeightKg,
} from '../src/services/shipmentAutomationService'
import { isValidPincode } from '../src/services/shiprocketServiceabilityService'
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

  describe('2. Product Weight Normalization: normalizeProductWeightKg()', () => {
    it('normalizes gram-denominated weights (> 10) into kilograms', () => {
      // Standard apparel manufacturing specifications
      assert.equal(normalizeProductWeightKg(280), 0.28, '280g should normalize to 0.28kg')
      assert.equal(normalizeProductWeightKg(650), 0.65, '650g should normalize to 0.65kg')
      assert.equal(normalizeProductWeightKg(180), 0.18, '180g lightweight tee should normalize to 0.18kg')
      assert.equal(normalizeProductWeightKg(1200), 1.2, '1200g should normalize to 1.2kg')
      assert.equal(normalizeProductWeightKg('350'), 0.35, 'String "350" should normalize to 0.35kg')
    })

    it('preserves kilogram-denominated weights (0 < w <= 10)', () => {
      assert.equal(normalizeProductWeightKg(0.5), 0.5, '0.5kg should remain 0.5kg')
      assert.equal(normalizeProductWeightKg(0.8), 0.8, '0.8kg should remain 0.8kg')
      assert.equal(normalizeProductWeightKg(1.5), 1.5, '1.5kg should remain 1.5kg')
      assert.equal(normalizeProductWeightKg('0.75'), 0.75, 'String "0.75" should parse to 0.75kg')
      assert.equal(normalizeProductWeightKg(10), 10, '10kg boundary should remain 10kg')
    })

    it('returns undefined for missing, zero, negative, or invalid weights', () => {
      assert.equal(normalizeProductWeightKg(undefined), undefined, 'undefined returns undefined')
      assert.equal(normalizeProductWeightKg(null), undefined, 'null returns undefined')
      assert.equal(normalizeProductWeightKg(0), undefined, 'zero returns undefined')
      assert.equal(normalizeProductWeightKg(-0.5), undefined, 'negative weight returns undefined')
      assert.equal(normalizeProductWeightKg(-500), undefined, 'negative grams returns undefined')
      assert.equal(normalizeProductWeightKg('invalid'), undefined, 'non-numeric string returns undefined')
      assert.equal(normalizeProductWeightKg(NaN), undefined, 'NaN returns undefined')
      assert.equal(normalizeProductWeightKg(Infinity), undefined, 'Infinity returns undefined')
    })
  })

  describe('3. Shipment Package Specs Calculation: calculateOrderPackageSpecs()', () => {
    it('uses item.weightKg for single item orders', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-hoodie-01',
          name: 'Heavyweight Hoodie',
          image: '',
          size: 'L',
          quantity: 1,
          price: 1499,
          weightKg: 0.8,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.8, 'Single item weight should equal item weightKg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 3 })
    })

    it('correctly multiplies weightKg by item quantity', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-hoodie-01',
          name: 'Heavyweight Hoodie',
          image: '',
          size: 'L',
          quantity: 2,
          price: 1499,
          weightKg: 0.8,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.6, '2 items @ 0.8kg should equal 1.6kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 6 })
    })

    it('falls back to DEFAULT_SHIPMENT_WEIGHT_KG (0.5kg) when weightKg is missing', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-legacy-tee',
          name: 'Classic Tee',
          image: '',
          size: 'M',
          quantity: 1,
          price: 499,
          // weightKg is undefined
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.5, 'Missing weight should default to 0.5kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 3 })
    })

    it('handles multiple items with missing weights gracefully', () => {
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
          quantity: 1,
          price: 499,
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.0, '2 unweighted items should total 1.0kg (2 x 0.5kg)')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 6 })
    })

    it('handles mixed orders with both weighted and unweighted items', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-hoodie',
          name: 'Heavy Hoodie',
          image: '',
          size: 'XL',
          quantity: 1,
          price: 1599,
          weightKg: 0.8,
        },
        {
          productId: 'prod-tee',
          name: 'Standard Tee',
          image: '',
          size: 'M',
          quantity: 2,
          price: 499,
          weightKg: 0.3,
        },
      ]

      // 1 x 0.8kg + 2 x 0.3kg = 1.4kg
      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.4, 'Mixed order weight should be 1.4kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 9 })
    })

    it('supports custom apparel orders with safe fallback', () => {
      const items: IOrderItem[] = [
        {
          productId: 'custom-tshirt',
          name: 'KALA Custom Apparel - T-Shirt',
          image: 'https://cdn.kala.com/custom.png',
          size: 'L',
          quantity: 1,
          price: 549,
          customization: {
            apparelType: 't-shirt',
            color: 'black',
            position: 'front',
            frontText: 'Custom KALA Studio',
          },
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.5, 'Custom apparel without explicit weightKg defaults to 0.5kg')
      assert.deepEqual(specs.dimensions, { length: 25, breadth: 20, height: 3 })
    })

    it('clamps lightweight items to MIN_SHIPMENT_WEIGHT_KG (0.1kg)', () => {
      const items: IOrderItem[] = [
        {
          productId: 'prod-sticker-pack',
          name: 'Stickers',
          image: '',
          size: 'FREE SIZE',
          quantity: 1,
          price: 99,
          weightKg: 0.05, // Below 0.1kg
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
          weightKg: 0.8, // 20 * 0.8 = 16.0kg
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 10.0, 'Overweight orders must clamp to 10.0kg')
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
          weightKg: 0.3,
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

    it('safely handles corrupt quantity values without NaN or infinite values', () => {
      const corruptItems: any[] = [
        {
          productId: 'prod-corrupt',
          name: 'Corrupt',
          image: '',
          size: 'M',
          quantity: 'invalid',
          price: 499,
          weightKg: 0.6,
        },
      ]

      const specs = calculateOrderPackageSpecs(corruptItems)
      assert.equal(specs.weightKg, 0.6, 'Should default invalid quantity to 1 and compute 0.6kg')
      assert.equal(specs.dimensions.height, 3, 'Should compute height for 1 unit')
    })
  })
})
