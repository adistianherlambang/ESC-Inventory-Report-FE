import React, { useState, useEffect } from "react";
import styles from "./style.module.css";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../../../firebase";

import Loader from "../../../../item/loader/Loader";
import Empty from "../../../../item/Empty/Empty";
import AddStock from "../../stock/popup/AddStock";

import { pmtReport } from "../../../../../state/state";

export default function Product({ search, brand }) {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState([]);

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

  const filtered = product.filter((item) =>
    item.product.toLowerCase().includes((search || "").toLowerCase()),
  );

  const { stock, toogleStockActive, toogleStockDeact } = pmtReport();
  const handleAddStock = (id, data) => {
    toogleStockActive();
    console.log(stock);
    setSelectedId(id);
    setData(data);
    stock ? toogleStockDeact() : null;
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
        <Empty />
        <div className={styles.addNewProduct}>Tambahkan Stok Baru</div>
      </>
    );
  if (!product) return null;
  if (product)
    return (
      <>
        <AddStock id={selectedId} data={data} />
        <div
          style={{
            transition: "ease-in 300ms",
            opacity: stock ? 0.2 : 1,
          }}
        ></div>
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
      </>
    );
}
