import React, { useState, useEffect } from "react";
import { db } from "../../../../../../firebase";
import {
  collection,
  query,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

import styles from "./style.module.css";

import { pmtReport } from "../../../../../state/state";

function AddStock({ id, data }) {
  const { stock, toogleStockActive } = pmtReport();
  const [open, setOpen] = useState("");

  useEffect(() => {
    if (stock == false) setOpen("");
  });

  return (
    <>
      <Manual open={open} id={id} />
      <div
        className={`${styles.container} ${stock ? styles.show : styles.hide}`}
        onClick={open ? () => setOpen("") : null}
      >
        <p className={styles.title}>Update Stok {id}</p>
        <div className={styles.itemContainer}>
          <div className={styles.button} onClick={() => setOpen("manual")}>
            Manual
          </div>
          <div className={styles.button}>Scan</div>
        </div>
      </div>
    </>
  );
}

function Manual({ open, id }) {
  const { stock, toogleStockActive } = pmtReport();
  const [input, setInput] = useState("");
  const [isCheck, setIsCheck] = useState(false);

  const handleSubmit = (e) => {
    setIsCheck(true);
    e.preventDefault();
  };

  return (
    <>
      <div
        className={`${styles.container} ${open == "manual" && stock ? styles.show : styles.hide}`}
        style={{ zIndex: 3 }}
      >
        <form className={styles.wrapper} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Masukkan IMEI"
            className={styles.input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button type="submit" className={styles.button}>
            Check
          </button>
        </form>
      </div>
    </>
  );
}

export default AddStock;
