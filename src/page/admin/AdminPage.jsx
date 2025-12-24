import { useState, useEffect, act } from "react";
import { userStore } from "../../state/state";
import styles from "./style.module.css"
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";
import { db } from "../../../firebase";
import { getDocs, collection, doc, where, query, Timestamp } from "firebase/firestore";
import { Row, Col, Card } from "antd";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from "recharts";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { DatePicker, Space } from 'antd';

import Empty from "../../components/item/Empty/Empty";
import Loader from "../../components/item/loader/Loader";

import userActivityLogic from "../../hooks/userActivityLogic";
import PopUp from "../../components/popUp/popUp";

export default function AdminPage() {

  const { active, toogleDeact } = userActivityLogic()
  
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
    {!active ? <></> :
      <div className={styles.overlay} onClick={toogleDeact}></div>
    }
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
      <div className={styles.sliderContainer}>
        {nav.map((item, index) => (
          <div key={index} className={styles.slider} onClick={() => setSelectedNav(item)} style={selectedNav == item ? {backgroundColor: "#773ff9", color: "white"} : {}}>{item}</div>
        ))}
      </div>
      <div>
        {selectedNav == "Beranda" ? <Beranda/> : <></>}
        {selectedNav == "Cek Stok" ? <Stok/> : <></>}
        {selectedNav == "Histori Penjualan" ? <History/> : <></>}
      </div>
    </div>
    </>
  )
}

function Beranda() {

  useEffect(() => {
    const fetchData = async () => {
      try {

      } catch(err) {
        console.error(err.message)
      }
    }
  })

  const data = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 2000 },
    { name: "Apr", sales: 2780 },
  ];

  return(
    <>
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </>
  )
}

function Stok() {

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState([])
  const [search, setSearch] = useState("")
  const [brandSearch, setBrandSearch] = useState("")

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
        setLoading(false)
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

  const filteredProduct = sortedProduct.filter((item) => {
    const matchProduct = item.product.toLowerCase().includes(search.toLowerCase());
    const matchBrand = item.brand.toLowerCase().includes(brandSearch.toLowerCase());
    return matchProduct && matchBrand;
  });

  const dd = String(new Date().getDate()).padStart(2, "0")
  const mm = String(new Date().getMonth() + 1).padStart(2, "0")
  const yy = String(new Date().getFullYear()).slice(-2)

  const handleDownloadExcel = () => {
    // Header
    const header = [
      "No",
      "Product",
      "Brand",
      "Kapasitas",
      "Color",
      "Stok",
    ];

    // Body
    const body = filteredProduct.map((item, index) => [
      index + 1,
      item.product,
      item.brand,
      item.capacity,
      item.color,
      item.IMEI?.length || 0,
    ]);

    // Total row
    const totalStok = filteredProduct.reduce(
      (sum, item) => sum + (item.IMEI?.length || 0),
      0
    );

    const data = [
      header,
      ...body,
      ["", "", "", "", "Total Stok", totalStok],
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Column width (biar rapi)
    ws["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
    ];

    // Styling
    const headerStyle = {
      font: { bold: true, color: {rgb: "FFFFFF"} },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "773ff9" } },
      border: {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const cellStyle = {
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Apply header style
    header.forEach((_, colIndex) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: colIndex })];
      if (cell) cell.s = headerStyle;
    });

    // Apply body style + brand odd/even background
    body.forEach((_, rowIndex) => {
      filteredProduct[rowIndex] &&
        header.forEach((_, colIndex) => {
          const cell = ws[
            XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex })
          ];
          if (cell) {
            const brandIndex = brand.indexOf(
              filteredProduct[rowIndex].brand?.toLowerCase()
            );

            cell.s = {
              ...cellStyle,
              fill: {
                fgColor: {
                  rgb: brandIndex % 2 === 0 ? "FFFFFF" : "F3F3F3",
                },
              },
            };
          }
        });
    });

    // Style total row
    const totalRowIndex = data.length - 1;
    header.forEach((_, colIndex) => {
      const cell = ws[
        XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex })
      ];
      if (cell) {
        cell.s = {
          font: { bold: true, color: {rgb: "FFFFFF"} },
          alignment: { horizontal: "right" },
          fill: { fgColor: { rgb: "773ff9" } },
          border: {
            top: { style: "medium" },
            bottom: { style: "medium" },
          },
        };
      }
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stok");

    // Export
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `stok-gudang-${dd}-${mm}-${yy}.xlsx`);
  };

  return(
    <>
    <div className={styles.itemContainer}>
      <div className={styles.topStock}>
        <div>
          <p style={{fontSize: "1.5rem"}}>Cek Ketersediaan Stok</p>
          <p style={{fontFamily: "SFProRegular", color: "#b3b3b3"}}>Informasi stok terkini berdasarkan data gudang</p>
        </div>
        <button
          className={styles.button}
          onClick={handleDownloadExcel}
        >
          Download Excel
        </button>
      </div>
      {loading ? <Loader/> :
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
              <th className={styles.search}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 20L15.514 15.506M18 9.5C18 11.7543 17.1045 13.9163 15.5104 15.5104C13.9163 17.1045 11.7543 18 9.5 18C7.24566 18 5.08365 17.1045 3.48959 15.5104C1.89553 13.9163 1 11.7543 1 9.5C1 7.24566 1.89553 5.08365 3.48959 3.48959C5.08365 1.89553 7.24566 1 9.5 1C11.7543 1 13.9163 1.89553 15.5104 3.48959C17.1045 5.08365 18 7.24566 18 9.5Z"
                    stroke="#773FF9"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </th>
              <th className={styles.search}>
                <input
                  placeholder="Cari produk"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{textAlign: "left"}}
                />
              </th>
               <th className={styles.search}>
                <input
                  placeholder="Cari brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  style={{textAlign: "center"}}
                />
              </th>
              <th className={styles.search} colSpan={3}></th>
            </tr>
          </thead>

          <tbody>
            {filteredProduct.map((item, index) => {
              const brandIndex = brand.indexOf(item.brand?.toLowerCase());
              const bgColor = brandIndex % 2 === 0 ? "#ffffff" : "#f3f3f3ff";
              return(
                <tr key={item.id ?? index} className={styles.tr} style={{ backgroundColor: bgColor }}>
                  <td className={`${styles.td} ${styles.tdCenter}`}>
                    {index + 1}
                  </td>
                  <td className={styles.td}>{item.product}</td>
                  <td className={styles.td}>{item.brand}</td>
                  <td className={styles.td}>{item.capacity}</td>
                  <td className={styles.td}>{item.color}</td>
                  <td className={styles.td}>{item.IMEI?.length || 0}</td>
                </tr>
            )})}
            <tr>
              <td className={styles.th} style={{textAlign: "right", fontFamily: "SFProBold"}} colSpan={6}>Total Stok: {filteredProduct.reduce((sum, item) => sum + (item.IMEI?.length || 0), 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      }
    </div>
    </>
  )
}

function History() {

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  //filter
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [month, setMonth] = useState("");
  const [tempRange, setTempRange] = useState(null); 

  const [open, setOpen] = useState(false)
  
  const brand = ["samsung", "xiaomi", "vivo", "oppo", "infinix", "realme", "tecno", "iphone", "nokia"]

  useEffect(() => {
    if (month) {
      setStartDate("");
      setEndDate("");
    }
  }, [month]);

  const buildQuery = () => {
    const baseRef = collection(db, "selling");

    // FILTER BULAN
    if (month) {
      const [year, m] = month.split("-");
      const startOfMonth = new Date(year, m - 1, 1);
      const startOfNextMonth = new Date(year, m, 1);

      return query(
        baseRef,
        where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
        where("createdAt", "<", Timestamp.fromDate(startOfNextMonth))
      );
    }

    // FILTER RANGE TANGGAL
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return query(
        baseRef,
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      );
    }

    // TANPA FILTER
    return query(baseRef);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = buildQuery();
        const snap = await getDocs(q);

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(data);
      } catch (err) {
        console.error("Fetch selling error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, month]);

  const generateMonths = (year) => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, "0");
      return {
        value: `${year}-${month}`,
        label: new Date(year, i).toLocaleString("id-ID", {
          month: "long",
          year: "numeric",
        }),
      };
    });
  };

  const months = generateMonths(new Date().getFullYear());

  const formatRupiah = (value) => {
    if(typeof value !== "number") return value
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const { active, toogleDeact, toogleActive } = userActivityLogic()
  const { RangePicker } = DatePicker;
  
  return(
    <>
    {/* FILTER */}
    {active &&
      <div className={styles.popupContainer}>
        <p className={styles.popupTitle}>Filter</p>
        <div className={styles.popupItemContainer}>
          <div className={styles.popupItemWrapper}>
            <p>Range Tanggal</p>
            <Space direction="vertical" size={12}>
              <RangePicker
                placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
                className={styles.inputDate}
                value={tempRange}
                onChange={(dates) => setTempRange(dates)}
                disabled={!!month}
              />
            </Space>
          </div>
        </div>
        <div className={styles.popupItemWrapper}>
          {(startDate || endDate || month) &&(
            <div className={styles.popupButton} style={{backgroundColor: "#DA0909"}}
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setMonth("");
              setTempRange(null)
              toogleDeact()
            }}>Reset Filter</div>
          )}
          <div className={styles.popupButton}
            onClick={() => {
              if (!tempRange) return;
              setStartDate(tempRange[0]);
              setEndDate(tempRange[1]);
              toogleDeact()
            }}
          >Filter</div>
        </div>
      </div>
    }
    {/*KOMPONEN*/}
    <div className={styles.itemContainer}>
      <div className={styles.topStock}>
        <div>
          <p style={{fontSize: "1.5rem"}}>Histori Penjualan</p>
          <p style={{fontFamily: "SFProRegular", color: "#b3b3b3"}}>Rekap data transaksi penjualan berdasarkan periode waktu</p>
        </div>
        <div style={{display: "flex", gap: "1rem"}}>
          <div onClick={toogleActive} className={styles.button}>Download Excel</div>
          <div onClick={toogleActive} className={styles.button}>Filter</div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <Loader />
      ) : history.length === 0 ? (
        <Empty />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {["No", "Produk", "Brand", "Kapasitas", "Tipe Pembayaran", "Total Harga", "Tanggal"].map(
                  (head) => (
                    <th key={head} className={styles.th}>
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={item.id} className={styles.tr}>
                  <td className={styles.td}>{index + 1}</td>
                  <td className={styles.td}>{item.product}</td>
                  <td className={styles.td}>{item.brand}</td>
                  <td className={styles.td}>{item.capacity}</td>
                  <td className={styles.td}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {item.price?.map((p, i) => (
                        <div
                          key={i}
                          className={styles.paymentType}
                          style={{
                            backgroundColor: p.type == "TF" ? "#E2FBEB" : p.type == "CS" ? "#E8F8FF" : "#FEE9FA",
                            color: p.type == "TF" ? "#2FB264" : p.type == "CS" ? "#748FC8" : "#AD5D89",
                          }}
                        >
                          {p.type} {formatRupiah(p.amount)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.td}>
                    {formatRupiah(
                      item.price?.reduce(
                      (sum, p) => sum + Number(p.amount || 0),
                      0
                    )
                    )}
                  </td>
                  <td className={styles.td}>
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleDateString("id-ID")
                      : new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
            
            <tr>
              <td colSpan="5">Jumlah Unit Terjual: {history.length}</td>
            </tr>
            <tr>
              <td colSpan="5">Total penjualan per brand: {history.filter((item) => item.brand == "samsung").length}</td>
            </tr>
            <tr>
              <td colSpan="5">Total pemasukan per tipe pembayaran: CS = {history.flatMap(item => item.price).filter(f => f.type == "CS").reduce((sum, i) => sum + i.amount, 0)} | TF = {history.flatMap(item => item.price).filter(f => f.type == "TF").reduce((sum, i) => sum + i.amount, 0)} | GS {history.flatMap(item => item.price).filter(f => f.type == "GS").reduce((sum, i) => sum + i.amount, 0)}</td>
            </tr>

          </table>
        </div>
      )}
    </div>
    </>
  )
}