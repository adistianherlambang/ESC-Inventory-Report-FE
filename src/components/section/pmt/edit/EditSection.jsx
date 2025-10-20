import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditSection({ isOpen, docId, imei, onClose, data }) {
  const [prices, setPrices] = useState([{ type: "", amount: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docId && imei) {
      setPrices([{ type: "", amount: "" }]);
    }
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
            userType: a,
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
      {data.map((item) =>
        item.report.map((r) => (
          <div key={item.id} className={styles.itemContainer}>

            <p className={styles.title}>Edit</p>

            <div className={styles.itemDetail}>
              <p className={styles.productName}>{r.product}</p>
              <p className={styles.silver}>
                IMEI: <span className={styles.black}>{imei}</span>
              </p>
              <div className={styles.productDetail}>
                <p className={styles.silver}>Warna: <span className={styles.black}>{r.color}</span></p>
                <p className={styles.silver}>Ukuran: <span className={styles.black}>{r.capacity}</span></p>
              </div>
            </div>

            <div className={styles.radioContainer}>
              <p className={styles.method}>Jenis User :</p>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name={r.userType}
                  value="User"
                  checked={r.userType == "user"}
                />
                User
              </label>
               <label className={styles.radio}>
                <input
                  type="radio"
                  name={r.userType}
                  value="CN"
                  checked={r.userType == "CN"}
                />
                CN
              </label>
            </div>

            {prices.map((price, index) => (
              <div key={index} className={styles.inputContainer}>
                <div className={styles.radioContainer}>
                  <p className={styles.method}>Metode Pembayaran :</p>
                  <label className={styles.radio}>
                    <input
                      type="radio"
                      name={`type-${index}`}
                      value="cash"
                      checked={price.type === "cash"}
                      onChange={() => handleChange(index, "type", "cash")}
                    />
                    CS
                  </label>
                  <label className={styles.radio}>
                    <input
                      type="radio"
                      name={`type-${index}`}
                      value="transfer"
                      checked={price.type === "transfer"}
                      onChange={() => handleChange(index, "type", "transfer")}
                    />
                    TF
                  </label>
                  <label className={styles.radio}>
                    <input
                      type="radio"
                      name={`type-${index}`}
                      value="debit"
                      checked={price.type === "debit"}
                      onChange={() => handleChange(index, "type", "debit")}
                    />
                    GS
                  </label>
                </div>
                <div className={styles.priceContainer}>
                  <p>Rp</p>
                  <input
                    type="number"
                    placeholder="Harga"
                    value={price.amount}
                    onChange={(e) => handleChange(index, "amount", e.target.value)}
                    className={styles.input}
                  />
                </div>
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
        )),
      )}

    </div>
  );
}
