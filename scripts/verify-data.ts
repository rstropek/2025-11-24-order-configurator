#!/usr/bin/env tsx

import { db } from "../app/db/client";
import { categories, propertyDefinitions, products } from "../app/db/schema";

console.log("Verifying imported data...\n");

// Check categories
const allCategories = db.select().from(categories).all();
console.log(`Categories (${allCategories.length}):`);
allCategories.forEach(cat => console.log(`  - ${cat.id}: ${cat.name}`));

// Check property definitions
const allPropertyDefs = db.select().from(propertyDefinitions).all();
console.log(`\nProperty Definitions (${allPropertyDefs.length}):`);
allPropertyDefs.forEach(prop => 
  console.log(`  - ${prop.categoryId}.${prop.key} (${prop.kind})`)
);

// Check products
const allProducts = db.select().from(products).all();
console.log(`\nProducts (${allProducts.length}):`);
allProducts.forEach(prod => 
  console.log(`  - ${prod.id}: ${prod.name} (category: ${prod.categoryId})`)
);

console.log("\n✓ Verification complete!");
