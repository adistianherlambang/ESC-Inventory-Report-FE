import React, { useState, useEffect } from "react";
import styles from "./style.module.css";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";

import Loader from "../../item/loader/Loader";
import Empty from "../../item/Empty/Empty";

export default function Product({ search, brand }) {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);

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

  useEffect(() => {
    setVisibleCount(3);
  }, [search, brand]);

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
  if (filtered.length == 0) return <Empty />;
  if (!product) return null;
  if (product)
    return (
      <>
        {filtered.slice(0, visibleCount).map((item) => (
          <div key={item.id} className={styles.container}>
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
        {filtered.length > visibleCount && (
          <div className={styles.moreWrapper}>
            <button
              className={styles.more}
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              <svg
                width="18"
                height="10"
                viewBox="0 0 18 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.8 0.799805L8.80005 8.79981L0.800047 0.799804"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Tampilkan lebih banyak
            </button>
          </div>
        )}
      </>
    );
}
