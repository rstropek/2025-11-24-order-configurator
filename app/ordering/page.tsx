"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

type ProductListItem = {
  id: string;
  name: string;
  categoryId: string;
};

type OrderItem = {
  productId: string;
  quantity: number;
};

type ValidationError = {
  productId: string;
  message: string;
};

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export default function OrderingPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const addProduct = (productId: string) => {
    const existing = orderItems.find(item => item.productId === productId);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { productId, quantity: 1 }]);
    }
    // Clear validation when order changes
    setValidationResult(null);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.productId !== productId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ));
    }
    // Clear validation when order changes
    setValidationResult(null);
  };

  const removeProduct = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
    setValidationResult(null);
  };

  const validateOrder = async () => {
    if (orderItems.length === 0) {
      setValidationResult({
        valid: false,
        errors: [{ productId: "", message: "Order is empty. Please add products." }]
      });
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/orders/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: orderItems }),
      });

      if (res.ok) {
        const result = await res.json();
        setValidationResult(result);
      } else {
        const error = await res.json();
        setValidationResult({
          valid: false,
          errors: [{ productId: "", message: error.error || "Validation failed" }]
        });
      }
    } catch (error) {
      console.error("Failed to validate order:", error);
      setValidationResult({
        valid: false,
        errors: [{ productId: "", message: "Failed to validate order" }]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
    setValidationResult(null);
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || productId;
  };

  const getProductCategory = (productId: string) => {
    return products.find(p => p.id === productId)?.categoryId || "";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Order</h1>

      <div className={styles.mainGrid}>
        {/* Product Selection */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Available Products</h2>
          {isLoading ? (
            <p className={styles.loading}>Loading products...</p>
          ) : (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.categoryBadge}>
                    {product.categoryId}
                  </div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <button
                    onClick={() => addProduct(product.id)}
                    className={styles.addButton}
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Order */}
        <div className={styles.section}>
          <div className={styles.orderHeader}>
            <h2 className={styles.sectionTitle}>Current Order</h2>
            {orderItems.length > 0 && (
              <button onClick={clearOrder} className={styles.clearButton}>
                Clear All
              </button>
            )}
          </div>

          {orderItems.length === 0 ? (
            <p className={styles.emptyOrder}>
              No items in order. Add products from the left.
            </p>
          ) : (
            <>
              <div className={styles.orderList}>
                {orderItems.map((item) => (
                  <div key={item.productId} className={styles.orderItem}>
                    <div className={styles.orderItemHeader}>
                      <div>
                        <div className={styles.orderItemCategory}>
                          {getProductCategory(item.productId)}
                        </div>
                        <div className={styles.orderItemName}>
                          {getProductName(item.productId)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(item.productId)}
                        className={styles.removeButton}
                        aria-label="Remove product"
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.quantityControl}>
                      <label htmlFor={`qty-${item.productId}`}>Quantity:</label>
                      <input
                        id={`qty-${item.productId}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        className={styles.quantityInput}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={validateOrder}
                disabled={isValidating}
                className={styles.validateButton}
              >
                {isValidating ? "Validating..." : "Validate Order"}
              </button>
            </>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={validationResult.valid ? styles.validResult : styles.invalidResult}>
              <h3 className={styles.resultTitle}>
                {validationResult.valid ? "✓ Order is Valid" : "✗ Order has Errors"}
              </h3>
              {validationResult.errors.length > 0 && (
                <ul className={styles.errorList}>
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className={styles.errorItem}>
                      {error.productId && (
                        <strong>{getProductName(error.productId)}: </strong>
                      )}
                      {error.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
