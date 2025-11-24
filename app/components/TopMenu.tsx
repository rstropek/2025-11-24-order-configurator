import Link from "next/link";
import styles from "./TopMenu.module.css";

export default function TopMenu() {
  return (
    <nav className={styles.topMenu}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Order Configurator
        </Link>
        <ul className={styles.menuItems}>
          <li>
            <Link href="/products" className={styles.menuItem}>
              Products
            </Link>
          </li>
          <li>
            <Link href="/ordering" className={styles.menuItem}>
              Ordering
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
