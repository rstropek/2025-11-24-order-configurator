import Link from "next/link";
import styles from "./page.module.css";

type PropertyConstraint = {
  key: string;
  kind: string;
  min?: number;
  max?: number;
  value?: boolean;
  enumValues?: string[];
};

type ProductDependency = {
  categoryId: string;
  minCount: number;
  propertyConstraints?: PropertyConstraint[];
};

type ProductDetail = {
  id: string;
  name: string;
  categoryId: string;
  properties: Record<string, unknown>;
  dependencies?: ProductDependency[];
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string): Promise<ProductDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

function formatPropertyValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

function formatPropertyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatConstraint(constraint: PropertyConstraint): string {
  if (constraint.kind === "number") {
    if (constraint.min !== undefined && constraint.max !== undefined) {
      return `${formatPropertyKey(constraint.key)}: ${constraint.min} - ${constraint.max}`;
    }
    if (constraint.min !== undefined) {
      return `${formatPropertyKey(constraint.key)} ≥ ${constraint.min}`;
    }
    if (constraint.max !== undefined) {
      return `${formatPropertyKey(constraint.key)} ≤ ${constraint.max}`;
    }
  }
  if (constraint.kind === "boolean" && constraint.value !== undefined) {
    return `${formatPropertyKey(constraint.key)}: ${constraint.value ? "Yes" : "No"}`;
  }
  if (constraint.kind === "enum" && constraint.enumValues) {
    return `${formatPropertyKey(constraint.key)}: ${constraint.enumValues.join(", ")}`;
  }
  return `${formatPropertyKey(constraint.key)}`;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <div className={styles.container}>
      <Link href="/products" className={styles.backLink}>
        ← Back to Products
      </Link>

      <div className={styles.header}>
        <div className={styles.categoryBadge}>{product.categoryId}</div>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.productId}>ID: {product.id}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Properties</h2>
          <div className={styles.propertyList}>
            {Object.entries(product.properties).map(([key, value]) => (
              <div key={key} className={styles.propertyItem}>
                <span className={styles.propertyKey}>
                  {formatPropertyKey(key)}:
                </span>
                <span className={styles.propertyValue}>
                  {formatPropertyValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {product.dependencies && product.dependencies.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Dependencies</h2>
            <div className={styles.dependencyList}>
              {product.dependencies.map((dep, index) => (
                <div key={index} className={styles.dependencyItem}>
                  <div className={styles.dependencyHeader}>
                    <span className={styles.dependencyCategoryBadge}>
                      {dep.categoryId}
                    </span>
                    <span className={styles.dependencyCount}>
                      Min: {dep.minCount}
                    </span>
                  </div>
                  {dep.propertyConstraints &&
                    dep.propertyConstraints.length > 0 && (
                      <div className={styles.constraints}>
                        <div className={styles.constraintsTitle}>
                          Constraints:
                        </div>
                        {dep.propertyConstraints.map((constraint, idx) => (
                          <div key={idx} className={styles.constraint}>
                            • {formatConstraint(constraint)}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
