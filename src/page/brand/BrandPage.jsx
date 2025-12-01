import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../../../firebase";
import { getDoc, getDocs, collection, where, query } from "firebase/firestore";

import Loader from "../../components/item/loader/Loader";
import Empty from "../../components/item/Empty/Empty";
import Search from "../../components/section/fl/product/search/Search";
import AddStock from "../../components/section/fl/stock/popup/AddStock";
import NewStock from "../../components/section/fl/stock/popup/NewStock";

import styles from "./style.module.css";

import { pmtReport } from "../../state/state";

export default function BrandPage() {
  const { label } = useParams();

  const { stock, toogleStockActive, toogleStockDeact } = pmtReport();

  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    console.log("stock")
  }, [])

  return (
    <>
      <div>
        <div className={styles.top}>
          <div className={styles.backButton} onClick={handleBack}>
            <svg
              width="10"
              height="18"
              viewBox="0 0 10 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M2.50513 8.8061L9.84372 16.1447L8.37621 17.6122L0.303866 9.53985C0.109301 9.34523 0 9.0813 0 8.8061C0 8.5309 0.109301 8.26697 0.303866 8.07234L8.37621 0L9.84372 1.46751L2.50513 8.8061Z"
                fill="#773FF9"
              />
            </svg>
          </div>
          <p className={styles.topTitle}>{label}</p>
        </div>
        <div className={styles.container}>
          <Search brand={label.toLowerCase()} />
        </div>
      </div>
    </>
  );
}
