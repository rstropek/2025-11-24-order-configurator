Implement `importProducts` in `/app/db/importer.ts` (imports products, categories, and properties). Use the drizzle ORM from the `/app/db/client.ts` file to import the products into the database. Consider the schema in `/app/db/schema.ts`. You can assume that the migrations have already been applied to the database.

Before you import data to the tables, clean them. Execute the entire process in a single transaction. If any step fails, roll back the transaction.
