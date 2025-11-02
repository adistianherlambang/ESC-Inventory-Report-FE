import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
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
      <div className={styles.container} onClick={handleClose} style={manual || scan ? {display: "none"} : {}}>
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

  const [isCheck, setIsCheck] = useState(false)
  const [input, setInput] = useState("")

  const handleSubmit = (e) => {
    setIsCheck(true)
    e.preventDefault()
  }

  return (
    <>
      <div className={styles.container} onClick={() => isCheck ? setIsCheck(false) : undefined} style={isCheck ? {display: "none"} : {}}>
        <p className={styles.title}>Report</p>
        <form className={styles.wrapper} onSubmit={handleSubmit}>
          <input type="text" placeholder="Masukkan IMEI" className={styles.input} onChange={(e) => setInput(e.target.value)} required/>
          <button type="submit" className={styles.button}>Check</button>
        </form>
      </div>
      {isCheck ? <Check imei={input}/> : <></>}
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "allproducts"),
          where("IMEI", "array-contains", imei)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [imei]);

  // 🟣 handle submit
  const handleSubmit = async (item) => {
    try {
      // ID dokumen tujuan di pmtdatas (bisa kamu ganti sesuai user aktif)
      const targetId = "YSvrfpBbLkIE0fnGp57V";
      const pmtRef = doc(db, "pmtdatas", targetId);
      const productRef = doc(db, "allproducts", item.id);

      // 🧩 data baru yang akan disalin ke report
      const newReport = {
        product: item.product,
        brand: item.brand,
        capacity: item.capacity,
        color: item.color,
        IMEI: imei,
        userType,
        desc,
        price: [
          {
            type: payType,
            amount: Number(price),
          },
        ],
        createdAt: serverTimestamp(),
      };

      // 1️⃣ Tambahkan ke report array di pmtdatas
      await updateDoc(pmtRef, {
        report: arrayUnion(newReport),
      });

      // 2️⃣ Hapus IMEI yang sesuai dari allproducts
      await updateDoc(productRef, {
        IMEI: arrayRemove(imei),
      });

      // 3️⃣ Ambil ulang data produk untuk cek apakah IMEI kosong
      const updatedSnap = await getDoc(productRef);
      const updatedData = updatedSnap.data();

      if (!updatedData.IMEI || updatedData.IMEI.length === 0) {
        await deleteDoc(productRef);
        console.log(`🗑️ Produk ${item.product} dihapus karena IMEI kosong`);
      } else {
        console.log(`✅ IMEI ${imei} dihapus, sisa:`, updatedData.IMEI);
      }

      alert(`✅ Data IMEI ${imei} berhasil dipindahkan ke report`);
    } catch (error) {
      console.error("❌ Gagal memindahkan data:", error);
      alert("Terjadi kesalahan saat submit");
    }
  };

  return (
    <>
      {data.length === 0 ? (
        <p style={{ textAlign: "center" }}>⚠️ Data tidak ditemukan</p>
      ) : (
        <div className={styles.container}>
          <p className={styles.title}>Report</p>
          {data.map((item) => (
            <div key={item.id} className={styles.wrapper}>
              <p>{item.product}</p>
              <p>Barcode: <span>{imei}</span></p>
              <div>
                <p>Warna: <span>{item.color}</span></p>
                <p>Ukuran: <span>{item.capacity}</span></p>
              </div>

              {/* 🟢 Input user */}
              <div>
                <div>
                  <p>Rp</p>
                  <input
                    type="text"
                    placeholder="Harga Unit"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div>
                  <p>Metode Pembayaran:</p>
                  <label>
                    <input
                      type="radio"
                      name="pay"
                      value="CS"
                      onChange={(e) => setPayType(e.target.value)}
                    /> CS
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pay"
                      value="TF"
                      onChange={(e) => setPayType(e.target.value)}
                    /> TF
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pay"
                      value="GS"
                      onChange={(e) => setPayType(e.target.value)}
                    /> GS
                  </label>
                </div>

                <div>
                  <p>Jenis User:</p>
                  <label>
                    <input
                      type="radio"
                      name="userType"
                      value="CN"
                      onChange={(e) => setUserType(e.target.value)}
                    /> CN
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="userType"
                      value="User"
                      onChange={(e) => setUserType(e.target.value)}
                    /> User
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Keterangan"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <button onClick={() => handleSubmit(item)}>Submit</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Empty() {
  return <p style={{ textAlign: "center" }}>⚠️ Data tidak ditemukan</p>;
}

// function Check({imei}) {

//   const [data, setData] = useState([])

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const q = query(
//           collection(db, "allproducts"),
//           where("IMEI", "array-contains", imei)
//         )
//         const querySnapshot = await getDocs(q)
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         const newReport = {
          
//         }
//         setData(data)
//       } catch (err) {
//         console.error(err)
//       }
//     }
//     fetchData()
//   }, [])

//   return(
//     <>
//     {data.length === 0 ? <Empty/> :
//       <div className={styles.container}>
//         <p className={styles.title}>Report</p>
//         {data.map((item) => (
//           <div key={item.id} className={styles.wrapper}>
//               <p>{item.product}</p>
//               <p>Barcode: <span>{imei}</span></p>
//               <div>
//                 <p>Warna: <span>{item.color}</span></p>
//                 <p>Ukuran: <spaan>{item.capacity}</spaan></p>
//               </div>
//               <div>
//                 <div>
//                   <p>Rp</p>
//                   <input type="text" placeholder="Harga Unit"/>
//                 </div>
//                 <div>
//                   <p>Metode Pembayaran : </p>
//                   <input type="radio" value="CS" placeholder="CS"/>
//                   <input type="radio" value="TF" placeholder="TF"/>
//                   <input type="radio" value="GS" placeholder="GS"/>
//                 </div>
//                 <div>
//                   <p>Jenis User : </p>
//                   <input type="radio" value="CN" placeholder="CN"/>
//                   <input type="radio" value="User" placeholder="User"/>
//                 </div>
//                 <input type="textbox" placeholder="Keterangan"/>
//               </div>
//               <button>Submit</button>
//           </div>
//         ))}
//       </div>
//     }
//     </>
//   )
// }

