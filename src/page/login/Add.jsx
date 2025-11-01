import React, { useState } from "react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export default function Add() {
  const [loading, setLoading] = useState(false);

  // ID dokumen target
  const docId = "YSvrfpBbLkIE0fnGp57V";

  const handleAddReport = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "pmtdatas", docId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        alert("❌ Dokumen tidak ditemukan!");
        setLoading(false);
        return;
      }

      const data = snap.data();

      // Buat report baru
      const newReport = {
        IMEI: Math.floor(Math.random() * 1000000000000).toString(),
        brand: "samsung",
        product: "samsung a07",
        color: "black",
        capacity: "8/128",
        userType: "CN",
        createdAt: Timestamp.now(),
        price: [
          {
            type: "cash",
            amount: 15000000,
          },
        ],
      };

      // Duplikasikan array report dan tambahkan yang baru
      const updatedReports = data.report
        ? [...data.report, newReport]
        : [newReport];

      await updateDoc(docRef, { report: updatedReports });

      alert("✅ Report Samsung S10 Ultra berhasil ditambahkan!");
    } catch (error) {
      console.error("Error saat menambahkan report:", error);
      alert("❌ Gagal menambahkan report.");
    } finally {
      setLoading(false);
    }
  };

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
