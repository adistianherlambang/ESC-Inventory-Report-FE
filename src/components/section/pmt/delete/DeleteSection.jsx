import React from "react";
import styles from "./style.module.css"

export default function DeleteSection({ docId, imei, onClose }) {
  return (
    <div className={styles.container}>
      {docId}
      {imei}
    </div>
  );
}
