import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../../firebase";
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { pmtReport } from "../../../../../state/state";

export default function ReportPopUp() {
  const [manual, setManual] = useState(false);
  const [scan, setScan] = useState(false);

  const { active } = pmtReport();

  const handleClose = () => {
    if (manual || scan) {
      setManual(false);
      setScan(false);
    }
  };

  return (
    <>
      <div
        className={styles.container}
        onClick={handleClose}
        style={manual || scan ? { display: "none" } : {}}
      >
        <p className={styles.title}>Report</p>
        {active}
        <div className={styles.wrapper}>
          <div className={styles.button} onClick={() => setManual(true)}>
            Manual
          </div>
          <div className={styles.button} onClick={() => setScan(true)}>
            Scan
          </div>
        </div>
      </div>
      {manual ? <Manual /> : <></>}
    </>
  );
}

function Manual() {
  const [isCheck, setIsCheck] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    setIsCheck(true);
    e.preventDefault();
  };

  return (
    <>
      <div
        className={styles.container}
        onClick={() => (isCheck ? setIsCheck(false) : undefined)}
        style={isCheck ? { display: "none" } : {}}
      >
        <p className={styles.title}>Report</p>
        <form className={styles.wrapper} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Masukkan IMEI"
            className={styles.input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button type="submit" className={styles.button}>
            Check
          </button>
        </form>
      </div>
      {isCheck ? <Check imei={input} /> : <></>}
    </>
  );
}

function Scan() {}

function Check({ imei }) {
  const [data, setData] = useState([]);
  const [price, setPrice] = useState("");
  const [payType, setPayType] = useState("");
  const [userType, setUserType] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prices, setPrices] = useState([{ type: "", amount: "" }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!imei) return; // jangan fetch kalau imei falsy
        console.log("Fetching product for IMEI:", imei);
        const q = query(
          collection(db, "allproducts"),
          where("IMEI", "array-contains", imei),
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("Query result:", docs);
        setData(docs);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [imei]);

  const handleSubmit = async (item) => {
    setSubmitting(true);
    try {
      if (!imei) throw new Error("IMEI tidak tersedia");
      if (!item || !item.id) throw new Error("Data produk tidak valid");

      const targetId = "YSvrfpBbLkIE0fnGp57V"; // bisa diganti dinamis
      const pmtRef = doc(db, "pmtdatas", targetId);
      const productRef = doc(db, "allproducts", item.id);

      // 1) build newReport
      const newReport = {
        product: item.product || "",
        brand: item.brand || "",
        capacity: item.capacity || "",
        color: item.color || "",
        IMEI: String(imei), // pastikan string
        userType: userType || "CN",
        desc: desc || "",
        price: [
          {
            type: payType || "cash",
            amount: Number(price) || 0,
          },
        ],
        createdAt: new Date(),
      };

      console.log("New report object:", newReport);

      // 2) Pastikan dokumen pmtdatas/{targetId} ada — jika tidak, buat dulu dengan struktur report: []
      const pmtSnap = await getDoc(pmtRef);
      if (!pmtSnap.exists()) {
        console.warn(`pmtdatas/${targetId} tidak ada — akan dibuat baru.`);
        await setDoc(pmtRef, { report: [] }); // buat dokumen awal
      }

      // 3) Tambahkan ke report (arrayUnion)
      await updateDoc(pmtRef, {
        report: arrayUnion(newReport),
      });
      console.log("Added to pmtdatas report");

      // 4) Hapus IMEI dari produk sumber. Pastikan tipe sama.
      await updateDoc(productRef, {
        IMEI: arrayRemove(String(imei)),
      });
      console.log("Requested arrayRemove for IMEI:", imei);

      // 5) Ambil ulang produk untuk cek sisa IMEI
      const updatedSnap = await getDoc(productRef);

      // Jika dokumen sudah dihapus oleh pihak lain, getDoc may be not exist
      if (!updatedSnap.exists()) {
        console.log("Product doc no longer exists after update (was removed).");
      } else {
        const updatedData = updatedSnap.data();
        console.log("Updated product data:", updatedData);
        if (!updatedData.IMEI || updatedData.IMEI.length === 0) {
          // hapus dokumen
          await deleteDoc(productRef);
          console.log("Product doc deleted because IMEI is empty");
        } else {
          console.log("Product still has IMEI:", updatedData.IMEI);
        }
      }

      alert(`✅ IMEI ${imei} berhasil dipindahkan.`);
      // opsi: refresh data local
      setData((prev) =>
        prev.filter(
          (p) =>
            p.id !== item.id || (p.IMEI && p.IMEI.includes(imei) === false),
        ),
      );
    } catch (err) {
      console.error("Submit error:", err);
      // Beri pesan yang lebih deskriptif ke user bila perlu
      if (err.code) {
        // firestore error biasanya punya code, contoh 'permission-denied'
        alert(`Gagal: ${err.code} — ${err.message || "Lihat console"}`);
      } else {
        alert(`Terjadi kesalahan saat submit: ${err.message || err}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const addPriceField = () => {
    setPrices([...prices, { type: "", amount: "" }]);
  };
  const handleChange = (index, field, value) => {
    const updated = [...prices];
    updated[index][field] = value;
    setPrices(updated);
  };

  return (
    <>
      {data.length === 0 ? (
        <Empty/>
      ) : (
        <div className={styles.container}>
          <p className={styles.title}>Report</p>
          {data.map((item) => (
            <div key={item.id} className={styles.productWrapper}>
              <div className={styles.itemDetail}>
                <p className={styles.productName}>{item.product}</p>
                <p className={styles.silver}>
                  IMEI: <span className={styles.black}>{imei}</span>
                </p>
                <div className={styles.productDetail}>
                  <p className={styles.silver}>
                    Warna: <span className={styles.black}>{item.color}</span>
                  </p>
                  <p className={styles.silver}>
                    Ukuran: <span className={styles.black}>{item.capacity}</span>
                  </p>
                </div>
              </div>
              <div className={styles.radioContainer}>
                <p className={styles.method}>Jenis User :</p>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name={`user-${item.id}`}
                    value="User"
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  User
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name={`user-${item.id}`}
                    value="CN"
                    onChange={(e) => setUserType(e.target.value)}
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
                        name={`pay-${item.id}`}
                        value="CS"
                        onChange={(e) => setPayType(e.target.value)}
                      />
                      CS
                    </label>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name={`pay-${item.id}`}
                        value="TF"
                        onChange={(e) => setPayType(e.target.value)}
                      />
                      TF
                    </label>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name={`pay-${item.id}`}
                        value="GS"
                        onChange={(e) => setPayType(e.target.value)}
                      />
                      GS
                    </label>
                  </div>
                  <div className={styles.priceContainer}>
                    <p>Rp</p>
                    <input
                      type="number"
                      placeholder="Harga"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={styles.priceInput}
                    />
                  </div>
                </div>
              ))}
              {/* <div>
                <label>
                  <input
                    type="radio"
                    name={`pay-${item.id}`}
                    value="CS"
                    onChange={(e) => setPayType(e.target.value)}
                  />{" "}
                  CS
                </label>
                <label>
                  <input
                    type="radio"
                    name={`pay-${item.id}`}
                    value="TF"
                    onChange={(e) => setPayType(e.target.value)}
                  />{" "}
                  TF
                </label>
                <label>
                  <input
                    type="radio"
                    name={`pay-${item.id}`}
                    value="GS"
                    onChange={(e) => setPayType(e.target.value)}
                  />{" "}
                  GS
                </label>
                <input
                  type="text"
                  placeholder="Keterangan"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div> */}
              <div className={styles.button}>
                <button onClick={addPriceField} className={styles.addPrice}>
                  + Tambah Harga
                </button>
              </div>
              <button disabled={submitting} onClick={() => handleSubmit(item)}>
                {submitting ? "Processing..." : "Submit"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Empty() {
  return(
    <>
    <div className={`${styles.container} ${styles.empty}`}>
      <p className={`${styles.title} ${styles.empty}`}>Report</p>
      <div className={styles.descContainer}>
        <p className={styles.subTitle}>😭 Tidak ada data</p>
        <p className={styles.desc}>Silahkan tunggu beberapa saat lagi</p>
      </div>
    </div>
    </>
  )
}