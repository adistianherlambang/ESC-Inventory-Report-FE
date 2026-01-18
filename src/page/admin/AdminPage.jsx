import { useState, useEffect, act } from "react";
import { userStore } from "../../state/state";
import styles from "./style.module.css";
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";
import { db } from "../../../firebase";
import {
  getDocs,
  collection,
  doc,
  where,
  query,
  Timestamp,
  deleteDoc,
  addDoc,
  orderBy
} from "firebase/firestore";
import { Row, Col, Card } from "antd";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import {
  AreaChart,
  Area,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { DatePicker, Space } from "antd";

import Empty from "../../components/item/Empty/Empty";
import Loader from "../../components/item/loader/Loader";

import userActivityLogic from "../../hooks/userActivityLogic";
import PopUp from "../../components/popUp/PopUp";

export default function AdminPage() {
  const { active, toogleDeact } = userActivityLogic();

  const user = userStore((state) => state.currentUser);
  const logout = userStore((state) => state.logout);

  const [selectedNav, setSelectedNav] = useState("Beranda");

  const nav = [
    "Beranda",
    "Cek Stok",
    "Histori Penjualan",
    "Manajemen Karyawan",
  ];

  return (
    <>
      {!active ? (
        <></>
      ) : (
        <div className={styles.overlay} onClick={toogleDeact}></div>
      )}
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
            <div
              key={index}
              className={styles.slider}
              onClick={() => setSelectedNav(item)}
              style={
                selectedNav == item
                  ? { backgroundColor: "#773ff9", color: "white" }
                  : {}
              }
            >
              {item}
            </div>
          ))}
        </div>
        <div>
          {selectedNav == "Beranda" ? <Beranda /> : <></>}
          {selectedNav == "Cek Stok" ? <Stok /> : <></>}
          {selectedNav == "Histori Penjualan" ? <History /> : <></>}
          {selectedNav == "Manajemen Karyawan" ? <Employee /> : <></>}
        </div>
      </div>
    </>
  );
}

function Beranda() {
  const [selling, setSelling] = useState([]);
  const [outflow, setOutflow] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = collection(db, "outflow");
        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOutflow(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = collection(db, "selling");
        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSelling(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  });

  const data = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 2000 },
    { name: "Apr", sales: 2780 },
  ];

  const formatRupiah = (value) => {
    if (typeof value !== "number") return value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const wibYesterday = new Date(wib);
  wibYesterday.setDate(wibYesterday.getDate() - 1);
  const yesterday = wibYesterday.toISOString().split("T")[0];
  const date = wib.toISOString().split("T")[0];

  const dateFilter = selling.filter((r) => {
    const reportDate = r.createdAt?.toDate()?.toLocaleDateString("en-CA");
    return reportDate === date;
  });

  const sellingToday = selling
    .filter((r) => {
      const reportDate = r.createdAt?.toDate()?.toLocaleDateString("en-CA");
      return reportDate === date;
    })
    .flatMap((item) => item.price);

  const sellingYesterday = selling
    .filter((r) => {
      const reportDate = r.createdAt?.toDate()?.toLocaleDateString("en-CA");
      return reportDate === yesterday;
    })
    .flatMap((item) => item.price)
    .reduce((sum, item) => sum + item.amount, 0);

  const percentage =
    sellingYesterday === 0
      ? 0
      : (sellingToday.reduce((sum, item) => sum + item.amount, 0) * 100) /
        sellingYesterday;

  const outflowToday = outflow.filter((r) => {
    const reportDate = r.createdAt?.toDate()?.toLocaleDateString("en-CA");
    return reportDate === date;
  });

  const getMonthlySelling = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const grouped = {};

    selling.forEach(doc => {
      if (!doc.createdAt || !doc.price) return;

      const date = doc.createdAt.toDate();
      if (date.getMonth() !== month || date.getFullYear() !== year) return;

      const key = `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const total = doc.price.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      if (!grouped[key]) {
        grouped[key] = {
          createdAt: key,
          dateObj: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          total: 0,
        };
      }

      grouped[key].total += total;
    });

    return Object.values(grouped)
      .sort((a, b) => a.dateObj - b.dateObj)
      .map(({ dateObj, ...rest }) => rest);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: "100%", display: "flex", gap: "1rem" }}>
          <div
            className={styles.itemContainer}
            style={{
              color: "#FFF1FF",
              backgroundColor: "#773FF9",
              width: "100%",
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.25 21.75H11.25M8.75 13.25H15.25M8.75 9.75H15.25M8.75 6.25H15.25M20.25 0.75H18.75V6.25H23.25V3.75C23.25 2.95435 22.9339 2.19129 22.3713 1.62868C21.8087 1.06607 21.0456 0.75 20.25 0.75Z"
                    stroke="#773FF9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.5 17.25H3.75C2.95435 17.25 2.19129 17.5661 1.62868 18.1287C1.06607 18.6913 0.75 19.4544 0.75 20.25V23.25H11.25V19.5C11.25 18.9033 11.4871 18.331 11.909 17.909C12.331 17.4871 12.9033 17.25 13.5 17.25ZM13.5 17.25C14.0967 17.25 14.669 17.4871 15.091 17.909C15.5129 18.331 15.75 18.9033 15.75 19.5V20.25C15.75 20.6478 15.908 21.0294 16.1893 21.3107C16.4706 21.592 16.8522 21.75 17.25 21.75C17.6478 21.75 18.0294 21.592 18.3107 21.3107C18.592 21.0294 18.75 20.6478 18.75 20.25V0.75H8.25C7.45435 0.75 6.69129 1.06607 6.12868 1.62868C5.56607 2.19129 5.25 2.95435 5.25 3.75V17.25"
                    stroke="#773FF9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  backgroundColor:
                    sellingToday.reduce((sum, item) => sum + item.amount, 0) >
                    sellingYesterday
                      ? "#74F57F"
                      : "#FF413F",
                  color:
                    sellingToday.reduce((sum, item) => sum + item.amount, 0) >
                    sellingYesterday
                      ? "#00950D"
                      : "white",
                  padding: "4px 8px",
                  height: "max-content",
                  fontSize: "12px",
                  borderRadius: "1rem",
                }}
              >
                {percentage.toFixed(1)}%
              </div>
            </div>
            <div className={styles.dataTextContainer}>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "SFProRegular",
                    color: "#CDA1FF",
                  }}
                >
                  Pemasukan hari ini
                </p>
                <p className={styles.dataText}>
                  {formatRupiah(
                    dateFilter
                      .flatMap((item) => item.price)
                      .reduce((sum, item) => sum + item.amount, 0),
                  )}
                </p>
              </div>
              <div className={styles.dataTextTypeContainer}>
                <p className={styles.dataTextType}>
                  Cash
                  {(" ") + formatRupiah(
                    sellingToday
                      .filter((item) => item.type == "CS")
                      .reduce((sum, item) => sum + item.amount, 0)
                    )}
                </p>
                <p className={styles.dataTextType}>
                  Transfer
                  {(" ") + formatRupiah(
                    sellingToday
                      .filter((item) => item.type == "TF")
                      .reduce((sum, item) => sum + item.amount, 0)
                    )}
                </p>
                <p className={styles.dataTextType}>
                  Debit
                  {(" ") + formatRupiah(
                    sellingToday
                      .filter((item) => item.type == "GS")
                      .reduce((sum, item) => sum + item.amount, 0)
                    )}
                </p>
              </div>
            </div>
          </div>
          <div
            className={styles.itemContainer}
            style={{
              color: "#FFF1FF",
              backgroundColor: "#773FF9",
              width: "100%",
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                width: "3rem",
                height: "3rem",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="26"
                viewBox="0 0 21 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.4209 23.168H10.579"
                  stroke="#773FF9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.667 1H7.33313L8.12505 4.16692H12.8751L13.667 1Z"
                  stroke="#773FF9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.4169 1H2.58308C1.70908 1 1 1.70908 1 2.58308V27.9169C1 28.7909 1.70908 29.5 2.58308 29.5H18.4169C19.2909 29.5 20 28.7909 20 27.9169V2.58308C20 1.70908 19.2909 1 18.4169 1Z"
                  stroke="#773FF9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontFamily: "SFProRegular",
                  color: "#CDA1FF",
                }}
              >
                Unit terjual hari ini
              </p>
              <p className={styles.dataText}>
                {dateFilter.filter((item) => !item.type).length} Unit
              </p>
            </div>
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", gap: "1rem" }}>
          <div
            className={styles.itemContainer}
            style={{
              color: "#ffffffff",
              backgroundColor: "#DA0909",
              width: "100%",
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                width: "3rem",
                height: "3rem",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.7 6C14.501 5.43524 14.1374 4.94297 13.6563 4.58654C13.1751 4.23011 12.5983 4.02583 12 4H8M5.443 5.431C5.16402 5.88565 5.01131 6.40646 5.0006 6.93978C4.98989 7.47309 5.12158 7.99961 5.38208 8.46509C5.64258 8.93058 6.02249 9.31819 6.48265 9.58798C6.94281 9.85778 7.46658 10 8 10H10M14.564 14.558C14.2964 14.9983 13.92 15.3623 13.4709 15.6148C13.0218 15.8674 12.5152 16 12 16H8C7.40175 15.9742 6.82491 15.7699 6.34373 15.4135C5.86255 15.057 5.49905 14.5648 5.3 14M10 1V4M10 16V19M1 1L19 19"
                  stroke="#DA0909"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "SFProRegular",
                    color: "#f4d0d0ff",
                  }}
                >
                  Pengeluaran hari ini
                </p>
                <p className={styles.dataText}>
                  {formatRupiah(
                    outflowToday.reduce((sum, item) => sum + item.amount, 0),
                  )}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  color: "#DA0909",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                Detail Pengeluaran :
                {outflowToday.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "solid #DA0909 1px",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p>{item.name}</p>
                      <p style={{ fontFamily: "SFProRegular" }}>
                        Kategori:{" "}
                        <span style={{ fontFamily: "SFProBold" }}>
                          {item.desc}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily: "SFProRegular" }}>Total:</p>
                      <p>{formatRupiah(item.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", gap: "1rem" }}>
          <div className={styles.itemContainer}
          style={{width: "100%"}}>
            <p className={styles.dataText} style={{textAlign: "center"}}>Data penjualan dalam sebulan</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={getMonthlySelling()}
                style={{ fontSize: 10 }}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="createdAt" tick={{ fontSize: 10 }} />
                <YAxis
                  width={30}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v / 1000000 + "jt"}
                />
                <Tooltip
                  formatter={(v) => "Rp " + v.toLocaleString("id-ID")}
                  labelStyle={{ fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function Stok() {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState([]);
  const [search, setSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "allproducts"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProduct(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  });

  const brand = [
    "samsung",
    "xiaomi",
    "vivo",
    "oppo",
    "infinix",
    "realme",
    "tecno",
    "iphone",
    "nokia",
  ];

  const capacityOrder = [
    "4/64",
    "4/128",
    "4/256",
    "6/128",
    "6/256",
    "8/128",
    "8/256",
    "12/256",
    "12/512",
  ];

  function normalizeString(value) {
    return (value || "")
      .toString()
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  const sortedProduct = [...product].sort((a, b) => {
  const aBrand = normalizeString(a.brand);
  const bBrand = normalizeString(b.brand);

  const aBrandIndex = brand.indexOf(aBrand);
    const bBrandIndex = brand.indexOf(bBrand);

    // 1️⃣ brand tidak ada di list → taruh di bawah
    if (aBrandIndex === -1 && bBrandIndex === -1) {
      const productCompare = normalizeString(a.product).localeCompare(
        normalizeString(b.product),
        "id",
        { sensitivity: "base" }
      );
      if (productCompare !== 0) return productCompare;

      const aCapIndex = capacityOrder.indexOf(normalizeString(a.capacity));
      const bCapIndex = capacityOrder.indexOf(normalizeString(b.capacity));

      if (aCapIndex === -1 && bCapIndex === -1) return 0;
      if (aCapIndex === -1) return 1;
      if (bCapIndex === -1) return -1;

      return aCapIndex - bCapIndex;
    }

    if (aBrandIndex === -1) return 1;
    if (bBrandIndex === -1) return -1;

    // 2️⃣ urutan brand
    if (aBrandIndex !== bBrandIndex) {
      return aBrandIndex - bBrandIndex;
    }

    // 3️⃣ brand sama → sort product (STRING)
    const productCompare = normalizeString(a.product).localeCompare(
      normalizeString(b.product),
      "id",
      { sensitivity: "base" }
    );
    if (productCompare !== 0) return productCompare;

    // 4️⃣ product sama → sort kapasitas (PAKAI URUTAN MANUAL)
    const aCapIndex = capacityOrder.indexOf(normalizeString(a.capacity));
    const bCapIndex = capacityOrder.indexOf(normalizeString(b.capacity));

    if (aCapIndex === -1 && bCapIndex === -1) return 0;
    if (aCapIndex === -1) return 1;
    if (bCapIndex === -1) return -1;

    return aCapIndex - bCapIndex;
  });

  const filteredProduct = sortedProduct.filter((item) => {
    const matchProduct = normalizeString(item.product).includes(
      normalizeString(search)
    );

    const matchBrand = normalizeString(item.brand).includes(
      normalizeString(brandSearch)
    );

    return matchProduct && matchBrand;
  });

  const dd = String(new Date().getDate()).padStart(2, "0");
  const mm = String(new Date().getMonth() + 1).padStart(2, "0");
  const yy = String(new Date().getFullYear()).slice(-2);

  const handleDownloadExcel = () => {
    // Header
    const header = ["No", "Product", "Brand", "Kapasitas", "Color", "Stok"];

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
      0,
    );

    const data = [header, ...body, ["", "", "", "", "Total Stok", totalStok]];

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
      font: { bold: true, color: { rgb: "FFFFFF" } },
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
          const cell =
            ws[XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex })];
          if (cell) {
            const brandIndex = brand.indexOf(
              filteredProduct[rowIndex].brand?.toLowerCase(),
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
      const cell =
        ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
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

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "allproducts", id));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <div className={styles.itemContainer}>
        <div className={styles.topStock}>
          <div>
            <p style={{ fontSize: "1.5rem" }}>Cek Ketersediaan Stok</p>
            <p style={{ fontFamily: "SFProRegular", color: "#b3b3b3" }}>
              Informasi stok terkini berdasarkan data gudang
            </p>
          </div>
          <button className={styles.button} onClick={handleDownloadExcel}>
            Download Excel
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={`${styles.th} ${styles.thNo}`}>No</th>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th}>Brand</th>
                  <th className={styles.th}>Kapasitas</th>
                  <th className={styles.th}>Warna</th>
                  <th className={styles.th}>Stok</th>
                  <th className={styles.th}>Aksi</th>
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
                      style={{ textAlign: "left" }}
                    />
                  </th>
                  <th className={styles.search}>
                    <input
                      placeholder="Cari brand"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      style={{ textAlign: "center" }}
                    />
                  </th>
                  <th className={styles.search} colSpan={4}></th>
                </tr>
              </thead>

              <tbody>
                {filteredProduct.map((item, index) => {
                  const brandIndex = brand.indexOf(item.brand?.toLowerCase());
                  const bgColor =
                    brandIndex % 2 === 0 ? "#ffffff" : "rgba(237, 237, 237, 1)";
                  return (
                    <tr
                      key={item.id ?? index}
                      className={styles.tr}
                      style={{ backgroundColor: bgColor }}
                    >
                      <td className={`${styles.td} ${styles.tdCenter}`}>
                        {index + 1}
                      </td>
                      <td className={styles.td}>{item.product}</td>
                      <td className={styles.td}>{item.brand}</td>
                      <td className={styles.td}>{item.capacity}</td>
                      <td className={styles.td}>{item.color}</td>
                      <td className={styles.td}>{item.IMEI?.length || 0}</td>
                      <td className={styles.td}>
                        <div
                          onClick={() => deleteProduct(item.id)}
                          className={styles.paymentType}
                          style={{
                            backgroundColor: "#DA0909",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td
                    className={styles.th}
                    style={{ textAlign: "right", fontFamily: "SFProBold" }}
                    colSpan={7}
                  >
                    Total Stok:{" "}
                    {filteredProduct.reduce(
                      (sum, item) => sum + (item.IMEI?.length || 0),
                      0,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  //filter
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [month, setMonth] = useState("");
  const [tempRange, setTempRange] = useState(null);

  const [open, setOpen] = useState(false);

  const brand = [
    "samsung",
    "xiaomi",
    "vivo",
    "oppo",
    "infinix",
    "realme",
    "tecno",
    "iphone",
    "nokia",
  ];

  const bottomTypes = ["service", "free"];

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
        where("createdAt", "<", Timestamp.fromDate(startOfNextMonth)),
        orderBy("createdAt", "asc")
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
        where("createdAt", "<=", end),
        orderBy("createdAt", "asc")
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

        const data = snap.docs.map((doc) => ({
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
    if (typeof value !== "number") return value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDownloadExcel = () => {
    // ================= HEADER =================
    const header = [
      "No",
      "Produk",
      "Kapasitas",
      "Warna",
      "Brand",
      "Tipe Pembayaran",
      "Total Harga",
      "Tanggal",
    ];

    // ================= BODY =================
    const body = history.map((item, index) => [
      index + 1,
      item.product,
      item.capacity,
      item.color,
      item.brand,
      item.price.map((p) => `${p.type} ${formatRupiah(p.amount)}`).join(", "),
      formatRupiah(
        item.price.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      ),
      item.createdAt?.toDate
        ? item.createdAt.toDate().toLocaleDateString("id-ID")
        : new Date(item.createdAt).toLocaleDateString("id-ID"),
    ]);

    // ================= SUMMARY =================
    const summary = [
      [`Jumlah Unit Terjual: ${history.length}`],
      ...brand.map((b) => [
        `Total Brand ${b} Terjual: ${history.filter((i) => i.brand === b).length}`,
      ]),
      [
        `Total CS: ${formatRupiah(
          history
            .flatMap((i) => i.price)
            .filter((p) => p.type === "CS")
            .reduce((s, p) => s + p.amount, 0),
        )}`,
      ],
      [
        `Total TF: ${formatRupiah(
          history
            .flatMap((i) => i.price)
            .filter((p) => p.type === "TF")
            .reduce((s, p) => s + p.amount, 0),
        )}`,
      ],
      [
        `Total GS: ${formatRupiah(
          history
            .flatMap((i) => i.price)
            .filter((p) => p.type === "GS")
            .reduce((s, p) => s + p.amount, 0),
        )}`,
      ],
    ];

    // ================= SHEET =================
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, [], ...summary]);

    // ================= STYLING =================

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "773FF9" } },
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
    // Header style
    header.forEach((_, col) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: col });
      ws[cell].s = headerStyle;
    });

    // Body style
    body.forEach((_, r) => {
      header.forEach((_, c) => {
        const cell = XLSX.utils.encode_cell({ r: r + 1, c });
        if (ws[cell]) ws[cell].s = cellStyle;
      });
    });

    // Merge summary rows (colSpan = 8)
    const startSummaryRow = body.length + 2;
    ws["!merges"] = summary.map((_, i) => ({
      s: { r: startSummaryRow + i, c: 0 },
      e: { r: startSummaryRow + i, c: 7 },
    }));

    // Column width
    ws["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];

    // ================= WORKBOOK =================
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

    XLSX.writeFile(wb, "laporan-penjualan.xlsx");
  };

  const { active, toogleDeact, toogleActive } = userActivityLogic();
  const { RangePicker } = DatePicker;

  return (
    <>
      {/* FILTER */}
      {active && (
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
            {(startDate || endDate || month) && (
              <div
                className={styles.popupButton}
                style={{ backgroundColor: "#DA0909" }}
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setMonth("");
                  setTempRange(null);
                  toogleDeact();
                }}
              >
                Reset Filter
              </div>
            )}
            <div
              className={styles.popupButton}
              onClick={() => {
                if (!tempRange) return;
                setStartDate(tempRange[0]);
                setEndDate(tempRange[1]);
                toogleDeact();
              }}
            >
              Filter
            </div>
          </div>
        </div>
      )}
      {/* KOMPONEN */}
      <div className={styles.itemContainer}>
        <div className={styles.topStock}>
          <div>
            <p style={{ fontSize: "1.5rem" }}>Histori Penjualan</p>
            <p style={{ fontFamily: "SFProRegular", color: "#b3b3b3" }}>
              Rekap data transaksi penjualan berdasarkan periode waktu
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div onClick={handleDownloadExcel} className={styles.button}>
              Download Excel
            </div>
            <div onClick={toogleActive} className={styles.button}>
              Filter
            </div>
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
                  {[
                    "No",
                    "Produk",
                    "Kapasitas",
                    "Warna",
                    "Brand",
                    "Pelapor",
                    "Tipe Pembayaran",
                    "Total Harga",
                    "Tanggal",
                  ].map((head) => (
                    <th key={head} className={styles.th}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {history.sort((a, b) => {
                  
                  // 1️⃣ type tertentu ke paling bawah
                  const aBottom = bottomTypes.includes(a.type);
                  const bBottom = bottomTypes.includes(b.type);

                  if (aBottom && !bBottom) return 1;
                  if (!aBottom && bBottom) return -1;

                  // 2️⃣ sort brand sesuai array `brand`
                  const aBrandIndex = brand.indexOf((a.brand || "").toLowerCase());
                  const bBrandIndex = brand.indexOf((b.brand || "").toLowerCase());

                  if (aBrandIndex === -1 && bBrandIndex !== -1) return 1;
                  if (aBrandIndex !== -1 && bBrandIndex === -1) return -1;

                  if (aBrandIndex !== bBrandIndex) {
                    return aBrandIndex - bBrandIndex;
                  }

                  // 3️⃣ sort product (STRING)
                  const productCompare = (a.product || "").localeCompare(
                    b.product || "",
                    "id",
                    { sensitivity: "base" }
                  );
                  if (productCompare !== 0) return productCompare;

                  // 4️⃣ fallback: sort name (STRING)
                  return (a.name || "").localeCompare(
                    b.name || "",
                    "id",
                    { sensitivity: "base" }
                  );
                })
                .map((item, index) => (
                  <tr key={item.id} className={styles.tr}>
                    <td className={styles.td}>{index + 1}</td>
                    <td className={styles.td}>{item.product}</td>
                    <td className={styles.td}>{item.capacity}</td>
                    <td className={styles.td}>{item.color}</td>
                    <td className={styles.td}>{item.brand}</td>
                    <td className={styles.td}>{item.name}</td>
                    <td className={styles.td}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {item.price?.map((p, i) => (
                          <div
                            key={i}
                            className={styles.paymentType}
                            style={{
                              backgroundColor:
                                p.type == "TF"
                                  ? "#E2FBEB"
                                  : p.type == "CS"
                                    ? "#E8F8FF"
                                    : "#FEE9FA",
                              color:
                                p.type == "TF"
                                  ? "#2FB264"
                                  : p.type == "CS"
                                    ? "#748FC8"
                                    : "#AD5D89",
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
                          0,
                        ),
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
                <td colSpan="8">Jumlah Unit Terjual: {history.length}</td>
              </tr>
              {brand.map((item) => (
                <tr>
                  <td colSpan="8">
                    Total Brand{" "}
                    <b>
                      <i>{item}</i>
                    </b>{" "}
                    Terjual: {history.filter((i) => i.brand == item).length}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="8">
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <p>Total pemasukan:</p>
                    {formatRupiah(history.flatMap((item) => item.price).reduce((sum, item) => sum + item.amount, 0))}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan="8">
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <p>Total pemasukan per tipe pembayaran:</p>
                    <div
                      className={styles.paymentType}
                      style={{
                        backgroundColor: "#E8F8FF",
                        color: "#748FC8",
                      }}
                    >
                      {" "}
                      CS{" "}
                      {formatRupiah(
                        history
                          .flatMap((item) => item.price)
                          .filter((f) => f.type == "CS")
                          .reduce((sum, i) => sum + i.amount, 0),
                      )}
                    </div>
                    <div
                      className={styles.paymentType}
                      style={{
                        backgroundColor: "#E2FBEB",
                        color: "#2FB264",
                      }}
                    >
                      {" "}
                      TF{" "}
                      {formatRupiah(
                        history
                          .flatMap((item) => item.price)
                          .filter((f) => f.type == "TF")
                          .reduce((sum, i) => sum + i.amount, 0),
                      )}
                    </div>
                    <div
                      className={styles.paymentType}
                      style={{
                        backgroundColor: "#FEE9FA",
                        color: "#AD5D89",
                      }}
                    >
                      {" "}
                      GS{" "}
                      {formatRupiah(
                        history
                          .flatMap((item) => item.price)
                          .filter((f) => f.type == "GS")
                          .reduce((sum, i) => sum + i.amount, 0),
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Employee() {
  const { active, toogleDeact, toogleActive } = userActivityLogic();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = collection(db, "users");
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUser(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  });

  const role = ["admin", "fl", "pmt"];

  const sorted = [...user].sort(
    (a, b) => role.indexOf(a.role) - role.indexOf(b.role),
  );

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (err) {
      console.error(err.message);
    }
  };

  const [uploadData, setUploadData] = useState({
    name: "",
    role: "",
    brand: "",
    unique: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUploadData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users"), uploadData);
      if (uploadData.brand) {
        const data = {
          brand: uploadData.brand,
          name: uploadData.name,
          report: [],
        };
        await addDoc(collection(db, "pmtdatas"), data);
      } else {
        const data = {
          name: uploadData.name,
          report: [],
        };
        await addDoc(collection(db, "fldatas"), data)
      }
      setUploadData({ name: "", role: "", brand: "", unique: "" });
      toogleDeact();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      {active && (
        <div className={styles.popupContainer}>
          <p className={styles.popupTitle}>Tambahkan Karyawan</p>
          <div className={styles.popupItemContainer}>
            <div className={styles.popupItemWrapper}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label>Nama</label>
                <input
                  placeholder="Nama Karyawan"
                  className={styles.popupInput}
                  type="text"
                  name="name"
                  value={uploadData.name}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label>Posisi</label>
                  <select
                    className={styles.popupInputSelect}
                    value={uploadData.role}
                    name="role"
                    onChange={handleChange}
                  >
                    <option value="" disabled hidden>
                      Pilih role
                    </option>
                    <option value="fl">FL</option>
                    <option value="admin">Admin</option>
                    <option value="pmt">PMT</option>
                  </select>
                </div>
                {uploadData.role === "pmt" && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label>Brand</label>
                    <select
                      className={styles.popupInputSelect}
                      value={uploadData.brand}
                      name="brand"
                      onChange={handleChange}
                    >
                      <option value="" disabled hidden>
                        Pilih role
                      </option>
                      <option value="samsung">Samsung</option>
                      <option value="xiaomi">XIaomi</option>
                      <option value="vivo">Vivo</option>
                      <option value="oppo">Oppo</option>
                      <option value="infinix">Infinix</option>
                      <option value="Realme">Realme</option>
                      <option value="tecno">Tecno</option>
                    </select>
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label>Password</label>
                <input
                  placeholder="Masukkan Password"
                  className={styles.popupInput}
                  type="text"
                  name="unique"
                  value={uploadData.unique}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.popupButton} onClick={addUser}>
              Submit
            </div>
          </div>
        </div>
      )}
      <div className={styles.itemContainer}>
        <div className={styles.topStock}>
          <div>
            <p style={{ fontSize: "1.5rem" }}>Manajemen Karyawan</p>
            <p style={{ fontFamily: "SFProRegular", color: "#b3b3b3" }}>
              Lakukan manajemen karyawan secara realtime
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div onClick={toogleActive} className={styles.button}>
              Tambah Karyawan
            </div>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : sorted.length === 0 ? (
          <Empty />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={`${styles.th} ${styles.thNo}`}>No</th>
                  <th className={styles.th}>Nama</th>
                  <th className={styles.th}>Posisi/Brand</th>
                  <th className={styles.th}>Password</th>
                  <th className={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, index) => (
                  <tr key={item.id ?? index} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdCenter}`}>
                      {index + 1}
                    </td>
                    <td className={styles.td}>{item.name}</td>
                    {item.role == "pmt" ? (
                      <td className={styles.td}>Promotor {item.brand}</td>
                    ) : (
                      <td className={styles.td}>{item.role}</td>
                    )}
                    <td className={styles.td}>{item.unique}</td>
                    <td className={`${styles.td} ${styles.tdCenter}`}>
                      <div
                        onClick={() => deleteUser(item.id)}
                        className={styles.paymentType}
                        style={{
                          backgroundColor: "#DA0909",
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
