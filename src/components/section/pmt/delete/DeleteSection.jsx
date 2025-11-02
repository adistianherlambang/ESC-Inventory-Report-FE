import React from "react";
import styles from "./style.module.css";
import { db } from "../../../../../firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where, arrayUnion } from "firebase/firestore";

export default function DeleteSection({ docId, imei, onClose, product, capacity, color }) {

  const deleteReportByIMEI = async (docId, imei) => {
    try {
      const docRef = doc(db, "pmtdatas", docId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        console.log("Dokumen tidak ditemukan!");
        return;
      }

      const data = snap.data();

      // filter report, hapus yang IMEI = imei
      const updatedReport = data.report.filter((r) => r.IMEI !== imei);

      // update dokumen
      await updateDoc(docRef, { report: updatedReport });

      console.log("Report berhasil dihapus!");

      // update stok (kembalikan imei yang dibatalkan)
      const q = query(
        collection(db, "allproducts"),
        where("product", "==", product),
        where("capacity", "==", capacity),
        where("color", "==", color)
      )

      const querySnapshot = await getDocs(q)
      const productDocs = querySnapshot.docs[0]

      const productRef = doc(db, "allproducts", productDocs.id)
      await updateDoc(productRef, {
        IMEI: arrayUnion(String(imei))
      })
    } catch (err) {
      console.error("Gagal hapus report:", err);
    }
  };

  return (
    <div className={styles.container}>
      {docId}
      <p>{imei}</p>
      <button onClick={() => deleteReportByIMEI(docId, imei)}>hapus</button>
    </div>
  );
}
