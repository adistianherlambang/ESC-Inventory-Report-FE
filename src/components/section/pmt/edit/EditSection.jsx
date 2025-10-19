import React, { useState, useEffect } from 'react'
import styles from "./style.module.css"

export default function EditSection({ isOpen, docId }) {
  return (
    <div className={`${styles.container} ${!isOpen ? styles.hide : ""}`}>
      edit
      <p>{docId}</p>
    </div>
  )
}
