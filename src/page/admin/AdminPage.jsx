import { useState, useEffect } from "react";
import { userStore } from "../../state/state";
import styles from "./style.module.css"
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";
import { db } from "../../../firebase";
import { getDocs, collection, doc, where, query } from "firebase/firestore";
import { Row, Col, Card } from "antd";

export default function AdminPage() {
  
  const user = userStore((state) => state.currentUser)
  const logout = userStore((state) => state.logout)

  const [selectedNav, setSelectedNav] = useState("Beranda")

  const nav = [
    "Beranda",
    "Cek Stok",
    "Histori Penjualan",
    "Manajemen Karyawan"
  ]

  return(
    <>
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.topContainer}>
          <Logo />
          <div onClick={logout} className={styles.logoutButton}>
            <LogoutIcon />
            Logout
          </div>
        </div>
        <div className={styles.pmtContainer}>
          <p>Bismillah, {user.name}👋</p>
          <p className={styles.pmt}>Admin</p>
        </div>
      </div>
      {/* <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            minWidth: "600px", // kunci biar bisa scroll
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb", width: 60 }}>No</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Product</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Color</th>
            </tr>
          </thead>
          <tbody>
            {product
            .sort((a, b) => a.product.localeCompare(b.product))
            .map((item, index) => (
              <tr key={item.id ?? index}>
                <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                  {index + 1}
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
                  {item.product}
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
                  {item.color}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
      <div className={styles.sliderContainer}>
        {nav.map((item, index) => (
          <div key={index} className={styles.slider} onClick={() => setSelectedNav(item)} style={selectedNav == item ? {backgroundColor: "#773ff9", color: "white"} : {}}>{item}</div>
        ))}
      </div>
      <div style={{maxWidth: "100%"}}>
        {selectedNav == "Cek Stok" ? <Stok/> : <></>}
      </div>
    </div>
    </>
  )
}

function Stok() {

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "allproducts")
        )
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setProduct(data)
      } catch(err) {
        console.error(err.message)
      } finally {
        setLoading(true)
      }
    }
    fetchData()
  })

  const brand = ["samsung", "xiaomi", "vivo", "oppo", "infinix", "realme", "tecno", "iphone", "nokia"]
  
  const sortedProduct = [...product].sort((a, b) => {
    const aIndex = brand.indexOf(a.brand?.toLowerCase());
    const bIndex = brand.indexOf(b.brand?.toLowerCase());

    // jika brand tidak ada di array → taruh di bawah
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  const filteredProduct = sortedProduct.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={`${styles.th} ${styles.thNo}`}>No</th>
            <th className={styles.th}>Product</th>
            <th className={styles.th}>Brand</th>
            <th className={styles.th}>Kapasitas</th>
            <th className={styles.th}>Color</th>
            <th className={styles.th}>Stok</th>
          </tr>

          <tr>
            <th className={styles.search} colSpan={6}>
              <input
                placeholder="Cari produk"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{textAlign: "left"}}
              />
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredProduct.map((item, index) => (
            <tr key={item.id ?? index} className={styles.tr}>
              <td className={`${styles.td} ${styles.tdCenter}`}>
                {index + 1}
              </td>
              <td className={styles.td}>{item.product}</td>
              <td className={styles.td}>{item.brand}</td>
              <td className={styles.td}>{item.capacity}</td>
              <td className={styles.td}>{item.color}</td>
              <td className={styles.td}>{item.IMEI?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
}