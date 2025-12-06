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
  const [submit, setSubmit] = useState(false)

  useEffect(() => {
    if (!stock) setOpen("");
    console.log(data.product);
  });

  return (
    <>
      {open == "manual" ? (
        <Manual
          open={open}
          id={id}
          imei={imei}
          setImei={setImei}
          setOpen={setOpen}
          data={data}
          setSubmit={setSubmit}
          submit={submit}
        />
      ) : (
        <></>
      )}
      <div
        className={styles.container}
        style={open ? { display: "none" } : {}}
        onClick={open ? () => setOpen("") : null}
      >
        <p className={styles.title}>Update Stok</p>
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

function Manual({ open, setOpen, id, imei, setImei, data, setSubmit, submit }) {
  const { stock, toogleStockActive } = pmtReport();
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    setSubmit(true);
    
    setImei([...imei, input]);
    e.preventDefault();
  };

  useEffect(() => {
    if (!stock) setSubmit(false);
  });

  return (
    <>
      {submit ? <Update id={id} data={data} imei={imei} setOpen={setOpen} setSubmit={setSubmit}/> : <></>}
      <div
        className={styles.container}
        style={{...(submit ? { display: "none" } : {})}}
      >
        <p className={styles.title}>Update Stok</p>
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

function Update({ open, id, imei, data, setOpen, setSubmit }) {
  const { stock, toogleStockActive } = pmtReport();

  const handleAddImei = () => {
    setOpen("")
    setSubmit(false)
  }

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Update Stok</p>
        {imei}
        <div className={styles.button} onClick={handleAddImei}>
          tambah
        </div>
      </div>
    </>
  );
}

export default AddStock;
