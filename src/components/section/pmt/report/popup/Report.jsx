import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { pmtReport } from "../../../../../state/state";

export default function ReportPopUp() {
  const [manual, setManual] = useState(false);
  const [scan, setScan] = useState(false);

  const { active } = pmtReport();

  const handleClose = () => {
    if (manual || scan) {
      setManual(false);
      setScan(false);
    }
  };

  return (
    <>
      <div className={styles.container} onClick={handleClose}>
        <p className={styles.title}>Report</p>
        {active}
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => setManual(true)}>
            Manual
          </div>
          <div className={styles.button} onClick={() => setScan(true)}>
            Scan
          </div>
        </div>
      </div>
      {manual ? <Manual /> : <></>}
    </>
  );
}

function Manual() {
  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Manual</p>
        <div className={styles.buttonContainer}>
          <input type="text" placeholder="aiosdou" className={styles.input} />
          <div className={styles.button}>Check</div>
        </div>
      </div>
    </>
  );
}

function Scan() {}
