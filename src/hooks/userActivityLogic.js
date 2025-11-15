import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { pmtReport, userStore } from "../state/state";

export default function userActivityLogic() {
  const { currentUser } = userStore();

  const [pmtData, setPmtData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFiltered, setDateFiltered] = useState([]);

  const [isEditing, setIsEditing] = useState("");
  const [isDeleting, setIsDeleting] = useState("");
  const [editData, setEditData] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedImei, setSelectedImei] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");

  const { active, toogleActive, toogleDeact } = pmtReport();

  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const date = wib.toISOString().split("T")[0];

  /** FORMAT RUPIAH */
  const formatRupiah = (value) => {
    if (typeof value !== "number") return value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  /** FETCH DATA PMT */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "pmtdatas"),
          where("name", "==", currentUser?.name)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setPmtData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser?.name, isEditing]);

  /** FILTER DATA BY DATE */
  useEffect(() => {
    const filtered = pmtData
      .map((item) => ({
        ...item,
        report: item.report.filter((r) => {
          const reportDate = r.createdAt?.toDate()?.toLocaleDateString("en-CA");
          return reportDate === date;
        }),
      }))
      .filter((item) => item.report.length > 0);

    setDateFiltered(filtered);
  }, [pmtData, date]);

  /** HANDLERS */
  const handleEdit = ({ id, imei }) => {
    setEditData(dateFiltered);
    setIsEditing("handphone");
    setSelectedId(id);
    setSelectedImei(imei);
  };

  const handleDelete = ({ id, imei, product, color, capacity }) => {
    setSelectedId(id);
    setSelectedImei(imei);
    setIsDeleting("handphone");
    setSelectedProduct(product);
    setSelectedColor(color);
    setSelectedCapacity(capacity);
  };

  return {
    pmtData,
    loading,
    dateFiltered,
    isEditing,
    isDeleting,
    selectedId,
    selectedImei,
    selectedProduct,
    selectedColor,
    selectedCapacity,
    editData,
    active,
    toogleActive,
    toogleDeact,
    setIsEditing,
    setIsDeleting,
    handleEdit,
    handleDelete,
    formatRupiah,
    date,
  };
}