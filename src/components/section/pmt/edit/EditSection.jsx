import React, { useState, useEffect } from 'react'
import styles from "./style.module.css"
import { db } from '../../../../../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function EditSection({ isOpen, docId, data }) {

  return (
    <div className={`${styles.container} ${!isOpen ? styles.hide : ""}`}>
      {docId}
      {data.map((item) => (
        <div>
          {item.brand}
        </div>
      ))}
    </div>
  )
}