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
      IMEI: String(imei),
      userType: userType || "",
      desc: desc || "",
      price: addPrices.map((p) => ({
        type: p.type || "",
        amount: Number(p.amount) || 0,
      })),
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
        (p) => p.id !== item.id || (p.IMEI && p.IMEI.includes(imei) === false),
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
