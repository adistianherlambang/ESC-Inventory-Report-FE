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
  const [imei, setImei] = useState([]);

  useEffect(() => {
    if (stock == false) setOpen("");
  });

  return (
    <>
      <Manual
        open={open}
        id={id}
        imei={imei}
        setImei={setImei}
        setOpen={setOpen}
      />
      <div
        className={`${styles.container} ${stock ? styles.show : styles.hide}`}
        onClick={open ? () => setOpen("") : null}
      >
        <p className={styles.title}>Update Stok {id}</p>
        <div className={styles.itemContainer}>
          {JSON.stringify(imei)}
          <div className={styles.button} onClick={() => setOpen("manual")}>
            Manual
          </div>
          <div className={styles.button}>Scan</div>
        </div>
      </div>
    </>
  );
}

function Manual({ open, setOpen, id, imei, setImei }) {
  const { stock, toogleStockActive } = pmtReport();
  const [input, setInput] = useState("");
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e) => {
    setSubmit(true);
    setImei([...imei, input]);
    e.preventDefault();
    setOpen("");
  };

  return (
    <>
      <Update />
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

function Update() {
  return <>a</>;
}

export default AddStock;
