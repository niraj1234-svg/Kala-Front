import { Request, Response } from 'express'
import {
  checkCourierServiceability,
  isValidPincode,
  ServiceabilityOptions,
} from '../services/shiprocketServiceabilityService'

export interface PublicDeliveryEstimate {
  minEstimatedDays?: number
  maxEstimatedDays?: number
  estimatedDeliveryDate?: string
}

export interface PublicServiceabilityResponse {
  success: boolean
  status: 'serviceable' | 'unserviceable' | 'temporarily_unavailable' | 'invalid_input'
  serviceable: boolean
  pincode: string
  city?: string
  state?: string
  customerShippingCharge: number
  deliveryEstimate?: PublicDeliveryEstimate
  message: string
}

/**
 * Controller options hook for testing dependency injection (mock fetch).
 */
export interface ShippingControllerOptions {
  serviceOptions?: ServiceabilityOptions
}

let controllerOptions: ShippingControllerOptions = {}

export function setShippingControllerOptionsForTesting(opts: ShippingControllerOptions): void {
  controllerOptions = opts
}

export function resetShippingControllerOptionsForTesting(): void {
  controllerOptions = {}
}

/**
 * GET /api/shipping/serviceability
 *
 * Public query endpoint to check delivery serviceability and estimated delivery times
 * by 6-digit Indian PIN code.
 *
 * Security & Data Minimization:
 * - NEVER exposes internal courier costs, freight charges, or margins.
 * - NEVER exposes internal courier partner IDs, raw Shiprocket payloads, or vendor secrets.
 * - Customer shipping charge is strictly ₹0 (KALA free shipping policy).
 * - Outages or failures NEVER return serviceable=true.
 */
export const getServiceability = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPincode = req.query.pincode
    const rawWeight = req.query.weight

    // 1. Validate destination pincode presence
    if (!rawPincode || typeof rawPincode !== 'string') {
      res.status(400).json({
        success: false,
        status: 'invalid_input',
        serviceable: false,
        customerShippingCharge: 0,
        message: 'Invalid delivery pincode: Please provide a valid 6-digit Indian PIN code.',
      })
      return
    }

    const cleanPincode = rawPincode.trim()

    // 2. Validate standard 6-digit Indian PIN format
    if (!isValidPincode(cleanPincode)) {
      res.status(400).json({
        success: false,
        status: 'invalid_input',
        serviceable: false,
        pincode: cleanPincode,
        customerShippingCharge: 0,
        message: 'Invalid delivery pincode: Please provide a valid 6-digit Indian PIN code.',
      })
      return
    }

    // 3. Optional weight validation (bounds: 0.1kg - 1.0kg)
    // - Only accepted when a single string query parameter is provided.
    // - Strict numeric regex validation (rejects '0.5abc', '1.0kg', 'abc', empty string, arrays/objects).
    // - Preserves default weight (0.5kg) ONLY when weight is genuinely absent (undefined).
    let parsedWeight: number | undefined
    if (rawWeight !== undefined) {
      if (typeof rawWeight !== 'string') {
        res.status(400).json({
          success: false,
          status: 'invalid_input',
          serviceable: false,
          pincode: cleanPincode,
          customerShippingCharge: 0,
          message: 'Invalid shipment weight: Weight must be a single decimal number between 0.1kg and 1.0kg.',
        })
        return
      }

      const trimmedWeight = rawWeight.trim()
      if (!trimmedWeight || !/^\d+(?:\.\d+)?$/.test(trimmedWeight)) {
        res.status(400).json({
          success: false,
          status: 'invalid_input',
          serviceable: false,
          pincode: cleanPincode,
          customerShippingCharge: 0,
          message: 'Invalid shipment weight: Weight must be a valid numeric decimal without units (e.g. 0.5).',
        })
        return
      }

      const num = Number(trimmedWeight)
      if (!Number.isFinite(num) || num < 0.1 || num > 1.0) {
        res.status(400).json({
          success: false,
          status: 'invalid_input',
          serviceable: false,
          pincode: cleanPincode,
          customerShippingCharge: 0,
          message: 'Invalid shipment weight: Weight must be between 0.1kg and 1.0kg.',
        })
        return
      }
      parsedWeight = num
    }

    // 4. Delegate to underlying Shiprocket serviceability service
    const serviceResult = await checkCourierServiceability(
      cleanPincode,
      parsedWeight,
      controllerOptions.serviceOptions
    )

    // 5. Handle invalid input returned from service
    if (serviceResult.status === 'invalid_input') {
      res.status(400).json({
        success: false,
        status: 'invalid_input',
        serviceable: false,
        pincode: cleanPincode,
        customerShippingCharge: 0,
        message: serviceResult.message || 'Invalid delivery pincode or weight.',
      })
      return
    }

    // 6. Handle temporary outages, network errors, timeouts, or 5xx
    if (serviceResult.status === 'temporarily_unavailable' || !serviceResult.success) {
      res.status(503).json({
        success: false,
        status: 'temporarily_unavailable',
        serviceable: false,
        pincode: cleanPincode,
        customerShippingCharge: 0,
        message: 'Shipping serviceability service is temporarily unavailable. Please try again shortly.',
      })
      return
    }

    // 7. Handle unserviceable destination
    if (serviceResult.status === 'unserviceable' || !serviceResult.serviceable) {
      res.status(200).json({
        success: true,
        status: 'unserviceable',
        serviceable: false,
        pincode: cleanPincode,
        customerShippingCharge: 0,
        message: 'Delivery is currently unavailable for this pincode.',
      })
      return
    }

    // 8. Serviceable destination — Construct strictly sanitized public response DTO
    let deliveryEstimate: PublicDeliveryEstimate | undefined
    if (
      serviceResult.minEstimatedDays !== undefined ||
      serviceResult.maxEstimatedDays !== undefined ||
      serviceResult.estimatedDeliveryDate !== undefined
    ) {
      deliveryEstimate = {
        minEstimatedDays: serviceResult.minEstimatedDays,
        maxEstimatedDays: serviceResult.maxEstimatedDays,
        estimatedDeliveryDate: serviceResult.estimatedDeliveryDate,
      }
    }

    res.status(200).json({
      success: true,
      status: 'serviceable',
      serviceable: true,
      pincode: cleanPincode,
      city: serviceResult.city,
      state: serviceResult.state,
      customerShippingCharge: 0, // Free shipping invariant
      deliveryEstimate,
      message: 'Delivery is available for this pincode.',
    })
  } catch {
    res.status(503).json({
      success: false,
      status: 'temporarily_unavailable',
      serviceable: false,
      customerShippingCharge: 0,
      message: 'Shipping serviceability service is temporarily unavailable. Please try again shortly.',
    })
  }
}
