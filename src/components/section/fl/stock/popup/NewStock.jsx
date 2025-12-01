import React from "react";
import styles from "./style.module.css";

import { pmtReport } from "../../../../../state/state";

function NewStock() {
  const { stock, toogleStockActive } = pmtReport();

  return (
    <div className={`${styles.container} ${stock ? styles.show : styles.hide}`}>
      <p className={styles.title}>Sudah ada di daftar?</p>
      <div className={styles.itemContainer}>
        <div className={styles.button}>Ya, sudah</div>
      </div>
    </div>
  );
}

export default NewStock;
