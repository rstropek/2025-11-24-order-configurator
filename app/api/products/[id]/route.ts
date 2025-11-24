import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { products } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// DTO for property constraints
type PropertyConstraintDTO = {
  key: string;
  kind: string;
  min?: number;
  max?: number;
  value?: boolean;
  enumValues?: string[];
};

// DTO for product dependencies
type ProductDependencyDTO = {
  categoryId: string;
  minCount: number;
  propertyConstraints?: PropertyConstraintDTO[];
};

// DTO for detailed product (including properties and dependencies)
type ProductDetailDTO = {
  id: string;
  name: string;
  categoryId: string;
  properties: Record<string, unknown>;
  dependencies?: ProductDependencyDTO[];
};

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const product = await db.select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: `Product with id "${id}" not found` },
        { status: 404 }
      );
    }

    const p = product[0];

    const productDTO: ProductDetailDTO = {
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      properties: p.properties,
      dependencies: p.dependencies || undefined,
    };

    return NextResponse.json(productDTO);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
