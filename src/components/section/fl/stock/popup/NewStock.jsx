import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../../../../../firebase";
import {
  collection,
  query,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  arrayUnion,
  doc
} from "firebase/firestore";
import { BarcodeScanner, useTorch } from "react-barcode-scanner";

import styles from "./style.module.css";

import { pmtReport } from "../../../../../state/state";

function NewStock({ brand }) {
  const { stock, toogleStockActive } = pmtReport();
  const [open, setOpen] = useState("");
  const [imei, setImei] = useState([]);
  const [submit, setSubmit] = useState(false)

  useEffect(() => {
    if (!stock) setOpen("");
  });

  return (
    <>
      {open === "manual" ? (
        <Manual
          brand={brand}
          open={open}
          imei={imei}
          setImei={setImei}
          setOpen={setOpen}
          setSubmit={setSubmit}
          submit={submit}
        />
      ) : open === "scan" ? (
        <Scan
          brand={brand}
          open={open}
          imei={imei}
          setImei={setImei}
          setOpen={setOpen}
          setSubmit={setSubmit}
          submit={submit}
        />
      ) : null}
      <div
        className={styles.container}
        style={open ? { display: "none" } : {}}
        onClick={open ? () => setOpen("") : null}
      >
        <p className={styles.title}>Tambahkan Stokk</p>
        <div className={styles.itemContainer}>
          <div className={styles.button} onClick={() => setOpen("manual")}>
            Manual
          </div>
          <div className={styles.button} onClick={() => setOpen("scan")}>
            Scan
          </div>
        </div>
      </div>
    </>
  );
}

function Manual({ open, brand, setOpen, imei, setImei, setSubmit, submit }) {
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
      {submit ? <Update brand={brand} imei={imei} setOpen={setOpen} setSubmit={setSubmit}/> : <></>}
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

function Scan({ open, brand, setOpen, imei, setImei, setSubmit, submit }) {
  const [isCheck, setIsCheck] = useState(false);
  const [result, setResult] = useState(null);

  // callback hasil scan
  const handleCapture = (barcodes) => {
    if (barcodes && barcodes.length > 0) {
      // ambil barcode pertama (misal IMEI)
      const code = barcodes[0].rawValue || barcodes[0].value;
      setResult(code);
      console.log("Detected barcode:", code);
    }
  };

  const constraints = useMemo(
    () => ({
      facingMode: "environment",
      width: { ideal: 12 },
      height: { ideal: 720 },
      advanced: [{ width: 320, height: 1280 }, { aspectRatio: 1 }],
    }),
    [],
  );

  const handleSubmit = () => {
    if (result) {
      setSubmit(true)
      setImei([...imei, result]);
    }
  };

  return (
    <>
      {submit ? <Update brand={brand} imei={imei} setOpen={setOpen} setSubmit={setSubmit}/> : <></>}
      <div className={styles.container} style={{...(submit ? { display: "none" } : {})}}>
        <p className={styles.title}>Report</p>
        <div className={styles.scannerContainer}>
          <div className={styles.scanner}>
            <BarcodeScanner
              options={{ delay: 500, formats: ["code_128"] }}
              onCapture={handleCapture}
              trackConstraints={constraints}
            />
          </div>
          <p className={styles.scanResult}>IMEI : {result}</p>
        </div>
        <div
          className={`${result === null ? styles.buttonInActive : styles.button}`}
          onClick={handleSubmit}
        >
          Submit
        </div>
      </div>
    </>
  );
}

function Update({ open, brand, imei, setOpen, setSubmit }) {
  const { stock, toogleStockActive, toogleStockDeact } = pmtReport();
  const [data, setData] = useState({
    brand: brand.toLowerCase(),
    product: "",
    capacity: "",
    color: ""
  })

  const handleAddImei = () => {
    setOpen("")
    setSubmit(false)
  }

  const handleSubmit = async () => {
    try {
      const docRef = doc(db, "allproducts", `${id}`)
      await addDoc(docRef, {
        IMEI: arrayUnion(...imei)
      })
    } catch (err) {
      console.error(err.message)
    } finally {
      window.location.reload()
    }
  }

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Tambahkan Stok</p>
        <div className={styles.itemContainer}>
          <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
            <div style={{display: "flex", flexDirection: "column", gap: '0.5rem'}}>
              <label htmlFor="input">Nama Produk</label>
              <input
                type="text"
                placeholder="Masukkan Nama Produk"
                className={styles.input}
                style={{textAlign: "left"}}
                name="product"
                value={data.product}
                onChange={(e) => setData({...data, product: e.target.value})}
                required
              />
            </div>
            <div style={{display: "flex", gap: "1rem"}}>
              <div style={{width: "100%", display: "flex", flexDirection: "column", gap: '0.5rem'}}>
                <label htmlFor="input">Kapasitas</label>
                <input
                  type="text"
                  placeholder="Kapasitas"
                  className={styles.input}
                  style={{textAlign: "left"}}
                  name="capacity"
                  value={data.capacity}
                  onChange={(e) => setData({...data, capacity: e.target.value})}
                  required
                />
              </div>
              <div style={{width: "100%", display: "flex", flexDirection: "column", gap: '0.5rem'}}>
                <label htmlFor="input">Warna</label>
                <input
                  type="text"
                  placeholder="Warna"
                  className={styles.input}
                  style={{textAlign: "left"}}
                  name="color"
                  value={data.color}
                  onChange={(e) => setData({...data, color: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className={styles.imeiContainer}>
              {imei.map((item) => (
                <div key={item} className={styles.imei}>
                  <p style={{color: "#B0B0B0"}}>Barcode:</p>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.itemContainer}>
          <div className={styles.button} onClick={handleAddImei} style={{boxSizing: "border-box", border: "solid #773ff9 1px", backgroundColor: "white", color: "#773ff9"}}>
            Tambahkan Item
          </div>
          <div className={styles.button} onClick={handleSubmit}>
            Submit
          </div>
          <div className={styles.button} onClick={toogleStockDeact()}>
            Batalkan
          </div>
        </div>
      </div>
      {/* <div className={styles.container}>
        <p className={styles.title}>Update Stok</p>
        <div className={styles.itemContainer}>
          <p className={styles.subtitle}>{data.product}</p>
          <div className={styles.imeiContainer}>
            {imei.map((item) => (
              <div key={item} className={styles.imei}>
                <p style={{color: "#B0B0B0"}}>Barcode:</p>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className={styles.type}>
            <p>
              Warna : <span className={styles.span}>{data.color}</span>
            </p>
            <p>
              Ukuran : <span className={styles.span}>{data.capacity}</span>
            </p>
          </div>
        </div>
        <div className={styles.itemContainer}>
          <div className={styles.button} onClick={handleAddImei}>
            Tambahkan Item
          </div>
          <div className={styles.button} onClick={handleSubmit}>
            Submit
          </div>
        </div>
      </div> */}
    </>
  );
}

export default NewStock;
