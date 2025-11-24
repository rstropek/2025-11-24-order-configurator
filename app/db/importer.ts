import { db } from "./client";
import { categories, propertyDefinitions, products } from "./schema";
import { CategoryDefinition, Product } from "../lib/core/products";

/**
 * Imports products, categories, and property definitions into the database.
 * Cleans existing data and performs the import in a single transaction.
 * If any step fails, the transaction is rolled back.
 * 
 * @param categoryDefs - Array of category definitions with their properties
 * @param productList - Array of products to import
 */
export function importProducts(
  categoryDefs: CategoryDefinition[],
  productList: Product[]
): void {
  db.transaction((tx) => {
    // Step 1: Clean existing data (delete in correct order due to foreign keys)
    tx.delete(products).run();
    tx.delete(propertyDefinitions).run();
    tx.delete(categories).run();

    // Step 2: Insert categories
    if (categoryDefs.length > 0) {
      tx.insert(categories).values(
        categoryDefs.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }))
      ).run();
    }

    // Step 3: Insert property definitions
    const propertyDefsToInsert = categoryDefs.flatMap((cat) =>
      cat.properties.map((prop) => ({
        categoryId: cat.id,
        key: prop.key,
        label: prop.label,
        kind: prop.kind,
        required: prop.required ?? false,
        min: prop.min ?? null,
        max: prop.max ?? null,
        enumValues: prop.enumValues ?? null,
      }))
    );

    if (propertyDefsToInsert.length > 0) {
      tx.insert(propertyDefinitions).values(propertyDefsToInsert).run();
    }

    // Step 4: Insert products
    if (productList.length > 0) {
      tx.insert(products).values(
        productList.map((prod) => ({
          id: prod.id,
          name: prod.name,
          categoryId: prod.categoryId,
          properties: prod.properties,
          dependencies: prod.dependencies ?? null,
        }))
      ).run();
    }
  });
}
