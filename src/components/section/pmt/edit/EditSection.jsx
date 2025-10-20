import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditSection({ isOpen, docId, imei, onClose }) {
  const [prices, setPrices] = useState([{ type: "", amount: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!docId || !imei) return;
      const docRef = doc(db, "pmtdatas", docId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const target = data.report?.find((r) => r.IMEI === imei);
      if (target && target.price) {
        setPrices(target.price);
      }
    };
    fetchData();
  }, [docId, imei]);

  const addPriceField = () => {
    setPrices([...prices, { type: "", amount: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...prices];
    updated[index][field] = value;
    setPrices(updated);
  };

  const handleSave = async () => {
    if (!docId || !imei) return;
    setLoading(true);
    const docRef = doc(db, "pmtdatas", docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const updatedReports = data.report.map((r) =>
      r.IMEI === imei
        ? {
            ...r,
            price: prices.map((p) => ({
              type: p.type,
              amount: Number(p.amount),
            })),
          }
        : r,
    );

    await updateDoc(docRef, { report: updatedReports });
    setLoading(false);
    alert("Harga berhasil diperbarui!");
    onClose?.();
  };

  return (
    <div className={`${styles.container} ${!isOpen ? styles.hide : ""}`}>
      <h2 style={{ fontWeight: "bold", fontSize: "18px" }}>
        Edit Harga - IMEI: {imei}
      </h2>

      {prices.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input
            type="text"
            placeholder="Type (cash, debit, etc)"
            value={p.type}
            onChange={(e) => handleChange(i, "type", e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "6px",
            }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={p.amount}
            onChange={(e) => handleChange(i, "amount", e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "6px",
            }}
          />
        </div>
      ))}

      <button
        onClick={addPriceField}
        style={{
          marginTop: "10px",
          background: "#ccc",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "none",
        }}
      >
        + Tambah Harga
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "#999",
            color: "white",
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: "#16a34a",
            color: "white",
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}
