import React, { useState, useEffect } from "react";
import styles from "./style.module.css";

import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../../../firebase";

import Loader from "../../../../item/loader/Loader";
import Empty from "../../../../item/Empty/Empty";
import AddStock from "../../stock/popup/AddStock";

import { pmtReport } from "../../../../../state/state";
import NewStock from "../../stock/popup/NewStock";
import PopUp from "../../../../popUp/PopUp";

export default function Product({ search, brand }) {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false)
  const [openNew, setOpenNew] = useState(false)

  const [brandAcc, setBrandAcc] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "allproducts"),
          where("brand", "==", brand),
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProduct(data);
        console.log("Data dari Firestore:", data);
        
        const accQuery = query(
          collection(db, "accessories"),
          where("brand", "==", brand)
        )
        const accSnapshot = await getDocs(accQuery)
        const accData = accSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setBrandAcc(accData)
      } catch (err) {
        console.error("Error fetch product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (brand) {
      fetchProduct();
    }
  }, [brand]);

  const capacityOrder = [
    "4/64",
    "4/128",
    "4/256",
    "6/128",
    "6/256",
    "8/128",
    "8/256",
    "12/256",
    "12/512",
  ];

  function normalizeString(value) {
    return (value || "")
      .toString()
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  const filtered = product.filter((item) =>
    item.product.toLowerCase().includes((search || "").toLowerCase()),
  ).sort((a,b) => {
    const productCompare = normalizeString(a.product).localeCompare(
        normalizeString(b.product),
        "id",
        { sensitivity: "base" }
      );
      if (productCompare !== 0) return productCompare;

      const aCapIndex = capacityOrder.indexOf(normalizeString(a.capacity));
      const bCapIndex = capacityOrder.indexOf(normalizeString(b.capacity));

      if (aCapIndex === -1 && bCapIndex === -1) return 0;
      if (aCapIndex === -1) return 1;
      if (bCapIndex === -1) return -1;

      return aCapIndex - bCapIndex;
      
  });
  
  
  const { stock, toogleStockActive, toogleStockDeact } = pmtReport();
  
  useEffect(() => {
    if (!stock) {
      setOpenAdd(false)
      setOpenNew(false)
    }
  }, [stock])

  const handleAddStock = (id, item) => {
    toogleStockActive();
    stock ? toogleStockDeact() : null;
    setOpenAdd(true)
    console.log(stock);
    setSelectedId(id);
    setData(item);
    openAdd ? setOpenAdd(false) : null
  };

  const handleNewStock = (brand) => {
    setOpenNew(true)
    toogleStockActive();
    stock ? toogleStockDeact() : null;
    openNew ? setOpenNew(false) : null
  };

  const handleIncrement = (label) => {
  }

  let debounceTimer = {};

  const debounceUpdateStock = (id, stock) => {
    if (debounceTimer[id]) {
      clearTimeout(debounceTimer[id]);
    }

    debounceTimer[id] = setTimeout(async () => {
      try {
        const ref = doc(db, "accessories", id);
        await updateDoc(ref, { stock });
      } catch (err) {
        console.error("Gagal update stok:", err);
      }
    }, 600);
  };

  const handleStockChange = (id, value) => {
    const newStock = Number(value);

    if (Number.isNaN(newStock) || newStock < 0) return;

    setBrandAcc((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: newStock }
          : item
      )
    );

    debounceUpdateStock(id, newStock);
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <Loader />
      </div>
    );
  if (error)
    return (
      <div className={styles.error}>
        <Empty />
      </div>
    );
  if (filtered.length == 0)
    return (
      <>
        <div
          style={{
            opacity: stock ? "0.3" : "1",
            transition: "opacity 300ms ease",
          }}
        >
          <Empty />
          <div onClick={handleNewStock} className={styles.addNewProduct}>
            Tambahkan Stok Baru
          </div>
        </div>
        {stock && (
          <PopUp>
            <NewStock brand={brand} />
          </PopUp>
        )}
      </>
    );
  if (!product) return null;
  if (product)
    return (
      <>
        <div
          style={{
            transition: "ease-in 300ms",
            opacity: stock ? 0.2 : 1,
          }}
        ></div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
          gap: "1rem",
          transition: "ease-in 300ms",
          opacity: stock ? 0.2 : 1,
        }}>
          {brandAcc.map((item, index) => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: brandAcc.length < 2 ? "center" : index !== 0 && (index + 1) % 2 === 1 ? "center" : "flex-start",
                flexDirection: "row",
                gap: "1rem",
                boxSizing: "border-box"
              }}
              key={item.id}
              className={styles.container}
            >
              <p>{item.product}</p>
              <div style={{
                display: "flex",
                gap: "1rem",
                alignItems: brandAcc.length < 2 ? "center" : index !== 0 && (index + 1) % 2 === 1 ? "center" : "flex-start",
              }}>
                <p>Stok:</p>
                <div style={{
                  display: "flex",
                  gap: "0.5rem"
                }}>
                  
                  <input
                    type="number"
                    className={styles.stockInput}
                    value={item.stock}
                    onChange={(e) =>
                      handleStockChange(item.id, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.map((item) => (
          <div
            style={{
              transition: "ease-in 300ms",
              opacity: stock ? 0.2 : 1,
            }}
            key={item.id}
            className={styles.container}
            onClick={() => handleAddStock(item.id, item)}
          >
            <p>{item.product}</p>
            <div className={styles.type}>
              <p>
                Warna : <span className={styles.span}>{item.color}</span>
              </p>
              <p>
                Ukuran : <span className={styles.span}>{item.capacity}</span>
              </p>
            </div>
            <p>Stok : {item.IMEI?.length || 0}</p>
          </div>
        ))}
        {openAdd && (
          <PopUp>
            <AddStock id={selectedId} data={data} />
            <p>{stock ? "ya" : "ga"}</p>
          </PopUp>
        )}
        <div
          style={{
            opacity: stock ? "0.3" : "1",
            transition: "opacity 300ms ease",
          }}
        >
          <div onClick={handleNewStock} className={styles.addNewProduct}>
            Tambahkan Stok Baru
          </div>
        </div>
        {openNew && (
          <PopUp>
            <NewStock brand={brand} />
          </PopUp>
        )}
      </>
    );
}
