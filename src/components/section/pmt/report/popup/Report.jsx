import React, { useState, useEffect } from 'react'
import styles from "./style.module.css"

export default function ReportPopUp() {
  
  const [manual, setManual] = useState(false)
  const [scan, setScan] = useState(false)

  return (
    <>
    <div className={styles.container}>
      <p className={styles.title}>Report</p>
      <div className={styles.buttonContainer}>
        <div className={styles.button} onClick={() => setManual(true)}>Manual</div>
        <div className={styles.button} onClick={() => setScan(true)}>Scan</div>
      </div>
    </div>
    </>
  )
}

function Manual() {
}

function Scan() {
}