You job is to add web APIs for product management:

* GET `/api/products` - returns the list of all products without their properties and dependencies.
* GET `/api/products/:id` - returns the details of a specific product by its ID (including properties and dependencies).
* POST `/api/orders/validate` - accepts an order (see `OrderItem` type) and validates it against the product definitions, returning whether the order is valid and any validation errors. Uses `satisfiesPropertyConstraint` behind the scenes.

All web apis should have their own DTOs. They must not expose internal data structures directly.

Create a REST Client .http file with example requests for each API endpoint. Assume that the DB contains the samples data from `sampleData.ts`.
