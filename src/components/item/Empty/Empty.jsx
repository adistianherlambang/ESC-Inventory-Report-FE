import React from 'react'
import styles from "./style.module.css"

export default function Empty() {
  return (
    <div className={styles.container}>
      <p className={styles.title}>😭 Tidak ada data</p>
      <p className={styles.desc}>Silahkan tunggu beberapa saat lagi</p>
    </div>
  )
}
