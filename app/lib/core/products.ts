import { z, ZodType } from "zod";

export type PropertyKind = "number" | "boolean" | "enum";

export type PropertyDefinition = {
    key: string;                 // e.g. "sizeCm"
    label: string;               // UI label
    kind: PropertyKind;          // "number" | "boolean" | "enum"
    required?: boolean;

    // optional constraints, depending on kind:
    min?: number;
    max?: number;
    enumValues?: string[];
}

export type CategoryDefinition = {
    id: string;
    name: string;
    properties: PropertyDefinition[];
};

export type PropertyConstraint = {
    key: string;
    kind: PropertyKind;
    // For number properties
    min?: number;
    max?: number;
    // For boolean properties
    value?: boolean;
    // For enum properties
    enumValues?: string[];
};

export type ProductDependency = {
    categoryId: string;
    minCount: number;
    propertyConstraints?: PropertyConstraint[];
};

export type Product = {
    id: string;
    name: string;
    categoryId: string;
    properties: Record<string, unknown>;
    dependencies?: ProductDependency[];
};

export function buildZodSchemaForCategory(cat: CategoryDefinition): z.ZodObject {
    const propertiesShape: Record<string, ZodType> = {};

    for (const prop of cat.properties) {
        let schema: ZodType;

        switch (prop.kind) {
            case "number":
                schema = z.number();
                if (prop.min !== undefined) {
                    schema = (schema as z.ZodNumber).min(prop.min);
                }
                if (prop.max !== undefined) {
                    schema = (schema as z.ZodNumber).max(prop.max);
                }
                break;

            case "boolean":
                schema = z.boolean();
                break;

            case "enum":
                if (!prop.enumValues || prop.enumValues.length === 0) {
                    throw new Error(`Property ${prop.key} is of kind 'enum' but has no enumValues`);
                }
                schema = z.enum(prop.enumValues as [string, ...string[]]);
                break;

            default:
                throw new Error(`Unknown property kind: ${prop.kind}`);
        }

        // Make optional if not required
        if (!prop.required) {
            schema = schema.optional();
        }

        propertiesShape[prop.key] = schema;
    }

    return z.object({
        id: z.string(),
        name: z.string(),
        categoryId: z.string(),
        properties: z.object(propertiesShape),
    });
}