import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function Add() {
  const [loading, setLoading] = useState(false);

  async function handleAddReport() {
    try {
      setLoading(true);

      // generate 10 produk baru
      const newItems = generateRandomSamsungProducts();

      // collection allproducts
      const ref = collection(db, "allproducts");

      // simpan satu per satu sebagai dokumen baru
      const saves = Object.values(newItems).map((item) => addDoc(ref, item));

      await Promise.all(saves);

      alert("Berhasil menambahkan 10 produk Samsung!");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan produk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAddReport}
      disabled={loading}
      style={{
        backgroundColor: loading ? "#94a3b8" : "#2563eb",
        color: "white",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: 500,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {loading ? "Menambahkan..." : "+ Tambah Samsung S10 Ultra"}
    </button>
  );
}



// ======================================================
//  RANDOM PRODUCT GENERATOR
// ======================================================

function generateRandomSamsungProducts() {
  const names = [
    "Samsung A14", "Samsung A16", "Samsung A25", "Samsung A34",
    "Samsung A54", "Samsung S21", "Samsung S22", "Samsung S23",
    "Samsung S24", "Samsung S25 Ultra"
  ];

  const capacities = ["4/64", "6/128", "8/128", "12/256", "12/512"];
  const colors = ["black", "white", "blue", "green", "silver"];

  const result = {};

  for (let i = 0; i < 10; i++) {
    const id = generateId();
    result[id] = {
      product: names[Math.floor(Math.random() * names.length)],
      brand: "samsung",
      IMEI: [generateRandomIMEI()],
      capacity: capacities[Math.floor(Math.random() * capacities.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  return result;
}

function generateId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generateRandomIMEI() {
  let imei = "";
  for (let i = 0; i < 15; i++) {
    imei += Math.floor(Math.random() * 10);
  }
  return imei;
}