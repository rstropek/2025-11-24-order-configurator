The current application stores categories, category properties, and products in an SQLite database. See the following relevant files:

* `/app/lib/core/products.ts`
* `/app/lib/core/sampleData.ts`
* `/app/db/schema.ts`
* `/app/db/client.ts`

Implement a function `checkOrderConfiguration` in `/app/lib/core/validate.ts` that checks if the given order configuration is valid. It receives an order (list or products ids with their quantities). Additionally, it receives product and category definitions (see `/app/lib/core/products.ts`). The method must validate if the order configuration is valid according to the dependencies of the products.

Write unit tests using vitest. Use the provided sample data for the unit tests.
