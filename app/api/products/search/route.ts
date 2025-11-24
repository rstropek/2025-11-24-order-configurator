import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { products } from "@/app/db/schema";
import { sql } from "drizzle-orm";
import { z } from "zod";

// Request schema validation
const searchRequestSchema = z.object({
  categoryId: z.string().optional(),
  propertyConstraints: z.array(z.object({
    key: z.string(),
    kind: z.enum(["number", "boolean", "enum"]),
    min: z.number().optional(),
    max: z.number().optional(),
    value: z.boolean().optional(),
    enumValues: z.array(z.string()).optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchParams = searchRequestSchema.parse(body);

    // Build the WHERE conditions
    const conditions: ReturnType<typeof sql>[] = [];

    // Filter by category if provided
    if (searchParams.categoryId) {
      conditions.push(sql`${products.categoryId} = ${searchParams.categoryId}`);
    }

    // Filter by property constraints if provided
    if (searchParams.propertyConstraints && searchParams.propertyConstraints.length > 0) {
      for (const constraint of searchParams.propertyConstraints) {
        const { key, kind } = constraint;

        switch (kind) {
          case "number": {
            // For number properties, check if the value falls within the range
            if (constraint.min !== undefined) {
              conditions.push(
                sql`CAST(json_extract(${products.properties}, ${`$.${key}`}) AS REAL) >= ${constraint.min}`
              );
            }
            if (constraint.max !== undefined) {
              conditions.push(
                sql`CAST(json_extract(${products.properties}, ${`$.${key}`}) AS REAL) <= ${constraint.max}`
              );
            }
            break;
          }

          case "boolean": {
            // For boolean properties, check for exact match
            if (constraint.value !== undefined) {
              const boolValue = constraint.value ? 1 : 0;
              conditions.push(
                sql`json_extract(${products.properties}, ${`$.${key}`}) = ${boolValue}`
              );
            }
            break;
          }

          case "enum": {
            // For enum properties, check if the value is in the allowed list
            if (constraint.enumValues && constraint.enumValues.length > 0) {
              const enumConditions = constraint.enumValues.map(enumValue =>
                sql`json_extract(${products.properties}, ${`$.${key}`}) = ${enumValue}`
              );
              // Combine enum conditions with OR
              conditions.push(sql`(${sql.join(enumConditions, sql` OR `)})`);
            }
            break;
          }
        }
      }
    }

    // Execute the query
    let query = db.select().from(products);

    if (conditions.length > 0) {
      const whereClause = sql.join(conditions, sql` AND `);
      query = query.where(whereClause) as typeof query;
    }

    const results = await query;

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
