#!/usr/bin/env tsx

import { importProducts } from "../app/db/importer";
import { categoryDefinitions, products } from "../app/lib/core/sampleData";

function main() {
  console.log("Starting data import...");
  console.log(`Importing ${categoryDefinitions.length} categories and ${products.length} products`);

  try {
    importProducts(categoryDefinitions, products);
    console.log("✓ Data import completed successfully!");
  } catch (error) {
    console.error("✗ Data import failed:", error);
    process.exit(1);
  }
}

main();
