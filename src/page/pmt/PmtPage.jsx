import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";

//Component
import Loader from "../../components/item/loader/Loader";
import Empty from "../../components/item/Empty/Empty";
import { ActivityIcon } from "../../components/Icon/Icon";
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";
import EditSection from "../../components/section/pmt/edit/EditSection";
import DeleteSection from "../../components/section/pmt/delete/DeleteSection";
import Product from "../../components/section/product/Product";
import Search from "../../components/section/search/Search";
import Report from "../../components/section/pmt/report/button/Report";
import ReportPopUp from "../../components/section/pmt/report/popup/Report";

//State
import { pmtReport } from "../../state/state";
import { userStore } from "../../state/state";

import styles from "./style.module.css";

export default function PmtPage() {
  const { currentUser } = userStore();
  const [pmtData, setPmtData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFiltered, setDateFiltered] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedImei, setSelectedImei] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedCapacity, setSelectedCapacity] = useState("")

  const navigate = useNavigate();

  const { active, toogleActive, toogleDeact } = pmtReport();

  const logout = userStore((state) => state.logout);
  const now = new Date();
  const date = now.toISOString().split("T")[0];

  const formatRupiah = (value) => {
    if (typeof value !== "number") return value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    try {
      const fetchPmtByName = async () => {
        try {
          const q = query(
            collection(db, "pmtdatas"),
            where("name", "==", currentUser?.name),
          );

          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("fetch berhasil", data);

          setPmtData(data);
        } catch (err) {
          console.error(`error: : ${err}`);
        } finally {
          setLoading(false);
        }
      };
      fetchPmtByName();
    } catch (err) {
      console.error(err);
    }
  }, [currentUser?.name, isEditing]);

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
    console.log("ppp", filtered);
  }, [pmtData, date]);

  const handleEdit = ({ id, imei }) => {
    setEditData(dateFiltered);
    setIsEditing(true);
    setSelectedId(id);
    setSelectedImei(imei);
  };

  const handleDelete = ({ id, imei, product, color, capacity }) => {
    setSelectedId(id);
    setSelectedImei(imei);
    setIsDeleting(true);
    setSelectedProduct(product)
    setSelectedColor(color)
    setSelectedCapacity(capacity)
  };

  return (
    <>
      {isEditing ? (
        <EditSection
          isOpen={isEditing}
          docId={selectedId}
          data={editData}
          imei={selectedImei}
          onClose={() => setIsEditing(!isEditing)}
        />
      ) : (
        <></>
      )}
      {isDeleting ? (
        <DeleteSection
          docId={selectedId}
          imei={selectedImei}
          product={selectedProduct}
          capacity={selectedCapacity}
          color={selectedColor}
          onClose={() => setIsDeleting(!isDeleting)}
        />
      ) : (
        <></>
      )}
      {active ? <ReportPopUp /> : <></>}
      <Report />
      <div
        className={styles.container}
        onClick={() => {
          if (isEditing || isDeleting || active) {
            toogleDeact();
            setIsDeleting(false);
            setIsEditing(false);
          }
        }}
        style={{
          transition: "ease-in 300ms",
          opacity: isEditing || isDeleting || active ? 0.2 : 1,
        }}
      >
        <div className={styles.topContainer}>
          <Logo />
          <div onClick={logout} className={styles.logoutButton}>
            <LogoutIcon />
            Logout
          </div>
        </div>
        {pmtData.map((item) => (
          <div key={item.id} className={styles.top}>
            <div className={styles.pmtContainer}>
              <p>Bismillah, {item.name}👋</p>
              <p className={styles.pmt}>PMT {item.brand}</p>
            </div>
            <Search brand={item.brand} />
          </div>
        ))}
        {loading && <Loader />}
        <div className={styles.activityContainer}>
          <div className={styles.activityTitleContainer}>
            <div className={styles.activityTitleWrapper}>
              <p className={styles.activityTitle}>Activity</p>
              <p className={styles.date}>{date}</p>
            </div>
            <ActivityIcon />
          </div>
          {dateFiltered.map((item) => (
            <div key={item.id} className={styles.activityWrapper}>
              {item.report.map((i) => {
                const totalAmount = i.price.reduce(
                  (sum, item) => sum + item.amount,
                  0,
                );
                return (
                  <div key={i.product} className={styles.activity}>
                    <div className={styles.productContainer}>
                      <p className={styles.productName}>{i.product}</p>
                      <div className={styles.productDetail}>
                        <p>Warna : {i.color}</p>
                        <p>Ukuran: {i.capacity}</p>
                      </div>
                    </div>
                    <div className={styles.priceContainer}>
                      {i.price.map((r) => (
                        <div key={r.amount} className={styles.price}>
                          <p className={styles.priceAmount}>
                            {formatRupiah(r.amount)}
                          </p>
                          <p className={styles.type}>
                            {i.userType} {r.type}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className={styles.totalPriceContainer}>
                      <p>Total :</p>
                      <p>{formatRupiah(totalAmount)}</p>
                    </div>
                    <div className={styles.buttonContainer}>
                      <div
                        className={styles.editButton}
                        onClick={() =>
                          handleEdit({ id: item.id, imei: i.IMEI })
                        }
                      >
                        Edit
                      </div>
                      <div
                        className={styles.deleteButton}
                        onClick={() =>
                          handleDelete({
                            id: item.id,
                            imei: i.IMEI,
                            product: i.product,
                            color: i.color,
                            capacity: i.capacity,
                          })
                        }
                      >
                        Batalkan
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
