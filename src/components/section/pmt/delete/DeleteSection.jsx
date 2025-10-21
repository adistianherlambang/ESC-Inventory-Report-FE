import React from "react";
import styles from "./style.module.css";

export default function DeleteSection({ docId, imei, onClose }) {
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
    } catch (err) {
      console.error("Gagal hapus report:", err);
    }
  };

  return (
    <div className={styles.container}>
      {docId}
      <p>{imei}</p>
      <button onClick={deleteReportByIMEI}>hapus</button>
    </div>
  );
}
