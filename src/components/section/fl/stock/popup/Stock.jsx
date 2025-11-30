import React from "react";
import styles from "./style.module.css"

import { pmtReport } from "../../../../../state/state";

function Stock() {
  const { stock, toogleStockActive } = pmtReport();

  return (
    <div className={`${styles.container} ${stock ? styles.show : styles.hide}`}>
      a
    </div>
  )
}

export default Stock;
