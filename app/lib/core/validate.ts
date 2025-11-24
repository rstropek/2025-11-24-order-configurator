import { CategoryDefinition, Product, ProductDependency, PropertyConstraint } from "./products";

export type OrderItem = {
    productId: string;
    quantity: number;
};

export type ValidationError = {
    productId: string;
    message: string;
};

export type ValidationResult = {
    valid: boolean;
    errors: ValidationError[];
};

/**
 * Checks if a property value satisfies the given constraint
 */
function satisfiesPropertyConstraint(
    propertyValue: unknown,
    constraint: PropertyConstraint
): boolean {
    switch (constraint.kind) {
        case "number":
            if (typeof propertyValue !== "number") return false;
            if (constraint.min !== undefined && propertyValue < constraint.min) return false;
            if (constraint.max !== undefined && propertyValue > constraint.max) return false;
            return true;

        case "boolean":
            if (typeof propertyValue !== "boolean") return false;
            if (constraint.value !== undefined && propertyValue !== constraint.value) return false;
            return true;

        case "enum":
            if (typeof propertyValue !== "string") return false;
            if (constraint.enumValues && !constraint.enumValues.includes(propertyValue)) return false;
            return true;

        default:
            return false;
    }
}

/**
 * Checks if a product satisfies the dependency requirements
 */
function satisfiesDependency(
    product: Product,
    dependency: ProductDependency,
    availableProducts: Map<string, { product: Product; quantity: number }>
): { satisfied: boolean; reason?: string } {
    // Get all products of the required category
    const matchingProducts: { product: Product; quantity: number }[] = [];

    for (const [, { product, quantity }] of availableProducts) {
        if (product.categoryId === dependency.categoryId) {
            // Check if this product satisfies the property constraints
            let satisfiesConstraints = true;

            if (dependency.propertyConstraints) {
                for (const constraint of dependency.propertyConstraints) {
                    const propertyValue = product.properties[constraint.key];
                    if (!satisfiesPropertyConstraint(propertyValue, constraint)) {
                        satisfiesConstraints = false;
                        break;
                    }
                }
            }

            if (satisfiesConstraints) {
                matchingProducts.push({ product, quantity });
            }
        }
    }

    // Calculate total quantity of matching products
    const totalQuantity = matchingProducts.reduce((sum, p) => sum + p.quantity, 0);

    if (totalQuantity < dependency.minCount) {
        return {
            satisfied: false,
            reason: `Requires at least ${dependency.minCount} product(s) from category "${dependency.categoryId}"${
                dependency.propertyConstraints ? " with specific constraints" : ""
            }, but only ${totalQuantity} found`,
        };
    }

    return { satisfied: true };
}

/**
 * Validates an order configuration against product dependencies
 * @param order - List of product IDs with their quantities
 * @param products - Array of all available products
 * @param categories - Array of all category definitions (not currently used but available for future validation)
 * @returns ValidationResult indicating whether the order is valid and any errors
 */
export function checkOrderConfiguration(
    order: OrderItem[],
    products: Product[],
    categories: CategoryDefinition[]
): ValidationResult {
    const errors: ValidationError[] = [];

    // Build a map of products by ID for quick lookup
    const productMap = new Map<string, Product>();
    for (const product of products) {
        productMap.set(product.id, product);
    }

    // Build a map of ordered products with their quantities
    const orderedProducts = new Map<string, { product: Product; quantity: number }>();

    for (const item of order) {
        const product = productMap.get(item.productId);
        if (!product) {
            errors.push({
                productId: item.productId,
                message: `Product "${item.productId}" not found`,
            });
            continue;
        }

        if (item.quantity <= 0) {
            errors.push({
                productId: item.productId,
                message: "Quantity must be greater than 0",
            });
            continue;
        }

        orderedProducts.set(item.productId, { product, quantity: item.quantity });
    }

    // If we have errors finding products, return early
    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Check dependencies for each ordered product
    for (const [productId, { product, quantity }] of orderedProducts) {
        if (!product.dependencies || product.dependencies.length === 0) {
            continue;
        }

        // For each dependency of this product
        for (const dependency of product.dependencies) {
            const result = satisfiesDependency(product, dependency, orderedProducts);

            if (!result.satisfied) {
                errors.push({
                    productId,
                    message: `Product "${product.name}" (quantity: ${quantity}) has unmet dependency: ${result.reason}`,
                });
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
