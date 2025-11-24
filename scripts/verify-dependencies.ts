#!/usr/bin/env tsx

import { db } from "../app/db/client";
import { products } from "../app/db/schema";

console.log("Verifying product dependencies...\n");

const allProducts = db.select().from(products).all();

allProducts.forEach(prod => {
  console.log(`\n${prod.name} (${prod.id}):`);
  console.log(`  Category: ${prod.categoryId}`);
  
  if (prod.dependencies && prod.dependencies.length > 0) {
    console.log(`  Dependencies:`);
    prod.dependencies.forEach((dep, idx) => {
      console.log(`    ${idx + 1}. Requires ${dep.minCount}+ from category: ${dep.categoryId}`);
      if (dep.propertyConstraints && dep.propertyConstraints.length > 0) {
        dep.propertyConstraints.forEach(constraint => {
          let constraintStr = `       - ${constraint.key} (${constraint.kind})`;
          if (constraint.min !== undefined) constraintStr += ` min: ${constraint.min}`;
          if (constraint.max !== undefined) constraintStr += ` max: ${constraint.max}`;
          if (constraint.value !== undefined) constraintStr += ` value: ${constraint.value}`;
          if (constraint.enumValues) constraintStr += ` values: ${constraint.enumValues.join(', ')}`;
          console.log(constraintStr);
        });
      }
    });
  } else {
    console.log(`  Dependencies: None`);
  }
});

console.log("\n✓ Verification complete!");
