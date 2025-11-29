import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../../../firebase";
import { getDoc, getDocs, collection, where, query } from "firebase/firestore";

import Loader from "../../components/item/loader/Loader";
import Empty from "../../components/item/Empty/Empty";

export default function BrandPage() {
  const { label } = useParams();
  const [product, setProduct] = useState([]);
  const [imeiInput, setImeiInput] = useState("");
  const [loading, setLoading] = useState(true)

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

  return (
    <div>
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
  );
}
