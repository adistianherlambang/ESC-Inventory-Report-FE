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
  const [imei, setImei] = useState([])

  useEffect(() => {
    if (!stock) setOpen("");
    console.log(data.product)
  });

  return (
    <>
      {open == "manual" ? <Manual open={open} id={id} imei={imei} setImei={setImei} setOpen={setOpen} data={data}/> : <></>} 
      <div
        className={styles.container}
        style={open ? {display: "none"} : {}}
        onClick={open ? () => setOpen("") : null}
      >
        <p className={styles.title}>Update Stok {id}</p>
        <div className={styles.itemContainer}>
          {imei}
          <div className={styles.button} onClick={() => setOpen("manual")}>
            Manual
          </div>
          <div className={styles.button}>Scan</div>
        </div>
      </div>
    </>
  );
}

function Manual({ open, setOpen, id, imei, setImei, data }) {
  const { stock, toogleStockActive } = pmtReport();
  const [input, setInput] = useState("");
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e) => {
    setSubmit(true);
    setImei([...imei, input])
    e.preventDefault();
  };

  useEffect(() => {
    if (!stock) setSubmit(false)
  })

  return (
    <>
      <Update open={submit} id={id} data={data}/>
      <div
        className={styles.container}
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
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

function Update({open, id, imei, data}) {
  const { stock, toogleStockActive } = pmtReport();

  return(
    <>
      <div
        className={`${styles.container} ${open && stock ? styles.show : styles.hide}`}
        style={{ zIndex: 4 }}
      >
        {id}
      </div>
    </>
  )
}

export default AddStock;
