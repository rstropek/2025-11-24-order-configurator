The current application stores categories, category properties, and products in an SQLite database. See the following relevant files:

* `/app/lib/core/products.ts`
* `/app/lib/core/sampleData.ts`
* `/app/db/schema.ts`
* `/app/db/client.ts`

Extent the application so that we can store dependencies between products.

* Each product can have zero or more dependencies.
* Each dependency consists of:
  * A product category (e.g. the product needs at least one other product from the given category)
  * A minimum number of products from the category (e.g. the product needs at least 2 products from the given category)
  * A collection of properties that the required products must fulfill (e.g. the required products must have at least a certain value for a given property, true for another property, etc.)

You task is to:

1. Extend the types in `/app/lib/core/products.ts` to support dependencies.
2. Come up with meaningful sample data in `/app/lib/core/sampleData.ts` to test the dependencies.
3. Extend the DB schema in `/app/db/schema.ts` to store dependencies. The dependency definition should be stored in a text column (JSON format).
4. Extend the importer in `/app/db/importer.ts` to import the dependencies into the database.
