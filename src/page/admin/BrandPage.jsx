import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BrandPage() {
  const { label } = useParams();
  const [product, setProduct] = useState([]);
  const [imeiInput, setImeiInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/product/getbybrand?brand=${label.toLowerCase()}`,
        );
        setProduct(res.data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  }, [label]);

  const handleAddImei = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/product/add-imei/${id}`,
        { imei: imeiInput },
      );
      setProduct(product.map((p) => (p._id === id ? res.data : p)));
      setImeiInput("");
    } catch (err) {
      console.error(err.message);
    }
  };

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
