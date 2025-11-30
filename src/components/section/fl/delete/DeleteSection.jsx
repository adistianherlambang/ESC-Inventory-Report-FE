import React, { useEffect } from "react";
import styles from "./style.module.css";
import { db } from "../../../../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  arrayUnion,
} from "firebase/firestore";

export default function DeleteSection({
  docId,
  imei,
  onClose,
  product,
  capacity,
  color,
  id,
  productType,
}) {

  const deleteReportByIMEI = async (docId, imei) => {
    try {
      const docRef = doc(db, "fldatas", docId);
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
        where("color", "==", color),
      );

      const querySnapshot = await getDocs(q);
      const productDocs = querySnapshot.docs[0];

      const productRef = doc(db, "allproducts", productDocs.id);
      await updateDoc(productRef, {
        IMEI: arrayUnion(String(imei)),
      });
    } catch (err) {
      console.error("Gagal hapus report:", err);
    } finally {
      window.location.reload();
    }
  };

  const deleteReportById = async (id) => {
    try {
      const docRef = doc(db, "fldatas", docId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const updatedReport = (data.report || []).filter((r) => r.id !== id);
      await updateDoc(docRef, { report: updatedReport });
    } catch (err) {
      console.error("Gagal: ", err);
    } finally {
      window.location.reload();
    }
  };

  if (productType === "acc") {
    return (
      <div className={styles.container}>
        <p className={styles.title}>Batalkan laporan?</p>
        <div className={styles.wrapper}>
          <p className={styles.desc}>
            Tindakan ini akan menghapus data laporan yang dipilih secara
            permanen. Apakah Anda yakin ingin melanjutkan?
          </p>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${styles.cancel}`}
              onClick={onClose}
            >
              Batalkan
            </button>
            <button
              className={`${styles.button} ${styles.yes}`}
              onClick={() => deleteReportById(id)}
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <p className={styles.title}>Batalkan laporan? {productType}</p>
        <div className={styles.wrapper}>
          <p className={styles.desc}>
            Tindakan ini akan menghapus data laporan dan mengembalikan stok IMEI
            ke daftar produk.Apakah Anda yakin ingin melanjutkan?
          </p>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${styles.cancel}`}
              onClick={onClose}
            >
              Batalkan
            </button>
            <button
              className={`${styles.button} ${styles.yes}`}
              onClick={() => deleteReportByIMEI(docId, imei)}
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  }
}
