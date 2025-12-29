import React, { useState, useEffect, useRef, useMemo } from "react";
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
  setDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { BarcodeScanner, useTorch } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";

import { pmtReport } from "../../../../../state/state";
import { userStore } from "../../../../../state/state";

export default function ReportPopUp({ pmtName }) {
  const [manual, setManual] = useState(false);
  const [scan, setScan] = useState(false);
  const [acc, setAcc] = useState(false);
  const [outflow, setOutflow] = useState(false);

  const { active } = pmtReport();

  const handleClose = () => {
    if (manual || scan || acc || outflow) {
      setManual(false);
      setScan(false);
      setAcc(false);
      setOutflow(false);
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
          <div className={styles.manualscan}>
            <div className={styles.buttonms} onClick={() => setManual(true)}>
              Manual
            </div>
            <div className={styles.buttonms} onClick={() => setScan(true)}>
              Scan
            </div>
          </div>
          <div className={styles.manualscan}>
            <div className={styles.buttonms} onClick={() => setAcc(true)}>
              Aksesoris/lainnya
            </div>
            <div className={styles.buttonms} onClick={() => setOutflow(true)}>
              Pengeluaran
            </div>
          </div>
        </div>
      </div>
      {manual && <Manual />}
      {scan && <Scan />}
      {acc && <CheckAcc />}
      {outflow && <Outflow />}
    </>
  );
}

function Outflow() {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const { currentUser } = userStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !desc) return;
    try {
      const snap = collection(db, "outflow");
      await addDoc(snap, {
        amount: Number(amount),
        desc: desc,
        name: currentUser.name,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      window.location.reload();
    }
  };

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Outflow</p>
        <form className={styles.wrapper} onSubmit={handleSubmit}>
          <div
            className={styles.priceContainer}
            style={{
              flexDirection: "column",
              alignItems: "start",
              gap: "0.5rem",
            }}
          >
            <label>Jenis Pengeluaran</label>
            <input
              type="text"
              placeholder="Masukkan Jenis Pengeluaran"
              className={styles.priceInput}
              style={{ boxSizing: "border-box" }}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>
          <div className={styles.priceContainer}>
            <p>Rp</p>
            <input
              type="number"
              placeholder="Jumlah"
              className={styles.priceInput}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.button}>
            Laporkan
          </button>
        </form>
      </div>
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

function Scan() {
  const [isCheck, setIsCheck] = useState(false);
  const [result, setResult] = useState(null);

  // callback hasil scan
  const handleCapture = (barcodes) => {
    if (barcodes && barcodes.length > 0) {
      // ambil barcode pertama (misal IMEI)
      const code = barcodes[0].rawValue || barcodes[0].value;
      setResult(code);
      console.log("Detected barcode:", code);
    }
  };

  const constraints = useMemo(
    () => ({
      facingMode: "environment",
      width: { ideal: 12 },
      height: { ideal: 720 },
      advanced: [{ width: 320, height: 1280 }, { aspectRatio: 1 }],
    }),
    [],
  );

  const submit = () => {
    if (result) {
      setIsCheck(true);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Report</p>
        <div className={styles.scannerContainer}>
          <div className={styles.scanner}>
            <BarcodeScanner
              options={{ delay: 500, formats: ["code_128"] }}
              onCapture={handleCapture}
              trackConstraints={constraints}
            />
          </div>
          <p className={styles.scanResult}>IMEI : {result}</p>
        </div>
        <div
          className={`${result === null ? styles.buttonInActive : styles.button}`}
          onClick={submit}
        >
          Submit
        </div>
      </div>
      {isCheck ? <Check imei={result} /> : <></>}
    </>
  );
}

function Check({ imei }) {
  const [data, setData] = useState([]);
  const [userType, setUserType] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addPrices, setAddPrices] = useState([{ type: "", amount: "" }]);

  const { currentUser } = userStore();

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

      const q = query(
        collection(db, "fldatas"),
        where("name", "==", currentUser.name),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) throw new Error("target tidak ada");

      const targetDoc = querySnapshot.docs[0].id;
      const pmtRef = doc(db, "fldatas", targetDoc);

      const productRef = doc(db, "allproducts", item.id);

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0"); // 01 - 31
      const month = String(now.getMonth() + 1).padStart(2, "0"); // 01 - 12
      const year = String(now.getFullYear()).slice(-2); // 2 digit terakhir tahun, misal 25

      // 5 digit random
      const random = Math.floor(Math.random() * 1e5)
        .toString()
        .padStart(5, "0");
      const id = day + month + year + random;

      // 1) build newReport
      const newReport = {
        id: id,
        product: item.product || "",
        brand: item.brand || "",
        capacity: item.capacity || "",
        color: item.color || "",
        IMEI: String(imei),
        userType: userType || "CN",
        desc: desc || "",
        price: addPrices.map((p) => ({
          type: p.type || "cash",
          amount: Number(p.amount) || 0,
        })),
        createdAt: new Date(),
      };

      console.log("New report object:", newReport);

      // 2) Pastikan dokumen fldatas/{targetId} ada — jika tidak, buat dulu dengan struktur report: []
      const pmtSnap = await getDoc(pmtRef);
      if (!pmtSnap.exists()) {
        console.warn(`fldatas/${targetDoc} tidak ada — akan dibuat baru.`);
        await setDoc(pmtRef, { report: [] }); // buat dokumen awal
      }

      // 3) Tambahkan ke report (arrayUnion)
      await updateDoc(pmtRef, {
        report: arrayUnion(newReport),
      });
      console.log("Added to fldatas report");

      // -------------------------
      // 3b) Tambahkan ke collection "selling"
      const sellingRef = doc(collection(db, "selling"), id);
      await setDoc(sellingRef, {
        ...newReport,
        soldAt: new Date(),
        name: currentUser.name,
      });
      console.log("Added to selling collection");
      // -------------------------

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
      window.location.reload();
    }
  };

  const addPriceField = () => {
    setAddPrices([...addPrices, { type: "", amount: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...addPrices];
    updated[index][field] = value;
    setAddPrices(updated);
  };

  return (
    <>
      {data.length === 0 ? (
        <Empty />
      ) : (
        <div className={styles.container}>
          <p className={styles.title}>Report</p>
          {data.map((item) => (
            <div key={item.id} className={styles.productWrapper}>
              <div className={styles.itemDetail}>
                <p className={styles.productName}>{item.product}</p>
                <p className={styles.silver}>
                  IMEI:{" "}
                  <span className={styles.black}>{currentUser.namec}</span>
                </p>
                <div className={styles.productDetail}>
                  <p className={styles.silver}>
                    Warna: <span className={styles.black}>{item.color}</span>
                  </p>
                  <p className={styles.silver}>
                    Ukuran:{" "}
                    <span className={styles.black}>{item.capacity}</span>
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
              {addPrices.map((p, index) => (
                <div key={index} className={styles.inputContainer}>
                  <div className={styles.radioContainer}>
                    <p className={styles.method}>Metode Pembayaran :</p>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name={`pay-${item.id}-${index}`} // penting: beda name tiap index
                        value="CS"
                        checked={p.type === "CS"}
                        onChange={(e) =>
                          handleChange(index, "type", e.target.value)
                        }
                      />
                      CS
                    </label>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name={`pay-${item.id}-${index}`}
                        value="TF"
                        checked={p.type === "TF"}
                        onChange={(e) =>
                          handleChange(index, "type", e.target.value)
                        }
                      />
                      TF
                    </label>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name={`pay-${item.id}-${index}`}
                        value="GS"
                        checked={p.type === "GS"}
                        onChange={(e) =>
                          handleChange(index, "type", e.target.value)
                        }
                      />
                      GS
                    </label>
                  </div>
                  <div className={styles.priceContainer}>
                    <p>Rp</p>
                    <input
                      type="number"
                      placeholder="Harga"
                      value={p.amount}
                      onChange={(e) =>
                        handleChange(index, "amount", e.target.value)
                      }
                      className={styles.priceInput}
                    />
                  </div>
                </div>
              ))}
              <div className={styles.priceButton}>
                <button onClick={addPriceField} className={styles.addPrice}>
                  + Tambah Harga
                </button>
                <button
                  className={styles.button}
                  disabled={submitting}
                  onClick={() => handleSubmit(item)}
                >
                  {submitting ? "Loading..." : "Simpan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function CheckAcc() {
  const [data, setData] = useState(null);
  const [addPrices, setAddPrices] = useState([{ type: "", amount: "" }]);
  const [userType, setUserType] = useState("");
  const [productName, setProductName] = useState("");
  const { currentUser } = userStore();

  const addPriceField = () => {
    setAddPrices([...addPrices, { type: "", amount: "" }]);
  };

  const handleSubmit = async () => {
    try {
      const q = query(
        collection(db, "fldatas"),
        where("name", "==", currentUser.name),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("target tidak ada");

      const targetDoc = querySnapshot.docs[0].id;
      const pmtRef = doc(db, "fldatas", targetDoc);

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0"); // 01 - 31
      const month = String(now.getMonth() + 1).padStart(2, "0"); // 01 - 12
      const year = String(now.getFullYear()).slice(-2); // 2 digit terakhir tahun, misal 25

      // 5 digit random
      const random = Math.floor(Math.random() * 1e5)
        .toString()
        .padStart(5, "0");
      const id = day + month + year + random;

      const newReport = {
        id: id,
        product: productName || "",
        type: "acc",
        userType: userType || "",
        price: addPrices.map((p) => ({
          type: p.type || "cash",
          amount: Number(p.amount) || 0,
        })),
        createdAt: new Date(),
      };
      await updateDoc(pmtRef, {
        report: arrayUnion(newReport),
      });

      // -------------------------
      // Tambahkan ke collection "selling"
      const sellingRef = doc(collection(db, "selling"), id);
      await setDoc(sellingRef, {
        ...newReport,
        name: currentUser.name,
      });
      console.log("Added to selling collection");
      // -------------------------
    } catch (err) {
      console.error(err.message);
    } finally {
      window.location.reload();
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...addPrices];
    updated[index][field] = value;
    setAddPrices(updated);
  };

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Report</p>
        <div className={styles.accProduct}>
          <p>Nama Produk</p>
          <input
            type="text"
            placeholder="Nama Produk"
            className={styles.accInput}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className={styles.radioContainer}>
          <p className={styles.method}>Jenis User :</p>
          <label className={styles.radio}>
            <input
              type="radio"
              value="User"
              onChange={(e) => setUserType(e.target.value)}
            />
            User
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              value="CN"
              onChange={(e) => setUserType(e.target.value)}
            />
            CN
          </label>
        </div>
        {addPrices.map((p, index) => (
          <div key={index} className={styles.inputContainer}>
            <div className={styles.radioContainer}>
              <p className={styles.method}>Metode Pembayaran :</p>
              <label className={styles.radio}>
                <input
                  type="radio"
                  value="CS"
                  checked={p.type === "CS"}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                />
                CS
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  value="TF"
                  checked={p.type === "TF"}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                />
                TF
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  value="GS"
                  checked={p.type === "GS"}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                />
                GS
              </label>
            </div>
            <div className={styles.priceContainer}>
              <p>Rp</p>
              <input
                type="number"
                placeholder="Harga"
                value={p.amount}
                onChange={(e) => handleChange(index, "amount", e.target.value)}
                className={styles.priceInput}
              />
            </div>
          </div>
        ))}
        <div className={styles.priceButton}>
          <button onClick={addPriceField} className={styles.addPrice}>
            + Tambah Harga
          </button>
          <button className={styles.button} onClick={handleSubmit}>
            Simpan
          </button>
        </div>
      </div>
    </>
  );
}

function Empty() {
  return (
    <>
      <div className={`${styles.container} ${styles.empty}`}>
        <p className={`${styles.title} ${styles.empty}`}>Report</p>
        <div className={styles.descContainer}>
          <p className={styles.subTitle}>😭 Tidak ada data</p>
          <p className={styles.desc}>Silahkan tunggu beberapa saat lagi</p>
        </div>
      </div>
    </>
  );
}
