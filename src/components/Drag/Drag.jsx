import React, { useRef, useState, useEffect } from "react";

export default function DragBox() {
  // State untuk menyimpan posisi kotak yang akan di-render
  const [pos, setPos] = useState({ x: 50, y: 50 }); 
  // Ref untuk menyimpan posisi saat ini agar bisa diakses di event handler tanpa delay
  const posRef = useRef(pos);
  // Update posRef setiap kali pos berubah
  useEffect(() => { posRef.current = pos; }, [pos]);

  // Ref untuk menandai apakah sedang melakukan drag
  const dragging = useRef(false);
  // Ref untuk menyimpan offset awal saat mulai drag (jarak antara titik sentuh dan posisi kotak)
  const startOffset = useRef({ x: 0, y: 0 });
  // Ref untuk menyimpan posisi terakhir yang dihitung saat drag
  const last = useRef({ x: 0, y: 0 });
  // Ref untuk menyimpan ID requestAnimationFrame agar bisa dibatalkan jika perlu
  const raf = useRef(null);

  // Handler saat sentuhan dimulai
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return; // Jika tidak ada sentuhan, abaikan
    const t = e.touches[0]; // Ambil sentuhan pertama
    dragging.current = true; // Tandai sedang drag
    // Hitung offset antara posisi sentuhan dan posisi kotak saat ini
    startOffset.current = { x: t.clientX - posRef.current.x, y: t.clientY - posRef.current.y };
  };

  // Handler saat sentuhan bergerak
  const handleTouchMove = (e) => {
    if (!dragging.current || !e.touches || e.touches.length === 0) return; // Abaikan jika tidak sedang drag atau tidak ada sentuhan
    const t = e.touches[0]; // Ambil sentuhan pertama
    // Hitung posisi baru kotak berdasarkan posisi sentuhan dikurangi offset awal
    last.current = { x: t.clientX - startOffset.current.x, y: t.clientY - startOffset.current.y };

    // Gunakan requestAnimationFrame untuk menghindari update state terlalu sering
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        setPos({ x: last.current.x, y: last.current.y }); // Update posisi kotak
        raf.current = null; // Reset raf ID setelah update
      });
    }
  };

  // Handler saat sentuhan berakhir atau dibatalkan
  const handleTouchEnd = () => {
    dragging.current = false; // Tandai drag selesai
    // Batalkan requestAnimationFrame jika masih ada yang tertunda
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        onTouchStart={handleTouchStart} // Event saat sentuhan dimulai
        onTouchMove={handleTouchMove}   // Event saat sentuhan bergerak
        onTouchEnd={handleTouchEnd}     // Event saat sentuhan berakhir
        onTouchCancel={handleTouchEnd}  // Event saat sentuhan dibatalkan
        style={{
          position: "absolute",        // Posisi absolut agar bisa dipindah-pindah
          width: 100,                  // Lebar kotak 100px
          height: 100,                 // Tinggi kotak 100px
          borderRadius: 12,            // Sudut membulat
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, // Pindahkan kotak sesuai posisi saat ini
          touchAction: "none",         // Nonaktifkan default gesture browser
          userSelect: "none",          // Nonaktifkan seleksi teks
          WebkitUserSelect: "none",    // Nonaktifkan seleksi teks di Safari
          background: "orange",        // Warna latar belakang oranye
        }}
      />
    </div>
  );
}