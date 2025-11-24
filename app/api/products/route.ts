import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { products } from "@/app/db/schema";

// DTO for product list (without properties and dependencies)
type ProductListItemDTO = {
  id: string;
  name: string;
  categoryId: string;
};

export async function GET() {
  try {
    const allProducts = await db.select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
    }).from(products);

    const productDTOs: ProductListItemDTO[] = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
    }));

    return NextResponse.json(productDTOs);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
