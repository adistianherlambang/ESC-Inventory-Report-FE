import React, { useState } from "react";
import { getFirestoreStructure } from "./getFirestoreStructure";
import { saveAs } from "file-saver";

export default function FirestoreExport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const jsonData = await getFirestoreStructure();
      setData(jsonData);

      // Buat file JSON dan unduh
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "firestore_data.json");
      alert("✅ Data Firestore berhasil diekspor!");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Gagal mengekspor data Firestore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Ekspor Firestore (users + pmt)</h2>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Mengambil data..." : "Download JSON"}
      </button>

      {data && (
        <pre
          style={{
            marginTop: "20px",
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "8px",
            overflowX: "auto",
            maxHeight: "400px",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}