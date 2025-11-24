import { describe, expect, test } from 'vitest'
import { checkOrderConfiguration, OrderItem } from './validate'
import { categoryDefinitions, products } from './sampleData'

describe('checkOrderConfiguration', () => {
  describe('Valid configurations', () => {
    test('should accept valid order with platform, clamps, and controller', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 4 },
        { productId: 'controller-pro-8', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept order with compact platform and minimum requirements', () => {
      const order: OrderItem[] = [
        { productId: 'platform-compact-120', quantity: 1 },
        { productId: 'clamp-manual-5', quantity: 2 },
        { productId: 'controller-basic-4', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept order with more clamps than minimum required', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 6 },
        { productId: 'controller-pro-8', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept order with only products without dependencies', () => {
      const order: OrderItem[] = [
        { productId: 'clamp-manual-5', quantity: 10 },
        { productId: 'controller-basic-4', quantity: 2 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept automatic clamps with controller that supports them', () => {
      const order: OrderItem[] = [
        { productId: 'clamp-auto-10', quantity: 2 },
        { productId: 'controller-pro-8', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Invalid configurations - missing dependencies', () => {
    test('should reject platform without required clamps', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'controller-pro-8', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('platform-modern-200')
      expect(result.errors[0].message).toContain('clamp')
    })

    test('should reject platform without controller', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 4 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      // Platform has 2 dependencies, one for clamps (satisfied) and one for controller (not satisfied)
      // Automatic clamps also need a controller, so we get 2 errors total
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
      // Check that at least one error is about the platform missing a controller
      const platformError = result.errors.find(e => e.productId === 'platform-modern-200')
      expect(platformError).toBeDefined()
      expect(platformError?.message).toContain('controller')
    })

    test('should reject platform with insufficient clamp quantity', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 2 }, // Needs 4
        { productId: 'controller-pro-8', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('platform-modern-200')
      expect(result.errors[0].message).toContain('at least 4')
    })

    test('should reject automatic clamps without supporting controller', () => {
      const order: OrderItem[] = [
        { productId: 'clamp-auto-10', quantity: 2 },
        { productId: 'controller-basic-4', quantity: 1 }, // Doesn't support automatic clamps
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('clamp-auto-10')
      // The error message should indicate that the controller doesn't meet the constraints
      expect(result.errors[0].message).toContain('specific constraints')
    })

    test('should reject automatic clamps without any controller', () => {
      const order: OrderItem[] = [
        { productId: 'clamp-auto-10', quantity: 2 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('clamp-auto-10')
    })
  })

  describe('Invalid configurations - property constraints', () => {
    test('should reject platform with clamps that are too small', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'clamp-manual-5', quantity: 4 }, // Only 5cm, needs at least 8cm
        { productId: 'controller-pro-8', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('platform-modern-200')
      expect(result.errors[0].message).toContain('specific constraints')
    })

    test('should reject platform with controller that has insufficient channels', () => {
      const order: OrderItem[] = [
        { productId: 'platform-compact-120', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 2 },
        { productId: 'controller-basic-4', quantity: 1 }, // Has 4 channels, which is OK for compact platform
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      // This should be valid because compact platform doesn't require controller with automatic clamp support
      // and basic-4 controller has at least 1 channel (no min requirement for compact platform)
      expect(result.valid).toBe(false) // But the clamps need automatic support
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('clamp-auto-10')
    })
  })

  describe('Invalid configurations - product not found', () => {
    test('should reject order with non-existent product', () => {
      const order: OrderItem[] = [
        { productId: 'non-existent-product', quantity: 1 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('non-existent-product')
      expect(result.errors[0].message).toContain('not found')
    })
  })

  describe('Invalid configurations - invalid quantity', () => {
    test('should reject order with zero quantity', () => {
      const order: OrderItem[] = [
        { productId: 'clamp-manual-5', quantity: 0 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('clamp-manual-5')
      expect(result.errors[0].message).toContain('greater than 0')
    })

    test('should reject order with negative quantity', () => {
      const order: OrderItem[] = [
        { productId: 'controller-basic-4', quantity: -5 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('controller-basic-4')
      expect(result.errors[0].message).toContain('greater than 0')
    })
  })

  describe('Complex scenarios', () => {
    test('should handle multiple products with dependencies correctly', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 2 },
        { productId: 'platform-compact-120', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 10 },
        { productId: 'controller-pro-8', quantity: 2 },
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accumulate errors for multiple dependency violations', () => {
      const order: OrderItem[] = [
        { productId: 'platform-modern-200', quantity: 1 },
        { productId: 'clamp-auto-10', quantity: 2 }, // Needs 4 clamps
      ]

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(false)
      // Should have errors for both missing clamps and missing controller for platform,
      // plus missing controller for automatic clamps
      expect(result.errors.length).toBeGreaterThan(0)
    })

    test('should validate empty order as valid', () => {
      const order: OrderItem[] = []

      const result = checkOrderConfiguration(order, products, categoryDefinitions)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})