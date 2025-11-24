import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { products, categories, propertyDefinitions } from "@/app/db/schema";
import { checkOrderConfiguration } from "@/app/lib/core/validate";
import type { Product, CategoryDefinition, PropertyKind } from "@/app/lib/core/products";
import { z } from "zod";

// Input DTO for order validation
const OrderItemDTOSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const OrderValidationRequestSchema = z.object({
  items: z.array(OrderItemDTOSchema),
});

type OrderValidationRequest = z.infer<typeof OrderValidationRequestSchema>;

// Output DTO for validation errors
type ValidationErrorDTO = {
  productId: string;
  message: string;
};

// Output DTO for validation result
type ValidationResultDTO = {
  valid: boolean;
  errors: ValidationErrorDTO[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = OrderValidationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const orderRequest: OrderValidationRequest = validationResult.data;

    // Fetch all products from database
    const allProducts = await db.select().from(products);

    // Convert DB products to Product type
    const productList: Product[] = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      properties: p.properties,
      dependencies: p.dependencies?.map(dep => ({
        categoryId: dep.categoryId,
        minCount: dep.minCount,
        propertyConstraints: dep.propertyConstraints?.map(pc => ({
          key: pc.key,
          kind: pc.kind as PropertyKind,
          min: pc.min,
          max: pc.max,
          value: pc.value,
          enumValues: pc.enumValues,
        })),
      })),
    }));

    // Fetch all categories and their property definitions
    const allCategories = await db.select().from(categories);
    const allPropertyDefinitions = await db.select().from(propertyDefinitions);

    // Build category definitions
    const categoryList: CategoryDefinition[] = allCategories.map(cat => {
      const props = allPropertyDefinitions
        .filter(pd => pd.categoryId === cat.id)
        .map(pd => ({
          key: pd.key,
          label: pd.label,
          kind: pd.kind as "number" | "boolean" | "enum",
          required: pd.required || false,
          min: pd.min || undefined,
          max: pd.max || undefined,
          enumValues: pd.enumValues || undefined,
        }));

      return {
        id: cat.id,
        name: cat.name,
        properties: props,
      };
    });

    // Convert DTOs to internal OrderItem type
    const orderItems = orderRequest.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // Validate the order
    const result = checkOrderConfiguration(orderItems, productList, categoryList);

    // Convert to DTO
    const responseDTO: ValidationResultDTO = {
      valid: result.valid,
      errors: result.errors.map(err => ({
        productId: err.productId,
        message: err.message,
      })),
    };

    return NextResponse.json(responseDTO);
  } catch (error) {
    console.error("Error validating order:", error);
    return NextResponse.json(
      { error: "Failed to validate order" },
      { status: 500 }
    );
  }
}
