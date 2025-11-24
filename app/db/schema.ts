// src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// Property definitions table - stores the properties for each category
export const propertyDefinitions = sqliteTable("property_definitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  kind: text("kind", { enum: ["number", "boolean", "enum"] }).notNull(),
  required: integer("required", { mode: "boolean" }).default(false),
  min: integer("min"),
  max: integer("max"),
  enumValues: text("enum_values", { mode: "json" }).$type<string[]>(),
});

// Products table
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  properties: text("properties", { mode: "json" }).notNull().$type<Record<string, unknown>>(),
  dependencies: text("dependencies", { mode: "json" }).$type<Array<{
    categoryId: string;
    minCount: number;
    propertyConstraints?: Array<{
      key: string;
      kind: string;
      min?: number;
      max?: number;
      value?: boolean;
      enumValues?: string[];
    }>
  }>>(),
});
