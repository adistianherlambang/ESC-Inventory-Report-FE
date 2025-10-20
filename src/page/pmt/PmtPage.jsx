import React, { useEffect, useState } from "react";
import { userStore } from "../../state/state";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../../firebase";

//Component
import Loader from "../../components/item/loader/Loader";
import Empty from "../../components/item/Empty/Empty";
import { ActivityIcon } from "../../components/Icon/Icon";
import Logo from "../../../public/Logo";
import { LogoutIcon } from "../../../public/Icon";
import EditSection from "../../components/section/pmt/edit/EditSection";

import styles from "./style.module.css";
import { useStore } from "zustand";

export default function PmtPage() {
  const { currentUser } = userStore();
  const [pmtData, setPmtData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFiltered, setDateFiltered] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [selectedImei, setSelectedImei] = useState(null);

  const navigate = useNavigate();

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

  return (
    <>
      {isEditing ? (
        <EditSection
          isOpen={isEditing}
          docId={selectedId}
          data={editData}
          imei={selectedImei}
        />
      ) : (
        <></>
      )}
      <div
        className={styles.container}
        onClick={
          isEditing || isDeleting
            ? () => {
                setIsDeleting(false);
                setIsEditing(false);
              }
            : undefined
        }
        style={{
          transition: "ease-in 300ms",
          opacity: isEditing || isDeleting ? 0.2 : 1,
        }}
      >
        <div className={styles.topContainer}>
          <Logo />
          <div onClick={logout} className={styles.logoutButton}>
            <LogoutIcon />
            Logout
          </div>
        </div>
        {loading && <Loader />}
        <div className={styles.activityContainer}>
          <div className={styles.activityTitleWrapper}>
            <p className={styles.activityTitle}>Activity</p>
            <ActivityIcon />
          </div>
          {date}
          {dateFiltered.map((item) => (
            <div key={item.id}>
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
                          <p className={styles.type}>{i.userType} {r.type}</p>
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
                        onClick={() => setIsDeleting(true)}
                      >
                        Hapus
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
