import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../../../firebase";
import { getDoc, getDocs, collection, where, query } from "firebase/firestore";

import Loader from "../../components/item/loader/Loader";
import Empty from "../../components/item/Empty/Empty";

import styles from "./style.module.css"

export default function BrandPage() {
  const { label } = useParams();
  const [product, setProduct] = useState([]);
  const [imeiInput, setImeiInput] = useState("");
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async() => {
      try {
        const q = query(
          collection(db, "allproducts"),
          where("brand", "==", label.toLowerCase())
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setProduct(data)
      } catch(err) {
        console.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div>
      <div className={styles.top}>
        <div className={styles.backButton} onClick={handleBack}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.50513 8.8061L9.84372 16.1447L8.37621 17.6122L0.303866 9.53985C0.109301 9.34523 0 9.0813 0 8.8061C0 8.5309 0.109301 8.26697 0.303866 8.07234L8.37621 0L9.84372 1.46751L2.50513 8.8061Z" fill="#773FF9"/>
          </svg>
        </div>
        <p className={styles.topTitle}>{label}</p>
      </div>
      <div className={styles.container}>
        <h1>Brand: {label}</h1>
        {product.map((item, index) => (
          <div key={index}>
            <p>
              {item.product} ({item.IMEI.length} IMEI)
            </p>
            <input
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              placeholder="Tambah IMEI"
            />
            <button onClick={() => handleAddImei(item._id)}>Tambah</button>
          </div>
        ))}
      </div>
    </div>
  );
}
