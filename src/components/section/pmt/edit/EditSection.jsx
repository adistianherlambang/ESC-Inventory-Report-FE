import React from 'react'
import styles from "./style.module.css"

export default function EditSection({ isOpen }) {
  return (
    <div className={`${styles.container} ${!isOpen ? styles.hide : ""}`}>
      edit
      <p>{isOpen}</p>
    </div>
  )
}
