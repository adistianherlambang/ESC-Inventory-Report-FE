import React from "react";
import styles from "./style.module.css";

import { pmtReport } from "../../../../../state/state";

function AddStock() {
  const { stock, toogleStockActive } = pmtReport();

  return (
    <div className={`${styles.container} ${stock ? styles.show : styles.hide}`}>
      <p className={styles.title}>Update Stok</p>
      <div className={styles.itemContainer}>
        <div className={styles.button}>Manual</div>
        <div className={styles.button}>Scan</div>
      </div>
    </div>
  );
}

export default AddStock;
