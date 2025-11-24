import { describe, it, expect } from "vitest";
import { buildZodSchemaForCategory, CategoryDefinition } from "./products";

describe("buildZodSchemaForCategory", () => {
    it("should create a schema for a category with number properties", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "width",
                    label: "Width",
                    kind: "number",
                    required: true,
                    min: 10,
                    max: 100,
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Valid data
        expect(schema.safeParse({ width: 50 }).success).toBe(true);

        // Below minimum
        expect(schema.safeParse({ width: 5 }).success).toBe(false);

        // Above maximum
        expect(schema.safeParse({ width: 150 }).success).toBe(false);

        // Missing required field
        expect(schema.safeParse({}).success).toBe(false);
    });

    it("should create a schema for a category with boolean properties", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "enabled",
                    label: "Enabled",
                    kind: "boolean",
                    required: true,
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Valid boolean values
        expect(schema.safeParse({ enabled: true }).success).toBe(true);
        expect(schema.safeParse({ enabled: false }).success).toBe(true);

        // Invalid types
        expect(schema.safeParse({ enabled: "true" }).success).toBe(false);
        expect(schema.safeParse({ enabled: 1 }).success).toBe(false);

        // Missing required field
        expect(schema.safeParse({}).success).toBe(false);
    });

    it("should create a schema for a category with enum properties", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "color",
                    label: "Color",
                    kind: "enum",
                    required: true,
                    enumValues: ["red", "green", "blue"],
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Valid enum values
        expect(schema.safeParse({ color: "red" }).success).toBe(true);
        expect(schema.safeParse({ color: "green" }).success).toBe(true);
        expect(schema.safeParse({ color: "blue" }).success).toBe(true);

        // Invalid enum value
        expect(schema.safeParse({ color: "yellow" }).success).toBe(false);

        // Missing required field
        expect(schema.safeParse({}).success).toBe(false);
    });

    it("should make properties optional when required is false", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "optionalNumber",
                    label: "Optional Number",
                    kind: "number",
                    required: false,
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Should accept missing optional field
        expect(schema.safeParse({}).success).toBe(true);

        // Should also accept valid value
        expect(schema.safeParse({ optionalNumber: 42 }).success).toBe(true);
    });

    it("should make properties optional when required is undefined", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "implicitlyOptional",
                    label: "Implicitly Optional",
                    kind: "number",
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Should accept missing field when required is not specified
        expect(schema.safeParse({}).success).toBe(true);
    });

    it("should handle multiple properties of different kinds", () => {
        const category: CategoryDefinition = {
            id: "product-category",
            name: "Product Category",
            properties: [
                {
                    key: "sizeCm",
                    label: "Size (cm)",
                    kind: "number",
                    required: true,
                    min: 1,
                    max: 200,
                },
                {
                    key: "inStock",
                    label: "In Stock",
                    kind: "boolean",
                    required: true,
                },
                {
                    key: "material",
                    label: "Material",
                    kind: "enum",
                    required: false,
                    enumValues: ["wood", "metal", "plastic"],
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Valid complete data
        expect(
            schema.safeParse({
                sizeCm: 100,
                inStock: true,
                material: "wood",
            }).success
        ).toBe(true);

        // Valid without optional field
        expect(
            schema.safeParse({
                sizeCm: 100,
                inStock: true,
            }).success
        ).toBe(true);

        // Missing required field
        expect(
            schema.safeParse({
                sizeCm: 100,
            }).success
        ).toBe(false);

        // Invalid enum value
        expect(
            schema.safeParse({
                sizeCm: 100,
                inStock: true,
                material: "glass",
            }).success
        ).toBe(false);
    });

    it("should handle number properties without min/max constraints", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "quantity",
                    label: "Quantity",
                    kind: "number",
                    required: true,
                },
            ],
        };

        const schema = buildZodSchemaForCategory(category);

        // Should accept any number
        expect(schema.safeParse({ quantity: -1000 }).success).toBe(true);
        expect(schema.safeParse({ quantity: 0 }).success).toBe(true);
        expect(schema.safeParse({ quantity: 999999 }).success).toBe(true);
    });

    it("should throw error for enum without enumValues", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "status",
                    label: "Status",
                    kind: "enum",
                    required: true,
                },
            ],
        };

        expect(() => buildZodSchemaForCategory(category)).toThrow(
            "Property status is of kind 'enum' but has no enumValues"
        );
    });

    it("should throw error for enum with empty enumValues array", () => {
        const category: CategoryDefinition = {
            id: "test-category",
            name: "Test Category",
            properties: [
                {
                    key: "status",
                    label: "Status",
                    kind: "enum",
                    required: true,
                    enumValues: [],
                },
            ],
        };

        expect(() => buildZodSchemaForCategory(category)).toThrow(
            "Property status is of kind 'enum' but has no enumValues"
        );
    });

    it("should handle category with no properties", () => {
        const category: CategoryDefinition = {
            id: "empty-category",
            name: "Empty Category",
            properties: [],
        };

        const schema = buildZodSchemaForCategory(category);

        // Should accept empty object
        expect(schema.safeParse({}).success).toBe(true);
    });
});
