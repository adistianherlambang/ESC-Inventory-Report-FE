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
      <div className={styles.container} onClick={handleClose} style={manual || scan ? {display: "none"} : {}}>
        <p className={styles.title}>Report</p>
        {active}
        <div className={styles.wrapper}>
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

  const [isCheck, setIsCheck] = useState(false)
  const [input, setInput] = useState("")

  const handleSubmit = (e) => {
    setIsCheck(true)
    e.preventDefault()
  }

  return (
    <>
      <div className={styles.container} onClick={() => isCheck ? setIsCheck(false) : undefined} style={isCheck ? {display: "none"} : {}}>
        <p className={styles.title}>Report</p>
        <form className={styles.wrapper} onSubmit={handleSubmit}>
          <input type="text" placeholder="Masukkan IMEI" className={styles.input} onChange={(e) => setInput(e.target.value)} required/>
          <button type="submit" className={styles.button}>Check</button>
        </form>
      </div>
      {isCheck ? <Check imei={input}/> : <></>}
    </>
  );
}

function Scan() {}

function Check({imei}) {

  const [data, setData] = useState([])

  useEffect(() => {
    try {
      const fetchData = async () => {
        const q = query(
          collection(db, "allproducts"),
          where("imei", "==", {imei})
        )
      }
    } catch(err) {
      return 
    }
  }, [])

  return(
    <>
    <div className={styles.container}>
      <p className={styles.title}>Report</p>
      <div className={styles.wrapper}>
        <p>{imei}</p>
      </div>
    </div>
    </>
  )
}

function Empty() {

}