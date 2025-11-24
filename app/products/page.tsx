import Link from "next/link";
import styles from "./page.module.css";

type ProductListItem = {
  id: string;
  name: string;
  categoryId: string;
};

async function getProducts(): Promise<ProductListItem[]> {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className={styles.card}
          >
            <div className={styles.categoryBadge}>
              {product.categoryId}
            </div>
            <h2 className={styles.productName}>{product.name}</h2>
            <div className={styles.viewDetails}>View Details →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
