import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditSection({
  isOpen,
  docId,
  imei,
  onClose,
  data,
  edit,
  id,
}) {
  const [prices, setPrices] = useState([{ type: "", amount: "" }]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");

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
    console.log(docId);
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
            userType: user,
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
    window.location.reload();
  };

  const handleSaveAcc = async () => {
    console.log(id + docId);
    if (!docId || !id) return;
    setLoading(true);
    const docRef = doc(db, "pmtdatas", docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const updatedReports = data.report.map((r) =>
      r.id === id
        ? {
            ...r,
            userType: user,
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
    window.location.reload();
  };

  if (edit == "acc") {
    return (
      <div
        className={`${styles.container} ${isOpen ? styles.show : styles.hide}`}
      >
        {(data || [])
          .flatMap((item) => item.report)
          .filter((r) => r.id === id)
          .map((r) => (
            <div key={r.id} className={styles.itemContainer}>
              <p className={styles.title}>Edit</p>
              <div className={styles.radioContainer}>
                <p className={styles.method}>Jenis User :</p>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name={`userType-${r.IMEI}`}
                    value="User"
                    checked={user === "User"}
                    onChange={() => setUser("User")}
                  />
                  User
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name={`userType-${r.IMEI}`}
                    value="CN"
                    checked={user === "CN"}
                    onChange={() => setUser("CN")}
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
                      onChange={(e) =>
                        handleChange(index, "amount", e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>
                </div>
              ))}
              <div className={styles.button}>
                <button onClick={addPriceField} className={styles.addPrice}>
                  + Tambah Harga
                </button>
                <div className={styles.saveClose}>
                  <button onClick={onClose} className={styles.close}>
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAcc}
                    disabled={loading}
                    className={styles.save}
                  >
                    {loading ? "Menyimpan..." : "Simpan Acc"}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  } else {
    return (
      <div
        className={`${styles.container} ${isOpen ? styles.show : styles.hide}`}
      >
        {(data || [])
          .flatMap((item) => item.report)
          .filter((r) => r.IMEI === imei)
          .map((r) => (
            <div key={r.IMEI} className={styles.itemContainer}>
              <p className={styles.title}>Edit</p>

              <div className={styles.itemDetail}>
                <p className={styles.productName}>{r.product}</p>
                <p className={styles.silver}>
                  IMEI: <span className={styles.black}>{r.IMEI}</span>
                </p>
                <div className={styles.productDetail}>
                  <p className={styles.silver}>
                    Warna: <span className={styles.black}>{r.color}</span>
                  </p>
                  <p className={styles.silver}>
                    Ukuran: <span className={styles.black}>{r.capacity}</span>
                  </p>
                </div>
              </div>

              <div className={styles.radioContainer}>
                <p className={styles.method}>Jenis User :</p>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name={`userType-${r.IMEI}`}
                    value="User"
                    checked={user === "User"}
                    onChange={() => setUser("User")}
                  />
                  User
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name={`userType-${r.IMEI}`}
                    value="CN"
                    checked={user === "CN"}
                    onChange={() => setUser("CN")}
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
                      onChange={(e) =>
                        handleChange(index, "amount", e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>
                </div>
              ))}

              <div className={styles.button}>
                <button onClick={addPriceField} className={styles.addPrice}>
                  + Tambah Harga
                </button>
                <div className={styles.saveClose}>
                  <button onClick={onClose} className={styles.close}>
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={styles.save}
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }
}
