import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { pmtReport, userStore } from "../state/state";

export default function userActivityLogic() {
  const { currentUser } = userStore();

  const [pmtData, setPmtData] = useState([]);
  const [flData, setFLData] = useState([]);
  const [adminData, setAdminData] = useState([])

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

  //stock
  const [addStock, setAddStock] = useState(false);

  const [allTotal, setAllTotal] = useState(0);

  const [idAcc, setIdAcc] = useState("");
  const [productType, setProductType] = useState("");

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

  if (currentUser?.role == "pmt") {
    /** FETCH DATA DARI PMT */
    useEffect(() => {
      const fetchData = async () => {
        try {
          const q = query(
            collection(db, "pmtdatas"),
            where("name", "==", currentUser?.name),
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
            const reportDate = r.createdAt
              ?.toDate()
              ?.toLocaleDateString("en-CA");
            return reportDate === date;
          }),
        }))
        .filter((item) => item.report.length > 0);

      setDateFiltered(filtered);
      const totalAmount = (filtered || []).reduce((sumItems, item) => {
        const reports = item.report || [];
        const sumReports = reports.reduce((sumReport, report) => {
          const sumPrice = (report.price || []).reduce(
            (sumP, p) => sumP + (p.amount || 0),
            0,
          );
          return sumReport + sumPrice;
        }, 0);
        return sumItems + sumReports;
      }, 0);

      setAllTotal(totalAmount);
    }, [pmtData, date]);
  } else if (currentUser?.role == "fl") {
    useEffect(() => {
      const fetchData = async () => {
        try {
          const q = query(
            collection(db, "fldatas"),
            where("name", "==", currentUser?.name),
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((i) => ({
            id: i.id,
            ...i.data(),
          }));
          setFLData(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [currentUser?.name, isEditing]);

    useEffect(() => {
      const filtered = flData
        .map((item) => ({
          ...item,
          report: item.report.filter((r) => {
            const reportDate = r.createdAt
              ?.toDate()
              ?.toLocaleDateString("en-CA");
            return reportDate === date;
          }),
        }))
        .filter((item) => item.report.length > 0);
      setDateFiltered(filtered);
      const totalAmount = (filtered || []).reduce((sumItems, item) => {
        const reports = item.report || [];
        const sumReports = reports.reduce((sumReport, report) => {
          const sumPrice = (report.price || []).reduce(
            (sumP, p) => sumP + (p.amount || 0),
            0,
          );
          return sumReport + sumPrice;
        }, 0);
        return sumItems + sumReports;
      }, 0);

      setAllTotal(totalAmount);
    }, [flData, date]);
  } else if (currentUser?.role == "admin") {
    useEffect(() => {
      
    })
  }

  /** HANDLERS */
  const handleEdit = ({ id, imei, accId }) => {
    setEditData(dateFiltered);
    setIsEditing("handphone");
    setSelectedId(id);
    setSelectedImei(imei);
    setIdAcc(accId);
  };

  const handleDelete = ({ id, imei, product, color, capacity, accId }) => {
    setSelectedId(id);
    setSelectedImei(imei);
    setIsDeleting("handphone");
    setSelectedProduct(product);
    setSelectedColor(color);
    setSelectedCapacity(capacity);
    setIdAcc(accId);
  };

  const handleEditAcc = ({ id, accId }) => {
    setEditData(dateFiltered);
    setIsEditing("acc");
    setIdAcc(accId);
    setSelectedId(id);
  };

  const handleDeleteAcc = ({ id, product, type, accId }) => {
    setIsDeleting("acc");
    setSelectedId(id);
    setSelectedProduct(product);
    setProductType(type);
    setIdAcc(accId);
  };

  const handleAddStock = () => {
    setAddStock(true);
  };

  return {
    handleAddStock,
    addStock,
    pmtData,
    flData,
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
    handleEditAcc,
    handleDeleteAcc,
    formatRupiah,
    date,
    idAcc,
    allTotal,
    productType,
  };
}
